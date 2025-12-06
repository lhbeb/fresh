import { NextRequest, NextResponse } from 'next/server';
import { getOrdersNeedingRetry } from '@/lib/supabase/orders';
import { sendOrderEmail } from '@/lib/email/sender';

/**
 * Automated email retry endpoint
 * 
 * NOTE: This endpoint does NOT automatically create a Vercel cron job
 * to avoid exceeding Vercel cron job limits per team.
 * 
 * To use this endpoint:
 * 1. Set up manually in Vercel Dashboard (if you have available cron slots)
 * 2. Use an external cron service (recommended - see CRON_SETUP.md)
 * 3. Call manually via API when needed
 * 
 * Immediate retries are already implemented:
 * - When checkout completes, emails are retried immediately in background
 * - Manual retries available from /admin/orders
 * 
 * For automated daily/hourly retries:
 * - Use external cron service (cron-job.org, etc.) - see CRON_SETUP.md
 * - Or set up manually in Vercel Dashboard if you have available slots
 */
export async function GET(request: NextRequest) {
  // Optional: Add a secret token for security (recommended for production)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is set, require it for security
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow Vercel's cron header as alternative
    const vercelCron = request.headers.get('x-vercel-cron');
    if (!vercelCron) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  try {
    console.log('🔄 [Cron] Starting automated email retry process...');
    
    // Get orders that need retry (max 5 retries per order, process 50 at a time)
    const orders = await getOrdersNeedingRetry(5);
    
    if (orders.length === 0) {
      console.log('✅ [Cron] No orders need email retry');
      return NextResponse.json({
        success: true,
        message: 'No orders need email retry',
        processed: 0,
        sent: 0,
        failed: 0,
      });
    }

    console.log(`📧 [Cron] Found ${orders.length} orders needing email retry`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      details: [] as Array<{ orderId: string; success: boolean; error?: string }>,
    };

    // Process emails (can be done in parallel for speed, but limit concurrency)
    const BATCH_SIZE = 10; // Process 10 at a time to avoid overwhelming the email service
    for (let i = 0; i < orders.length; i += BATCH_SIZE) {
      const batch = orders.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (order) => {
        try {
          const result = await sendOrderEmail(order);
          return { orderId: order.id, ...result };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return { orderId: order.id, success: false, error: errorMessage };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.processed++;
          if (result.value.success) {
            results.sent++;
          } else {
            results.failed++;
          }
          results.details.push(result.value);
        } else {
          results.processed++;
          results.failed++;
          results.details.push({
            orderId: 'unknown',
            success: false,
            error: result.reason?.message || 'Unknown error',
          });
        }
      });

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < orders.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    console.log(`✅ [Cron] Email retry completed: ${results.sent} sent, ${results.failed} failed out of ${results.processed} processed`);

    return NextResponse.json({
      success: true,
      processed: results.processed,
      sent: results.sent,
      failed: results.failed,
      details: results.details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [Cron] Error in automated email retry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process email retries', 
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}

