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

    // Validate listed_by if it's being updated (required field)
    if (updates.listed_by !== undefined) {
      if (!updates.listed_by || updates.listed_by.trim() === '') {
        return NextResponse.json(
          { error: 'listed_by is required. Please select a user.' },
          { status: 400 }
        );
      }
      // Validate listed_by value
      const validListedByValues = ['walid', 'abdo', 'jebbar', 'amine', 'mehdi', 'othmane', 'janah', 'youssef'];
      if (!validListedByValues.includes(updates.listed_by)) {
        return NextResponse.json(
          { error: `Invalid listed_by value. Must be one of: ${validListedByValues.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Helper function to check if a value is meaningful (not empty string, null, or undefined)
    const hasValue = (value: any): boolean => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    };

    // Clean up updates: remove empty strings for required fields to prevent NOT NULL constraint violations
    const cleanedUpdates: any = {};
    Object.keys(updates).forEach(key => {
      const value = updates[key];
      // For required NOT NULL fields, only include if they have meaningful values
      const requiredFields = ['title', 'description', 'condition', 'category', 'brand', 'payee_email', 'checkout_link'];
      if (requiredFields.includes(key)) {
        if (hasValue(value)) {
          cleanedUpdates[key] = value;
        }
        // Skip empty strings for required fields
      } else {
        // For other fields, include them (they might be optional or have defaults)
        cleanedUpdates[key] = value;
      }
    });

    // Merge meta object with existing meta if meta is being updated
    if (cleanedUpdates.meta && typeof cleanedUpdates.meta === 'object' && Object.keys(cleanedUpdates.meta).length > 0) {
      const existingMeta = existing.meta || {};
      cleanedUpdates.meta = { ...existingMeta, ...cleanedUpdates.meta };
    } else if (cleanedUpdates.meta && Object.keys(cleanedUpdates.meta).length === 0) {
      // If meta is an empty object, don't update it (preserve existing)
      delete cleanedUpdates.meta;
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

    console.log('📝 Updating product with slug:', slug);
    console.log('📝 Updates:', JSON.stringify(cleanedUpdates, null, 2));
    
    const product = await updateProduct(slug, cleanedUpdates);

    if (!product) {
      // Log more details for debugging
      console.error('❌ Update product returned null for slug:', slug);
      console.error('❌ Updates attempted:', JSON.stringify(updates, null, 2));
      console.error('❌ Cleaned updates:', JSON.stringify(cleanedUpdates, null, 2));
      
      // Check if product exists with this slug
      const { getProductBySlug } = await import('@/lib/supabase/products');
      const existingProduct = await getProductBySlug(slug, true);
      if (existingProduct) {
        console.error('✅ Product exists in database with slug:', existingProduct.slug);
      } else {
        console.error('❌ Product NOT found in database with slug:', slug);
      }
      
      return NextResponse.json(
        { 
          error: `Product update failed for slug: ${slug}. The product may not exist or there may be a database issue.`,
          slug: slug
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

