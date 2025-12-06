import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = 'product-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface ProductFile {
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
  meta?: Record<string, any>;
  inStock?: boolean;
  in_stock?: boolean;
}

function color(msg: string, code: string) {
  return `\u001b[${code}m${msg}\u001b[0m`;
}

function info(msg: string) {
  console.log(color(msg, '36'));
}

function success(msg: string) {
  console.log(color(msg, '32'));
}

function warn(msg: string) {
  console.warn(color(msg, '33'));
}

function error(msg: string) {
  console.error(color(msg, '31'));
}

function isRemoteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

async function uploadImage(productSlug: string, imagePath: string, index: number): Promise<string> {
  const fileBuffer = await fs.readFile(imagePath);
  const extension = path.extname(imagePath) || '.jpg';
  const cleanSlug = productSlug.replace(/[^a-zA-Z0-9-_]/g, '-');
  const fileName = `img${index + 1}${extension}`;
  const storagePath = `${cleanSlug}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed for ${storagePath}: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  if (!data?.publicUrl) {
    throw new Error(`Unable to retrieve public URL for ${storagePath}`);
  }

  return data.publicUrl;
}

async function processProductDirectory(dirPath: string) {
  const productJsonPath = path.join(dirPath, 'product.json');
  if (!existsSync(productJsonPath)) {
    warn(`Skipping ${dirPath} → product.json not found.`);
    return { skipped: true };
  }

  const rawJson = await fs.readFile(productJsonPath, 'utf-8');
  const productData = JSON.parse(rawJson) as ProductFile;

  const slug = productData.slug?.trim();
  if (!slug) {
    warn(`Skipping ${dirPath} → slug is required.`);
    return { skipped: true };
  }

  const checkoutLink = productData.checkoutLink || productData.checkout_link;
  if (!checkoutLink) {
    warn(`Skipping ${slug} → checkoutLink is required.`);
    return { skipped: true };
  }

  const imageEntries = productData.images || [];
  if (!Array.isArray(imageEntries) || imageEntries.length === 0) {
    warn(`Skipping ${slug} → images array is required.`);
    return { skipped: true };
  }

  info(`\nProcessing ${slug} ...`);

  const resolvedImageUrls: string[] = [];

  for (let i = 0; i < imageEntries.length; i++) {
    const entry = imageEntries[i];
    if (!entry) continue;

    if (isRemoteUrl(entry)) {
      resolvedImageUrls.push(entry);
      continue;
    }

    const localImagePath = path.join(dirPath, entry);
    if (!existsSync(localImagePath)) {
      throw new Error(`Image file not found: ${localImagePath}`);
    }

    info(`  ↳ Uploading ${entry} as img${i + 1}`);
    const publicUrl = await uploadImage(slug, localImagePath, i);
    resolvedImageUrls.push(publicUrl);
  }

  const price = typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price;
  if (Number.isNaN(price)) {
    throw new Error(`Invalid price for ${slug}.`);
  }

  const payload = {
    id: productData.id || slug,
    slug,
    title: productData.title,
    description: productData.description,
    price,
    images: resolvedImageUrls,
    condition: productData.condition,
    category: productData.category,
    brand: productData.brand,
    payee_email: (productData.payeeEmail || productData.payee_email || '').trim(),
    checkout_link: checkoutLink,
    currency: productData.currency || 'USD',
    rating: productData.rating || 0,
    review_count: productData.review_count || productData.reviewCount || 0,
    reviews: productData.reviews || [],
    meta: productData.meta || {},
    in_stock: productData.in_stock !== undefined ? productData.in_stock : (productData.inStock !== undefined ? productData.inStock : true),
  };

  const { error: upsertError } = await supabase
    .from('products')
    .upsert(payload, { onConflict: 'slug' });

  if (upsertError) {
    throw new Error(`Supabase upsert failed for ${slug}: ${upsertError.message}`);
  }

  success(`  ✓ Imported ${slug}`);
  return { skipped: false };
}

async function main() {
  const folderArg = process.argv[2];
  if (!folderArg) {
    error('Usage: npm run import-products -- <path-to-products-folder>');
    process.exit(1);
  }

  const productsRoot = path.resolve(folderArg);
  if (!existsSync(productsRoot)) {
    error(`Folder not found: ${productsRoot}`);
    process.exit(1);
  }

  info(`Scanning ${productsRoot} for product directories...`);

  const entries = await fs.readdir(productsRoot, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory());

  if (directories.length === 0) {
    warn('No product directories found. Each product should be inside its own folder.');
    return;
  }

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const dir of directories) {
    const productDir = path.join(productsRoot, dir.name);
    try {
      const result = await processProductDirectory(productDir);
      if (result.skipped) {
        skipped += 1;
      } else {
        imported += 1;
      }
    } catch (err: any) {
      failed += 1;
      error(`  ✗ Failed ${dir.name}: ${err.message}`);
    }
  }

  console.log('\n-------------------------------');
  console.log(`Imported: ${imported}`);
  console.log(`Skipped : ${skipped}`);
  console.log(`Failed  : ${failed}`);
  console.log('-------------------------------\n');

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});


