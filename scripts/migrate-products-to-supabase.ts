import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
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

const PRODUCTS_DIR = join(process.cwd(), 'src/lib/products-raw');

interface ProductJSON {
  id?: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  images: string[];
  condition: string;
  category: string;
  brand: string;
  payeeEmail?: string;
  payee_email?: string;
  currency?: string;
  checkoutLink?: string;
  checkout_link?: string;
  reviews?: any[];
  meta?: any;
}

async function migrateProducts() {
  console.log('🚀 Starting product migration to Supabase...\n');

  try {
    // Get all product directories
    const productDirs = readdirSync(PRODUCTS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📦 Found ${productDirs.length} products to migrate\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each product
    for (const dir of productDirs) {
      try {
        const productPath = join(PRODUCTS_DIR, dir, 'product.json');
        const productData: ProductJSON = JSON.parse(readFileSync(productPath, 'utf-8'));

        // Transform camelCase to snake_case for database
        const dbProduct = {
          id: productData.id || productData.slug,
          slug: productData.slug,
          title: productData.title,
          description: productData.description,
          price: productData.price,
          rating: productData.rating || 0,
          review_count: productData.reviewCount || 0,
          images: productData.images || [],
          condition: productData.condition,
          category: productData.category,
          brand: productData.brand,
          payee_email: productData.payeeEmail || productData.payee_email || '',
          checkout_link: productData.checkoutLink || productData.checkout_link || '',
          currency: productData.currency || 'USD',
          reviews: productData.reviews || [],
          meta: productData.meta || {},
          in_stock: productData.inStock !== undefined ? productData.inStock : true,
        };

        // Validate required fields
        if (!dbProduct.slug || !dbProduct.title || !dbProduct.description) {
          throw new Error(`Missing required fields for ${dir}`);
        }

        // Insert or update product (upsert)
        const { error } = await supabaseAdmin
          .from('products')
          .upsert(dbProduct, {
            onConflict: 'slug',
          });

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        successCount++;
        console.log(`✅ Migrated: ${productData.title.substring(0, 50)}...`);
      } catch (error: any) {
        errorCount++;
        const errorMsg = `❌ Failed to migrate ${dir}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Migration Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50) + '\n');

    if (errors.length > 0) {
      console.log('❌ Errors encountered:\n');
      errors.forEach(err => console.log(`   ${err}`));
      console.log('');
    }

    if (successCount > 0) {
      console.log('🎉 Migration completed successfully!');
    }
  } catch (error: any) {
    console.error('💥 Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run migration
migrateProducts()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });

