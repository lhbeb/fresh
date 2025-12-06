import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/supabase/orders';

// GET - List all orders
export async function GET(request: NextRequest) {
  try {
    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}

