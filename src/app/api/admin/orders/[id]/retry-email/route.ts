import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/supabase/orders';
import { sendOrderEmail } from '@/lib/email/sender';

// POST - Retry sending email for a specific order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const order = await getOrderById(id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.email_sent) {
      return NextResponse.json(
        { error: 'Email already sent for this order' },
        { status: 400 }
      );
    }

    // Check retry limit
    const retryCount = order.email_retry_count || 0;
    if (retryCount >= 5) {
      return NextResponse.json(
        { error: 'Maximum retry attempts (5) reached for this order' },
        { status: 400 }
      );
    }

    // Try to send email
    const result = await sendOrderEmail(order);

    if (result.success) {
      // Fetch the updated order to return current status
      const updatedOrder = await getOrderById(id);
      
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        order: updatedOrder, // Return updated order data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Email failed, will retry automatically later',
      });
    }
  } catch (error) {
    console.error('Error retrying email:', error);
    return NextResponse.json(
      { error: 'Failed to retry email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

