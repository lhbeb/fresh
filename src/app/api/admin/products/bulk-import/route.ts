import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import AdmZip from 'adm-zip';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const MAX_ZIP_SIZE = 8 * 1024 * 1024; // 8MB
const STORAGE_BUCKET = 'product-images';

interface ProductJson {
  slug: string;
  id?: string;
  title: string;
  description: string;
  price: number | string;
  images: string[];
  condition: string;
  category: string;
  brand: string;
  payeeEmail?: string;
  payee_email?: string;
  checkoutLink?: string;
  checkout_link?: string;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  review_count?: number;
  reviews?: any[];
  meta?: any;
  inStock?: boolean;
  in_stock?: boolean;
}

interface ImportResult {
  success: boolean;
  productSlug?: string;
  error?: string;
}

function isRemoteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

async function uploadImageToSupabase(
  imageBuffer: Buffer,
  productSlug: string,
  imageName: string,
  index: number
): Promise<string> {
  const extension = path.extname(imageName) || '.jpg';
  const cleanSlug = productSlug.replace(/[^a-zA-Z0-9-_]/g, '-');
  const fileName = `img${index + 1}${extension}`;
  const storagePath = `${cleanSlug}/${fileName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, imageBuffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: `image/${extension.substring(1).toLowerCase()}`,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed for ${storagePath}: ${uploadError.message}`);
  }

  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  if (!data?.publicUrl) {
    throw new Error(`Unable to retrieve public URL for ${storagePath}`);
  }

  return data.publicUrl;
}

async function processProductFromZip(
  productDir: string,
  zip: AdmZip,
  zipEntries: AdmZip.IZipEntry[]
): Promise<ImportResult> {
  // Normalize directory path (remove trailing slash, handle different separators)
  const normalizedDir = productDir.replace(/\\/g, '/').replace(/\/$/, '');
  
  // Find product.json in the directory
  // Match entries like: "product-slug/product.json" or "product-slug\\product.json"
  const productJsonEntry = zipEntries.find(
    (entry) => {
      const entryPath = entry.entryName.replace(/\\/g, '/');
      const expectedPath = `${normalizedDir}/product.json`;
      return entryPath === expectedPath && !entry.isDirectory;
    }
  );

  if (!productJsonEntry) {
    return {
      success: false,
      error: `product.json not found in ${productDir}`,
    };
  }

  // Read and parse product.json
  let productData: ProductJson;
  try {
    const jsonContent = zip.readAsText(productJsonEntry);
    productData = JSON.parse(jsonContent);
  } catch (error: any) {
    return {
      success: false,
      error: `Invalid JSON in product.json: ${error.message}`,
    };
  }

  // Validate required fields
  const slug = productData.slug?.trim();
  if (!slug) {
    return {
      success: false,
      error: 'Missing required field: slug',
    };
  }

  const checkoutLink = productData.checkoutLink || productData.checkout_link;
  if (!checkoutLink) {
    return {
      success: false,
      error: `Missing required field: checkoutLink for product ${slug}`,
    };
  }

  const requiredFields = ['title', 'description', 'price', 'condition', 'category', 'brand'];
  for (const field of requiredFields) {
    if (!productData[field as keyof ProductJson]) {
      return {
        success: false,
        error: `Missing required field: ${field} for product ${slug}`,
      };
    }
  }

  // Validate and process images
  const imageEntries = productData.images || [];
  if (!Array.isArray(imageEntries) || imageEntries.length === 0) {
    return {
      success: false,
      error: `No images found in images array for product ${slug}`,
    };
  }

  // Upload images to Supabase
  const uploadedImageUrls: string[] = [];

  for (let i = 0; i < imageEntries.length; i++) {
    const imageName = imageEntries[i];
    if (!imageName) continue;

    // If it's a remote URL, use it directly
    if (isRemoteUrl(imageName)) {
      uploadedImageUrls.push(imageName);
      continue;
    }

    // Find the image file in ZIP
    // Handle both "product-slug/image.jpg" and "product-slug/subfolder/image.jpg"
    // normalizedDir was already defined at the start of function
    const imageEntry = zipEntries.find(
      (entry) => {
        const entryPath = entry.entryName.replace(/\\/g, '/');
        // Check if entry is in the product directory and matches the image name
        const isInDir = entryPath.startsWith(normalizedDir + '/');
        const matchesName = entryPath === `${normalizedDir}/${imageName}` || 
                           entryPath.endsWith(`/${imageName}`);
        return isInDir && matchesName && !entry.isDirectory;
      }
    );

    if (!imageEntry) {
      return {
        success: false,
        error: `Image file not found in ZIP: ${imageName} for product ${slug}`,
      };
    }

    try {
      const imageBuffer = zip.readFile(imageEntry);
      if (!imageBuffer) {
        return {
          success: false,
          error: `Failed to read image file: ${imageName} for product ${slug}`,
        };
      }

      const publicUrl = await uploadImageToSupabase(imageBuffer, slug, imageName, i);
      uploadedImageUrls.push(publicUrl);
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to upload image ${imageName}: ${error.message}`,
      };
    }
  }

  if (uploadedImageUrls.length === 0) {
    return {
      success: false,
      error: `No images were successfully processed for product ${slug}`,
    };
  }

  // Prepare product data for Supabase
  const price = typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price;
  if (Number.isNaN(price) || price <= 0) {
    return {
      success: false,
      error: `Invalid price for product ${slug}`,
    };
  }

  const productPayload = {
    id: productData.id || slug,
    slug,
    title: productData.title,
    description: productData.description,
    price,
    images: uploadedImageUrls,
    condition: productData.condition,
    category: productData.category,
    brand: productData.brand,
    payee_email: (productData.payeeEmail || productData.payee_email || '').trim() || null,
    checkout_link: checkoutLink,
    currency: productData.currency || 'USD',
    rating: productData.rating || 0,
    review_count: productData.review_count || productData.reviewCount || 0,
    reviews: productData.reviews || [],
    meta: productData.meta || {},
    in_stock: productData.in_stock !== undefined ? productData.in_stock : (productData.inStock !== undefined ? productData.inStock : true),
  };

  // Upsert product to database
  try {
    const { error: upsertError } = await supabaseAdmin
      .from('products')
      .upsert(productPayload, { onConflict: 'slug' });

    if (upsertError) {
      return {
        success: false,
        error: `Database error for ${slug}: ${upsertError.message}`,
      };
    }

    return {
      success: true,
      productSlug: slug,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Unexpected error saving product ${slug}: ${error.message}`,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the ZIP file from form data
    const formData = await request.formData();
    const zipFile = formData.get('zipFile') as File;

    if (!zipFile) {
      return NextResponse.json(
        { error: 'No ZIP file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!zipFile.name.endsWith('.zip') && zipFile.type !== 'application/zip' && zipFile.type !== 'application/x-zip-compressed') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a ZIP file.' },
        { status: 400 }
      );
    }

    // Validate file size (8MB limit)
    if (zipFile.size > MAX_ZIP_SIZE) {
      return NextResponse.json(
        { error: `ZIP file too large. Maximum size is ${MAX_ZIP_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      );
    }

    if (zipFile.size === 0) {
      return NextResponse.json(
        { error: 'ZIP file is empty' },
        { status: 400 }
      );
    }

    // Read ZIP file into buffer
    const arrayBuffer = await zipFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract ZIP
    let zip: AdmZip;
    try {
      zip = new AdmZip(buffer);
    } catch (error: any) {
      return NextResponse.json(
        { error: `Invalid ZIP file: ${error.message}` },
        { status: 400 }
      );
    }

    const zipEntries = zip.getEntries();

    if (zipEntries.length === 0) {
      return NextResponse.json(
        { error: 'ZIP file is empty' },
        { status: 400 }
      );
    }

    // Find all product directories (directories containing product.json)
    const productDirs = new Set<string>();
    for (const entry of zipEntries) {
      if (!entry.isDirectory) {
        const entryPath = entry.entryName.replace(/\\/g, '/');
        // Check if entry is a product.json file
        if (entryPath.endsWith('/product.json') || entryPath === 'product.json') {
          const lastSlash = entryPath.lastIndexOf('/');
          if (lastSlash > 0) {
            const dirPath = entryPath.substring(0, lastSlash);
            productDirs.add(dirPath);
          } else if (entryPath === 'product.json') {
            // Handle root-level product.json (though not recommended)
            productDirs.add('');
          }
        }
      }
    }

    if (productDirs.size === 0) {
      return NextResponse.json(
        { error: 'No product.json files found in ZIP. Each product should be in its own folder with a product.json file.' },
        { status: 400 }
      );
    }

    // Process each product
    const results: ImportResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const productDir of productDirs) {
      const result = await processProductFromZip(productDir, zip, zipEntries);
      results.push(result);
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: productDirs.size,
        successful: successCount,
        failed: failedCount,
      },
      results,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      {
        error: `Unexpected error during bulk import: ${error.message}`,
        success: false,
      },
      { status: 500 }
    );
  }
}

