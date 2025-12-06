import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { createClient } from '@supabase/supabase-js';

// Direct Supabase client for migration (without server-only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const PRODUCTS_DIR = join(process.cwd(), 'public/products');
const BUCKET_NAME = 'product-images';

interface ImageMapping {
  productSlug: string;
  oldPath: string;
  newPath: string;
  storageUrl: string;
}

async function uploadImages() {
  console.log('🚀 Starting image upload to Supabase Storage...\n');

  try {
    // Get all product directories
    const productDirs = readdirSync(PRODUCTS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📦 Found ${productDirs.length} product directories\n`);

    let totalImages = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const imageMappings: ImageMapping[] = [];

    // Process each product directory
    for (const productSlug of productDirs) {
      try {
        const productDir = join(PRODUCTS_DIR, productSlug);
        const files = readdirSync(productDir)
          .filter(file => {
            const ext = extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
          })
          .sort(); // Sort to maintain order (img1, img2, etc.)

        if (files.length === 0) {
          console.log(`⚠️  No images found for ${productSlug}, skipping...`);
          continue;
        }

        console.log(`📸 Processing ${productSlug} (${files.length} images)...`);

        const uploadedPaths: string[] = [];

        // Upload each image
        for (const file of files) {
          try {
            const filePath = join(productDir, file);
            const fileContent = readFileSync(filePath);
            const fileBuffer = Buffer.from(fileContent);

            // Storage path: product-slug/filename
            const storagePath = `${productSlug}/${file}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
              .from(BUCKET_NAME)
              .upload(storagePath, fileBuffer, {
                contentType: getContentType(file),
                upsert: true // Overwrite if exists
              });

            if (uploadError) {
              throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Get public URL
            const { data: { publicUrl } } = supabaseAdmin.storage
              .from(BUCKET_NAME)
              .getPublicUrl(storagePath);

            // Store mapping for database update
            const oldPath = `/products/${productSlug}/${file}`;
            imageMappings.push({
              productSlug,
              oldPath,
              newPath: storagePath,
              storageUrl: publicUrl
            });

            uploadedPaths.push(publicUrl);
            successCount++;
            totalImages++;

            process.stdout.write(`  ✅ ${file}\n`);
          } catch (fileError: any) {
            errorCount++;
            const errorMsg = `  ❌ Failed to upload ${file}: ${fileError.message}`;
            errors.push(errorMsg);
            console.error(errorMsg);
          }
        }

        // Update product in database with new image URLs
        if (uploadedPaths.length > 0) {
          const { error: updateError } = await supabaseAdmin
            .from('products')
            .update({ images: uploadedPaths })
            .eq('slug', productSlug);

          if (updateError) {
            console.error(`  ⚠️  Failed to update database for ${productSlug}: ${updateError.message}`);
          } else {
            console.log(`  ✅ Updated database with ${uploadedPaths.length} images\n`);
          }
        }
      } catch (productError: any) {
        errorCount++;
        const errorMsg = `❌ Failed to process ${productSlug}: ${productError.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Upload Summary:`);
    console.log(`   ✅ Images uploaded: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Products processed: ${productDirs.length}`);
    console.log('='.repeat(60) + '\n');

    if (errors.length > 0) {
      console.log('❌ Errors encountered:\n');
      errors.forEach(err => console.log(`   ${err}`));
      console.log('');
    }

    if (successCount > 0) {
      console.log('🎉 Image upload completed successfully!');
      console.log('\n✨ All image URLs have been updated in the database.');
      console.log('💡 You can now delete images from /public/products/ if you want (optional)');
    }
  } catch (error: any) {
    console.error('💥 Fatal error during upload:', error);
    process.exit(1);
  }
}

function getContentType(filename: string): string {
  const ext = extname(filename).toLowerCase();
  const types: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  return types[ext] || 'image/jpeg';
}

// Run upload
uploadImages()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Upload failed:', error);
    process.exit(1);
  });

