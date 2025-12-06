import { NextRequest, NextResponse } from 'next/server';
import { saveOrder, getOrderById } from '@/lib/supabase/orders';
import { sendOrderEmail } from '@/lib/email/sender';
import { resolveBaseUrl } from '@/lib/url';

/**
 * Test endpoint to simulate a complete order flow
 * Call: POST /api/test-order-flow
 * 
 * This will:
 * 1. Save a test order to Supabase
 * 2. Fetch it back
 * 3. Send an email
 * 4. Verify the order was updated
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [Test] Starting order flow test...');

    const siteUrl = resolveBaseUrl([
      request.headers.get('origin'),
      request.headers.get('referer'),
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

    // STEP 1: Save order to database
    console.log('📦 [Test] STEP 1: Saving order to Supabase...');
    const saveResult = await saveOrder(testOrderData);
    
    if (!saveResult.success) {
      console.error('❌ [Test] Failed to save order:', saveResult.error);
      return NextResponse.json({
        success: false,
        step: 'save_order',
        error: saveResult.error,
        message: 'Failed to save order to database',
      }, { status: 500 });
    }

    console.log('✅ [Test] Order saved successfully! ID:', saveResult.id);

    // STEP 2: Fetch the order from database
    console.log('🔍 [Test] STEP 2: Fetching order from database...');
    const order = await getOrderById(saveResult.id!);

    if (!order) {
      console.error('❌ [Test] Failed to fetch order from database');
      return NextResponse.json({
        success: false,
        step: 'fetch_order',
        error: 'Order saved but could not be fetched',
        orderId: saveResult.id,
      }, { status: 500 });
    }

    console.log('✅ [Test] Order fetched successfully!');

    // STEP 3: Send email
    console.log('📧 [Test] STEP 3: Sending email...');
    const emailResult = await sendOrderEmail(order);

    // STEP 4: Verify order was updated
    console.log('🔍 [Test] STEP 4: Verifying order email status...');
    const updatedOrder = await getOrderById(saveResult.id!);

    return NextResponse.json({
      success: true,
      message: 'Test order flow completed',
      results: {
        orderSaved: true,
        orderId: saveResult.id,
        orderFetched: !!order,
        emailSent: emailResult.success,
        emailError: emailResult.error,
        finalStatus: updatedOrder ? {
          email_sent: updatedOrder.email_sent,
          email_error: updatedOrder.email_error,
          retry_count: updatedOrder.email_retry_count,
        } : null,
      },
      orderData: {
        product_title: order.product_title,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        product_price: order.product_price,
      },
      note: emailResult.success 
        ? '✅ Order saved and email sent successfully!'
        : '⚠️ Order saved but email failed. Check email credentials.',
    });

  } catch (error) {
    console.error('❌ [Test] Test failed with error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: errorMessage,
      stack: errorStack,
    }, { status: 500 });
  }
}

// Also support GET for easy testing in browser
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [Test] Starting order flow test (GET request)...');

    const siteUrl = resolveBaseUrl([
      request.headers.get('origin'),
      request.headers.get('referer'),
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

    // STEP 1: Save order to database
    console.log('📦 [Test] STEP 1: Saving order to Supabase...');
    const saveResult = await saveOrder(testOrderData);
    
    if (!saveResult.success) {
      console.error('❌ [Test] Failed to save order:', saveResult.error);
      return NextResponse.json({
        success: false,
        step: 'save_order',
        error: saveResult.error,
        message: 'Failed to save order to database',
      }, { status: 500 });
    }

    console.log('✅ [Test] Order saved successfully! ID:', saveResult.id);

    // STEP 2: Fetch the order from database
    console.log('🔍 [Test] STEP 2: Fetching order from database...');
    const order = await getOrderById(saveResult.id!);

    if (!order) {
      console.error('❌ [Test] Failed to fetch order from database');
      return NextResponse.json({
        success: false,
        step: 'fetch_order',
        error: 'Order saved but could not be fetched',
        orderId: saveResult.id,
      }, { status: 500 });
    }

    console.log('✅ [Test] Order fetched successfully!');

    // STEP 3: Send email
    console.log('📧 [Test] STEP 3: Sending email...');
    const emailResult = await sendOrderEmail(order);

    // STEP 4: Verify order was updated
    console.log('🔍 [Test] STEP 4: Verifying order email status...');
    const updatedOrder = await getOrderById(saveResult.id!);

    return NextResponse.json({
      success: true,
      message: 'Test order flow completed',
      results: {
        orderSaved: true,
        orderId: saveResult.id,
        orderFetched: !!order,
        emailSent: emailResult.success,
        emailError: emailResult.error,
        finalStatus: updatedOrder ? {
          email_sent: updatedOrder.email_sent,
          email_error: updatedOrder.email_error,
          retry_count: updatedOrder.email_retry_count,
        } : null,
      },
      orderData: {
        product_title: order.product_title,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        product_price: order.product_price,
      },
      note: emailResult.success 
        ? '✅ Order saved and email sent successfully!'
        : '⚠️ Order saved but email failed. Check email credentials.',
    });

  } catch (error) {
    console.error('❌ [Test] Test failed with error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: errorMessage,
      stack: errorStack,
    }, { status: 500 });
  }
}

