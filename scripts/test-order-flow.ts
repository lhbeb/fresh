import { saveOrder } from '../src/lib/supabase/orders';
import { sendOrderEmail } from '../src/lib/email/sender';
import { getOrderById } from '../src/lib/supabase/orders';
import { resolveBaseUrl } from '../src/lib/url';

/**
 * Test script to simulate a complete order yes flow
 * Run with: npx tsx scripts/test-order-flow.ts
 */

async function testOrderFlow() {
  console.log('🧪 Starting order flow test...\n');

  const siteUrl = resolveBaseUrl([
    process.env.APP_BASE_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    'http://localhost:3000',
  ]);

  // Test data
  const testOrderData = {
    productSlug: 'test-product-' + Date.now(),
    productTitle: 'Test Product - ' + new Date().toISOString(),
    productPrice: 99.99,
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '+1234567890',
    shippingAddress: '123 Test Street',
    shippingCity: 'Test City',
    shippingState: 'CA',
    shippingZip: '12345',
    fullOrderData: {
      test: true,
      timestamp: new Date().toISOString(),
      siteUrl,
    },
  };

  try {
    // STEP 1: Save order to database
    console.log('📦 STEP 1: Saving order to Supabase...');
    console.log('Order data:', JSON.stringify(testOrderData, null, 2));
    
    const saveResult = await saveOrder(testOrderData);
    
    if (!saveResult.success) {
      console.error('❌ Failed to save order:', saveResult.error);
      process.exit(1);
    }

    console.log('✅ Order saved successfully!');
    console.log('Order ID:', saveResult.id);
    console.log('');

    // STEP 2: Fetch the order from database
    console.log('🔍 STEP 2: Fetching order from database...');
    const order = await getOrderById(saveResult.id!);

    if (!order) {
      console.error('❌ Failed to fetch order from database');
      process.exit(1);
    }

    console.log('✅ Order fetched successfully!');
    console.log('Order details:', {
      id: order.id,
      product_title: order.product_title,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      email_sent: order.email_sent,
    });
    console.log('');

    // STEP 3: Send email
    console.log('📧 STEP 3: Sending email...');
    const emailResult = await sendOrderEmail(order);

    if (!emailResult.success) {
      console.error('❌ Failed to send email:', emailResult.error);
      console.log('');
      console.log('⚠️  Order was saved but email failed. This is expected if email credentials are wrong.');
      console.log('Order ID:', saveResult.id);
      console.log('You can check the order in Supabase and retry email from admin dashboard.');
      process.exit(0);
    }

    console.log('✅ Email sent successfully!');
    console.log('');

    // STEP 4: Verify order was updated
    console.log('🔍 STEP 4: Verifying order email status...');
    const updatedOrder = await getOrderById(saveResult.id!);

    if (!updatedOrder) {
      console.error('❌ Failed to fetch updated order');
      process.exit(1);
    }

    console.log('✅ Order email status:', {
      email_sent: updatedOrder.email_sent,
      email_error: updatedOrder.email_error,
      retry_count: updatedOrder.email_retry_count,
    });
    console.log('');

    console.log('🎉 TEST COMPLETE!');
    console.log('✅ Order saved to Supabase');
    console.log('✅ Email sent successfully');
    console.log('Order ID:', saveResult.id);
    console.log('');
    console.log('You can view this order in:');
    console.log('- Supabase Dashboard → Table Editor → orders');
    console.log('- Admin Dashboard → /admin/orders');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testOrderFlow();

