import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('Search API called with query:', query, 'limit:', limit);
    
    if (!query) {
      return NextResponse.json([]);
    }

    // Use Supabase search which includes slug, title, description, brand, and category
    const filteredProducts = await searchProducts(query);
    
    const limitedProducts = filteredProducts.slice(0, limit);

    console.log('Filtered products found:', limitedProducts.length);
    console.log('First filtered product:', limitedProducts[0] ? {
      id: limitedProducts[0].id,
      slug: limitedProducts[0].slug,
      title: limitedProducts[0].title
    } : 'No products found');

    return NextResponse.json(limitedProducts);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
} 