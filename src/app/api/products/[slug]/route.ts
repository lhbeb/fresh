import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/data';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Invalid product slug' }, { status: 400 });
    }

    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Failed to get product:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve product' },
      { status: 500 }
    );
  }
} 