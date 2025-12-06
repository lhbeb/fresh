import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category')?.toLowerCase() || '';
    
    if (!category.trim()) {
      return NextResponse.json([]);
    }

    const allProducts = await getProducts();
    
    const filteredProducts = allProducts.filter(product => 
      product.category.toLowerCase() === category
    );

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('Category API Error:', error);
    return NextResponse.json({ error: 'Failed to get products by category' }, { status: 500 });
  }
} 