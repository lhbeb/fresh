import { NextRequest, NextResponse } from 'next/server';
import { saveOrder } from '@/lib/supabase/orders';
import { supabaseAdmin } from '@/lib/supabase/server';

// Test endpoint to debug order saving
export async function GET() {
  try {
    // First, test if table exists
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .limit(1);

    if (tableError) {
      return NextResponse.json({
        error: 'Table access error',
        message: tableError.message,
        code: tableError.code,
        details: tableError.details,
        hint: tableError.hint,
      }, { status: 500 });
    }

    // Test saving an order
    const testOrder = {
      productSlug: 'test-product',
      productTitle: 'Test Product',
      productPrice: 99.99,
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890',
      shippingAddress: '123 Test St',
      shippingCity: 'Test City',
      shippingState: 'CA',
      shippingZip: '12345',
      fullOrderData: { test: true },
    };

    const result = await saveOrder(testOrder);

    return NextResponse.json({
      tableExists: true,
      tableCheck: tableCheck ? 'Success' : 'No data',
      saveResult: result,
      message: result.success ? 'Order saved successfully!' : 'Order save failed',
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Exception occurred',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

