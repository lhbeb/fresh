import { NextRequest, NextResponse } from 'next/server';
import {
  getProductBySlug,
  updateProduct,
  deleteProduct,
  updateCheckoutLink,
} from '@/lib/supabase/products';
import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

function revalidateProductPaths(slug: string) {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${slug}`);
}

// Helper to get auth from request
async function getAdminAuth(request: NextRequest) {
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

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug, true); // Admin view - include drafts

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve product' },
      { status: 500 }
    );
  }
}

// PATCH - Update product
export async function PATCH(
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
    const existing = await getProductBySlug(slug, true); // Admin view - include drafts

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updates = await request.json();

    // Merge meta object with existing meta if meta is being updated
    if (updates.meta && typeof updates.meta === 'object') {
      const existingMeta = existing.meta || {};
      updates.meta = { ...existingMeta, ...updates.meta };
    }

    const wantsFeatured = updates.is_featured ?? updates.isFeatured;
    if (wantsFeatured === true && !(existing.isFeatured ?? false)) {
      try {
        await assertFeaturedLimit(true);
      } catch (limitError: any) {
        const status = limitError.statusCode || 500;
        return NextResponse.json({ error: limitError.message }, { status });
      }
    }

    const product = await updateProduct(slug, updates);

    if (!product) {
      // Log more details for debugging
      console.error('Update product returned null for slug:', slug);
      console.error('Updates attempted:', JSON.stringify(updates, null, 2));
      return NextResponse.json(
        { 
          error: 'Product update failed. This may be due to invalid data or database constraints. Check server logs for details.',
          details: 'The product may not exist, or the update data may violate database constraints (e.g., empty strings for required fields).'
        },
        { status: 400 }
      );
    }

    revalidateProductPaths(product.slug);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to update product',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
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
    const success = await deleteProduct(slug);

    if (!success) {
      return NextResponse.json(
        { error: 'Product not found or delete failed' },
        { status: 404 }
      );
    }

    revalidateProductPaths(slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

