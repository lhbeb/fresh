import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, updateProduct, getProducts } from '@/lib/supabase/products';
import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const FEATURE_LIMIT = 6;

// Helper to get auth from request
async function getAdminAuth(request: NextRequest) {
  // Bypass authentication in development if enabled
  const { shouldBypassAuth } = await import('@/lib/supabase/auth');
  if (shouldBypassAuth()) {
    console.log('🔓 [AUTH] Bypassing authentication for API request');
    return 'dev-bypass-token'; // Return a mock token for dev mode
  }

  const token = request.cookies.get('admin_token')?.value;
  
  if (token) {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    const { isAdmin } = await import('@/lib/supabase/auth');
    const adminStatus = await isAdmin(user.email || '');
    if (!adminStatus) {
      return null;
    }
    
    return token;
  }
  
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const headerToken = authHeader.split('Bearer ')[1];
  return headerToken;
}

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

function revalidateProductPaths(slug: string) {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${slug}`);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check authentication
    const auth = await getAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Get current product
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newFeaturedStatus = !(product.isFeatured ?? false);

    // If trying to feature a product, check limit
    if (newFeaturedStatus) {
      try {
        await assertFeaturedLimit(true);
      } catch (limitError: any) {
        const status = limitError.statusCode || 500;
        return NextResponse.json({ error: limitError.message }, { status });
      }
    }

    // Update featured status
    const updated = await updateProduct(slug, {
      is_featured: newFeaturedStatus,
      isFeatured: newFeaturedStatus,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    revalidateProductPaths(updated.slug);

    return NextResponse.json({
      success: true,
      isFeatured: newFeaturedStatus,
      message: newFeaturedStatus ? 'Product featured' : 'Product unfeatured',
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

