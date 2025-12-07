import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = 'elmahboubimehdi@gmail.com';
const password = 'Localserver!!2';

async function getAuthToken() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error('Authentication failed: ' + (error?.message || 'No session'));
  }
  return data.session.access_token;
}

async function runTest(name: string, fn: () => Promise<void>) {
  process.stdout.write(`Testing ${name}... `);
  try {
    await fn();
    console.log('✅ PASS');
  } catch (error: any) {
    console.log('❌ FAIL');
    console.error(`  Error: ${error.message}`);
    if (error.cause) console.error('  Cause:', error.cause);
  }
}

async function main() {
  console.log('🚀 Starting Product Stress Test...');
  
  let token: string;
  try {
    token = await getAuthToken();
    console.log('🔑 Authenticated successfully');
  } catch (e: any) {
    console.error('❌ Failed to authenticate:', e.message);
    process.exit(1);
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const testSlug = `stress-test-${Date.now()}`;
  const testProduct = {
    slug: testSlug,
    title: 'Stress Test Product',
    description: 'This is a test product created by the stress test script.',
    price: 99.99,
    images: ['https://example.com/image1.jpg'],
    condition: 'New',
    category: 'Test',
    brand: 'TestBrand',
    checkout_link: 'https://example.com/checkout',
    currency: 'USD',
    in_stock: true,
  };

  // Test 1: Create Valid Product
  await runTest('Create Valid Product', async () => {
    const res = await fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testProduct),
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Status ${res.status}: ${text}`);
    }
    
    const data = await res.json();
    if (data.slug !== testSlug) throw new Error('Created product slug mismatch');
  });

  // Test 2: Create Duplicate Product (Should Fail)
  await runTest('Create Duplicate Product', async () => {
    const res = await fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testProduct),
    });
    
    // Expect 500 or 400 (currently 500 based on code analysis)
    if (res.ok) throw new Error('Duplicate creation should have failed but succeeded');
    // We accept failure here as success of the test
  });

  // Test 3: Update Product (Normal)
  await runTest('Update Product (Normal)', async () => {
    const res = await fetch(`${API_URL}/admin/products/${testSlug}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        title: 'Updated Stress Test Product',
        price: 100.00
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Status ${res.status}: ${text}`);
    }
    
    const data = await res.json();
    if (data.title !== 'Updated Stress Test Product') throw new Error('Title not updated');
    if (data.price !== 100) throw new Error('Price not updated');
  });

  // Test 4: Update with Empty String for Required Field (Should handle gracefully or fail)
  await runTest('Update Required Field to Empty', async () => {
    const res = await fetch(`${API_URL}/admin/products/${testSlug}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        title: '', // Required field
      }),
    });

    // The current implementation ignores empty strings for required fields
    // So this should succeed but NOT update the title
    if (!res.ok) {
       const text = await res.text();
       throw new Error(`Status ${res.status}: ${text}`);
    }
    
    const data = await res.json();
    if (data.title === '') throw new Error('Title should not have been updated to empty string');
  });

  // Test 5: Update with Invalid Data Types
  await runTest('Update with Invalid Types', async () => {
    const res = await fetch(`${API_URL}/admin/products/${testSlug}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        price: "invalid-price", // Should be number
      }),
    });
    
    // The implementation might parse or fail. Code does `parseFloat(formData.price)` on client,
    // but API receives JSON. `updateProduct` checks `typeof updates.price === 'number'`.
    // If we send a string "invalid-price", `updateProduct` might skip it or fail if Postgres rejects it.
    // Ideally it returns 200 (ignored) or 400.
    
    // Actually `updateProduct` checks: `if (updates.price !== undefined ... && typeof updates.price === 'number' ...)`
    // So sending a string will be IGNORED.
    
    if (!res.ok) {
       // If it fails, that's fine too, but we want to know WHY.
       // Current code returns 200 but ignores it.
       return; 
    }
  });

  // Test 6: Rename Slug
  const newSlug = `stress-test-renamed-${Date.now()}`;
  await runTest('Rename Slug', async () => {
    const res = await fetch(`${API_URL}/admin/products/${testSlug}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        slug: newSlug,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Status ${res.status}: ${text}`);
    }
    
    const data = await res.json();
    if (data.slug !== newSlug) throw new Error('Slug not updated');
  });

  // Test 7: Clean Up (Delete Renamed Product)
  await runTest('Delete Product', async () => {
    const res = await fetch(`${API_URL}/admin/products/${newSlug}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Status ${res.status}: ${text}`);
    }
  });
  
  console.log('\n✨ Stress test completed.');
}

main().catch(console.error);
