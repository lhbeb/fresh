import { NextRequest, NextResponse } from 'next/server';
import { updateCheckoutLink } from '@/lib/supabase/products';

// PATCH - Update checkout link
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { checkout_link } = await request.json();

    if (!checkout_link) {
      return NextResponse.json(
        { error: 'Missing checkout_link in request body' },
        { status: 400 }
      );
    }

    const product = await updateCheckoutLink(slug, checkout_link);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating checkout link:', error);
    return NextResponse.json(
      { error: 'Failed to update checkout link' },
      { status: 500 }
    );
  }
}

