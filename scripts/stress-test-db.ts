import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables (URL or SERVICE_ROLE_KEY).');
  process.exit(1);
}

// Create Admin Client with Service Role Key (Bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runTest(name: string, fn: () => Promise<void>) {
  process.stdout.write(`Testing ${name}... `);
  try {
    await fn();
    console.log('✅ PASS');
  } catch (error: any) {
    console.log('❌ FAIL');
    console.error(`  Error: ${error.message}`);
    if (error.details) console.error('  Details:', error.details);
    if (error.hint) console.error('  Hint:', error.hint);
  }
}

async function main() {
  console.log('🚀 Starting Database Stress Test (Direct DB Access)...');
  
  const testSlug = `stress-test-db-${Date.now()}`;
  const testProduct = {
    id: testSlug, // ID is usually the slug in this codebase
    slug: testSlug,
    title: 'Stress Test Product (DB)',
    description: 'Direct DB insertion test.',
    price: 99.99,
    images: ['https://example.com/db-test.jpg'],
    condition: 'New',
    category: 'Test',
    brand: 'TestBrand',
    payee_email: 'test@example.com',
    checkout_link: 'https://example.com/checkout',
    currency: 'USD',
    in_stock: true,
    is_featured: false,
    meta: { source: 'stress-test' },
  };

  // Test 1: Create Product (Insert)
  await runTest('Create Product (Direct Insert)', async () => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (error) throw error;
    if (data.slug !== testSlug) throw new Error('Slug mismatch');
  });

  // Test 2: Duplicate Key Violation
  await runTest('Duplicate Slug Violation', async () => {
    const { error } = await supabaseAdmin
      .from('products')
      .insert(testProduct); // Same ID/Slug

    if (!error) throw new Error('Duplicate insert should have failed');
    if (error.code !== '23505') throw new Error(`Expected error code 23505 (unique violation), got ${error.code}`);
  });

  // Test 3: Missing Required Field
  await runTest('Missing Required Field (Title)', async () => {
    const invalidProduct = { ...testProduct, id: testSlug + '-invalid', slug: testSlug + '-invalid' };
    delete (invalidProduct as any).title;

    const { error } = await supabaseAdmin
      .from('products')
      .insert(invalidProduct);

    if (!error) throw new Error('Insert with missing title should have failed');
    if (error.code !== '23502') throw new Error(`Expected error code 23502 (not null violation), got ${error.code}`);
  });

  // Test 4: Update Product
  await runTest('Update Product', async () => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ title: 'Updated Title (DB)', price: 150.00 })
      .eq('slug', testSlug)
      .select()
      .single();

    if (error) throw error;
    if (data.title !== 'Updated Title (DB)') throw new Error('Title update failed');
  });

  // Test 5: Partial Update (Empty String for Required Field)
  // The API ignores this, but DB allows empty string unless CHECK constraint exists.
  await runTest('Update Required Field to Empty String', async () => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ title: '' }) // Empty string
      .eq('slug', testSlug)
      .select()
      .single();

    if (error) throw error;
    if (data.title !== '') throw new Error('DB should allow empty string if no CHECK constraint');
  });

  // Test 6: Invalid Type (String for Number) - Supabase/Postgres should reject or cast
  await runTest('Update Price with String', async () => {
    // Note: JS client might handle this, or PG might cast if format is valid number string.
    // Sending invalid format:
    const { error } = await supabaseAdmin
      .from('products')
      .update({ price: 'not-a-number' as any })
      .eq('slug', testSlug);

    if (!error) throw new Error('Update with invalid number string should fail');
    if (error.code !== '22P02') throw new Error(`Expected error code 22P02 (invalid text representation), got ${error.code}`);
  });

  // Test 7: Race Condition (Parallel Updates)
  await runTest('Parallel Updates (Race Condition)', async () => {
    const updates = Array.from({ length: 5 }).map((_, i) => 
      supabaseAdmin
        .from('products')
        .update({ review_count: i + 100 })
        .eq('slug', testSlug)
    );
    
    await Promise.all(updates);
    
    // Check final state (should be one of them)
    const { data } = await supabaseAdmin.from('products').select('review_count').eq('slug', testSlug).single();
    // Success if we didn't crash
  });

  // Cleanup
  await runTest('Cleanup', async () => {
    const { error } = await supabaseAdmin.from('products').delete().eq('slug', testSlug);
    if (error) throw error;
  });

  console.log('\n✨ Database stress test completed.');
}

main().catch(console.error);
