import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { getProductBySlug } from '@/lib/supabase/products';

export const runtime = 'nodejs';

function getFileExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop();
    if (!ext || ext.length > 10) {
      return 'jpg';
    }
    return ext.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
  } catch (error) {
    return 'jpg';
  }
}

function isRemoteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Format product data for export (compatible with bulk import)
 * Images array should contain filenames, not URLs
 */
function formatProductForExport(product: any): any {
  const {
    id,
    slug,
    title,
    description,
    price,
    rating,
    reviewCount,
    review_count,
    condition,
    category,
    brand,
    payeeEmail,
    payee_email,
    currency,
    checkoutLink,
    checkout_link,
    reviews,
    meta,
    inStock,
    in_stock,
    isFeatured,
    is_featured,
    listedBy,
    listed_by,
  } = product;

  // Format to match bulk import expectations (supports both camelCase and snake_case)
  const checkoutLinkValue = checkoutLink || checkout_link || '';
  
  return {
    slug,
    id: id || slug,
    title,
    description,
    price,
    condition,
    category,
    brand,
    checkout_link: checkoutLinkValue, // Primary format (snake_case)
    checkoutLink: checkoutLinkValue,   // Also include camelCase for compatibility
    payee_email: payeeEmail || payee_email || '',
    currency: currency || 'USD',
    rating: rating || 0,
    review_count: reviewCount || review_count || 0,
    reviews: reviews || [],
    meta: meta || {},
    in_stock: inStock !== undefined ? inStock : (in_stock !== undefined ? in_stock : true),
    inStock: inStock !== undefined ? inStock : (in_stock !== undefined ? in_stock : true),
    is_featured: isFeatured || is_featured || false,
    isFeatured: isFeatured || is_featured || false,
    listed_by: listedBy || listed_by || null,
    images: [] as string[], // Will be populated with filenames
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slugs } = body;

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        { error: 'No product slugs provided' },
        { status: 400 }
      );
    }

    const zip = new AdmZip();
    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each product
    for (const slug of slugs) {
      try {
        // Fetch product data (include drafts for admin export)
        const product = await getProductBySlug(slug, true);

        if (!product) {
          errorCount++;
          errors.push(`${slug}: Product not found`);
          continue;
        }

        // Format product data
        const productData = formatProductForExport(product);
        
        // Process images - download and rename to img1, img2, etc.
        const images: string[] = Array.isArray(product.images) ? product.images : [];
        const imageFilenames: string[] = [];

        for (let index = 0; index < images.length; index++) {
          const imageUrl = images[index];
          if (!imageUrl) continue;

          // Skip if it's not a remote URL (shouldn't happen, but handle gracefully)
          if (!isRemoteUrl(imageUrl)) {
            // If it's already a filename, use it
            imageFilenames.push(imageUrl);
            continue;
          }

          try {
            // Download image
            const response = await fetch(imageUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch image (${response.status})`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const extension = getFileExtension(imageUrl);
            const filename = `img${index + 1}.${extension}`;
            const imageBuffer = Buffer.from(arrayBuffer);

            // Add image to ZIP in product folder
            const imagePath = `${slug}/${filename}`;
            zip.addFile(imagePath, imageBuffer);

            // Add filename to images array
            imageFilenames.push(filename);
          } catch (error: any) {
            console.error(`Failed to download image ${imageUrl} for ${slug}:`, error);
            // Continue with other images even if one fails
          }
        }

        // Add images array to product data (as filenames, not URLs)
        productData.images = imageFilenames;

        // Add product.json to ZIP in product folder
        const productJson = JSON.stringify(productData, null, 2);
        const productJsonPath = `${slug}/product.json`;
        zip.addFile(productJsonPath, Buffer.from(productJson, 'utf8'));

        processedCount++;
      } catch (error: any) {
        errorCount++;
        errors.push(`${slug}: ${error.message || 'Unknown error'}`);
        console.error(`Error processing product ${slug}:`, error);
      }
    }

    if (processedCount === 0) {
      return NextResponse.json(
        { error: 'No products were successfully processed', errors },
        { status: 400 }
      );
    }

    // Generate ZIP buffer
    const zipBuffer = zip.toBuffer();

    // Generate filename
    const filename = slugs.length === 1 
      ? `${slugs[0]}.zip`
      : `products-export-${new Date().toISOString().split('T')[0]}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (error: any) {
    console.error('Error creating bulk export:', error);
    return NextResponse.json(
      { error: `Failed to generate export: ${error.message}` },
      { status: 500 }
    );
  }
}



