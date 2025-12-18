import { NextRequest, NextResponse } from 'next/server';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/supabase/products';
import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { authenticateAdmin } from '@/lib/supabase/auth';

const FEATURE_LIMIT = 6;

async function assertFeaturedLimit(canFeature: boolean) {
  if (!canFeature) return;

  const { count, error } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_featured', true);

  if (error) {
    console.error('Failed to check featured product count:', error);
    throw new Error('Unable to verify featured product limit. Please try again.');
  }

  if ((count ?? 0) >= FEATURE_LIMIT) {
    const limitError = new Error(`Maximum of ${FEATURE_LIMIT} featured products reached. Unfeature another product first.`);
    (limitError as any).statusCode = 400;
    throw limitError;
  }
}

function revalidateProductPaths(slug?: string) {
  revalidatePath('/');
  revalidatePath('/products');
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

// Helper to get auth from request
async function getAdminAuth(request: NextRequest) {
  // Bypass authentication in development if enabled
  const { shouldBypassAuth } = await import('@/lib/supabase/auth');
  if (shouldBypassAuth()) {
    console.log('🔓 [AUTH] Bypassing authentication for API request');
    return 'dev-bypass-token'; // Return a mock token for dev mode
  }

  // Check for admin_token cookie first
  const token = request.cookies.get('admin_token')?.value;
  
  if (token) {
    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    // Check if user is admin
    const { isAdmin } = await import('@/lib/supabase/auth');
    const adminStatus = await isAdmin(user.email || '');
    if (!adminStatus) {
      return null;
    }
    
    return token;
  }
  
  // Fallback to Authorization header (for backward compatibility)
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const headerToken = authHeader.split('Bearer ')[1];
  return headerToken;
}

// GET - List all products (admin view - includes drafts)
export async function GET(request: NextRequest) {
  try {
    // Optional: Add auth check here if needed
    // const auth = await getAdminAuth(request);
    // if (!auth) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Admin view should include drafts
    const products = await getProducts(true);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await getAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productData = await request.json();

    // Validate required fields
    const requiredFields = [
      'slug',
      'title',
      'description',
      'price',
      'images',
      'condition',
      'category',
      'brand',
      'checkout_link',
      'listed_by',
    ];

    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate listed_by value
    const validListedByValues = ['walid', 'abdo', 'jebbar', 'amine', 'mehdi', 'othmane', 'janah', 'youssef'];
    if (productData.listed_by && !validListedByValues.includes(productData.listed_by)) {
      return NextResponse.json(
        { error: `Invalid listed_by value. Must be one of: ${validListedByValues.join(', ')}` },
        { status: 400 }
      );
    }

    try {
      await assertFeaturedLimit(productData.is_featured ?? productData.isFeatured ?? false);
    } catch (limitError: any) {
      const status = limitError.statusCode || 500;
      return NextResponse.json({ error: limitError.message }, { status });
    }

    const product = await createProduct({
      ...productData,
      payee_email: productData.payee_email || '',
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    revalidateProductPaths(product.slug);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

