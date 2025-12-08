import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const { id } = await params;
    
    console.log('🔄 [MARK-CONVERTED] Starting conversion for order ID:', id);
    console.log('🔄 [MARK-CONVERTED] Request timestamp:', new Date().toISOString());
    
    if (!id) {
      console.error('❌ [MARK-CONVERTED] Order ID is missing');
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Step 1: Verify order exists before attempting update
    console.log('🔍 [MARK-CONVERTED] Step 1: Checking if order exists...');
    const { data: existingOrder, error: checkError } = await supabaseAdmin
      .from('orders')
      .select('id, is_converted, created_at')
      .eq('id', id);

    if (checkError) {
      console.error('❌ [MARK-CONVERTED] Error checking order existence:', {
        error: checkError.message,
        code: checkError.code,
        details: checkError.details,
        hint: checkError.hint
      });
      return NextResponse.json(
        { 
          error: 'Failed to check order existence',
          details: checkError.message 
        },
        { status: 500 }
      );
    }

    if (!existingOrder || existingOrder.length === 0) {
      console.error('❌ [MARK-CONVERTED] Order not found with ID:', id);
      
      // Try to find similar IDs to help debug
      const { data: sampleOrders } = await supabaseAdmin
        .from('orders')
        .select('id')
        .limit(5);
      console.log('📋 [MARK-CONVERTED] Sample order IDs in database:', sampleOrders?.map(o => o.id));
      
      return NextResponse.json(
        { 
          error: `Order not found with ID: ${id}`,
          orderId: id
        },
        { status: 404 }
      );
    }

    console.log('✅ [MARK-CONVERTED] Order found:', {
      id: existingOrder[0].id,
      currentIsConverted: existingOrder[0].is_converted,
      createdAt: existingOrder[0].created_at
    });

    // Step 2: Check if is_converted column exists
    console.log('🔍 [MARK-CONVERTED] Step 2: Verifying is_converted column...');
    const { data: columnCheck } = await supabaseAdmin
      .from('orders')
      .select('is_converted')
      .eq('id', id)
      .limit(1);
    
    if (columnCheck && columnCheck.length > 0) {
      console.log('✅ [MARK-CONVERTED] is_converted column exists, current value:', columnCheck[0].is_converted);
    } else {
      console.warn('⚠️ [MARK-CONVERTED] Could not verify is_converted column - it may not exist');
    }

    // Step 3: Perform the update
    console.log('📝 [MARK-CONVERTED] Step 3: Performing update...');
    const updateData = {
      is_converted: true,
      updated_at: new Date().toISOString(),
    };
    console.log('📝 [MARK-CONVERTED] Update data:', JSON.stringify(updateData, null, 2));

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ [MARK-CONVERTED] Supabase update error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        orderId: id
      });
      
      // Check if it's an RLS policy issue
      if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
        console.error('❌ [MARK-CONVERTED] RLS POLICY ISSUE DETECTED!');
        console.error('❌ [MARK-CONVERTED] The orders table likely has RLS enabled but no UPDATE policy.');
        console.error('❌ [MARK-CONVERTED] Run the SQL migration: supabase-add-orders-update-policy.sql');
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to mark order as converted',
          details: error.message,
          code: error.code,
          hint: error.hint || 'Check if UPDATE policy exists for orders table'
        },
        { status: 500 }
      );
    }

    // Step 4: Verify update result
    if (!data || data.length === 0) {
      console.error('❌ [MARK-CONVERTED] Update returned 0 rows for order ID:', id);
      console.error('❌ [MARK-CONVERTED] DIAGNOSIS:');
      console.error('   1. RLS policy may be blocking UPDATE (check with: SELECT * FROM pg_policies WHERE tablename = \'orders\';)');
      console.error('   2. The order ID does not match any rows');
      console.error('   3. The is_converted column may not exist (check with: SELECT column_name FROM information_schema.columns WHERE table_name = \'orders\' AND column_name = \'is_converted\';)');
      
      // Try to read the order again to see if it still exists
      const { data: verifyOrder, error: verifyError } = await supabaseAdmin
        .from('orders')
        .select('id, is_converted')
        .eq('id', id);
      
      console.log('🔍 [MARK-CONVERTED] Verification query result:', verifyOrder);
      if (verifyError) {
        console.error('❌ [MARK-CONVERTED] Verification query error:', verifyError);
      }
      
      // Check if order exists but update failed
      if (verifyOrder && verifyOrder.length > 0) {
        console.error('❌ [MARK-CONVERTED] Order EXISTS but update failed - this is definitely an RLS policy issue!');
        return NextResponse.json(
          { 
            error: 'Update blocked - RLS policy issue confirmed. Order exists but cannot be updated.',
            orderId: id,
            currentStatus: verifyOrder[0].is_converted,
            solution: 'Run: CREATE POLICY "Allow all updates for service role" ON orders FOR UPDATE USING (true) WITH CHECK (true);'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Update returned 0 rows - order may not exist or RLS policy is blocking',
          orderId: id,
          suggestion: 'Verify order exists and RLS policies are configured correctly'
        },
        { status: 500 }
      );
    }

    const updatedOrder = data[0];
    const duration = Date.now() - startTime;
    
    console.log('✅ [MARK-CONVERTED] Order successfully marked as converted:', {
      orderId: updatedOrder.id,
      isConverted: updatedOrder.is_converted,
      updatedAt: updatedOrder.updated_at,
      duration: `${duration}ms`
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [MARK-CONVERTED] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      orderId: (await params).id,
      duration: `${duration}ms`
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

