import { NextRequest, NextResponse } from 'next/server';
import { getOrdersNeedingRetry } from '@/lib/supabase/orders';
import { sendOrderEmail } from '@/lib/email/sender';

// POST - Retry sending emails for failed orders
export async function POST(request: NextRequest) {
  try {
    const { maxOrders } = await request.json().catch(() => ({}));
    const limit = maxOrders || 50;

    // Get orders that need retry
    const orders = await getOrdersNeedingRetry(5); // Max 5 retries per order
    const ordersToProcess = orders.slice(0, limit);

    if (ordersToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orders need email retry',
        processed: 0,
      });
    }

    console.log(`📧 Processing ${ordersToProcess.length} orders for email retry...`);

    const results = {
      success: 0,
      failed: 0,
      details: [] as Array<{ orderId: string; success: boolean; error?: string }>,
    };

    // Process emails (can be done in parallel for speed)
    const emailPromises = ordersToProcess.map(async (order) => {
      const result = await sendOrderEmail(order);
      return { orderId: order.id, ...result };
    });

    const emailResults = await Promise.allSettled(emailPromises);

    emailResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          results.success++;
        } else {
          results.failed++;
        }
        results.details.push(result.value);
      } else {
        results.failed++;
        results.details.push({
          orderId: 'unknown',
          success: false,
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    console.log(`✅ Email retry completed: ${results.success} sent, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      processed: ordersToProcess.length,
      sent: results.success,
      failed: results.failed,
      details: results.details,
    });
  } catch (error) {
    console.error('Error retrying emails:', error);
    return NextResponse.json(
      { error: 'Failed to retry emails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Get stats about orders needing retry
export async function GET() {
  try {
    const orders = await getOrdersNeedingRetry(5);
    
    return NextResponse.json({
      ordersNeedingRetry: orders.length,
      orders: orders.map(order => ({
        id: order.id,
        productTitle: order.product_title,
        customerEmail: order.customer_email,
        retryCount: order.email_retry_count || 0,
        nextRetryAt: order.next_retry_at,
        error: order.email_error,
      })),
    });
  } catch (error) {
    console.error('Error getting retry stats:', error);
    return NextResponse.json(
      { error: 'Failed to get retry stats' },
      { status: 500 }
    );
  }
}

