import 'server-only';
import { supabaseAdmin } from './server';
import type { Product } from '@/types/product';
import type { Review } from '@/types/product';

// Transform Supabase row to Product type
function transformProduct(row: any): Product {
  const meta = row.meta || {};
  // Default to published=true for backward compatibility (existing products without meta.published should be considered published)
  // Only explicitly set to false if meta.published === false
  const published = meta.published === false ? false : true;
  return {
    id: row.id || row.slug,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price: row.price,
    rating: row.rating || 0,
    reviewCount: row.review_count || 0,
    images: row.images || [],
    condition: row.condition,
    category: row.category,
    brand: row.brand,
    payeeEmail: row.payee_email || '',
    currency: row.currency || 'USD',
    checkoutLink: row.checkout_link,
    reviews: row.reviews || [],
    meta: meta,
    published: published, // Default to true unless explicitly set to false
    isFeatured: Boolean(row.is_featured),
    inStock: row.in_stock !== undefined ? Boolean(row.in_stock) : true,
  };
}

/**
 * Get all products from Supabase
 * @param includeDrafts - If true, includes draft products. Defaults to false (only published products).
 */
export async function getProducts(includeDrafts: boolean = false): Promise<Product[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    const products = (data || []).map(transformProduct);
    
    // Filter out drafts unless explicitly requested (for admin views)
    if (!includeDrafts) {
      // Only return published products (published !== false)
      // Products without meta.published are considered published (backward compatibility)
      return products.filter(p => p.published !== false);
    }

    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

/**
 * Get a single product by slug
 * @param includeDrafts - If true, includes draft products. Defaults to false (only published products).
 */
export async function getProductBySlug(slug: string, includeDrafts: boolean = false): Promise<Product | null> {
  try {
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      console.error('Invalid slug provided:', slug);
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('slug', slug.trim())
      .single();

    if (error) {
      // Don't log if it's just a not found error
      if (error.code !== 'PGRST116') {
        console.error(`Error fetching product ${slug}:`, error);
      }
      return null;
    }

    if (!data) {
      return null;
    }

    const product = transformProduct(data);
    
    // Filter out drafts unless explicitly requested (for admin views)
    if (!includeDrafts && product.published === false) {
      return null; // Don't return draft products to public
    }

    return product;
  } catch (error) {
    console.error(`Error loading product ${slug}:`, error);
    return null;
  }
}

/**
 * Get products by category
 * Only returns published products (drafts are excluded)
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    const products = (data || []).map(transformProduct);
    
    // Filter out drafts - only return published products
    return products.filter(p => p.published !== false);
  } catch (error) {
    console.error('Error loading products by category:', error);
    return [];
  }
}

/**
 * Search products - Advanced search in slug, title, description, brand, and category
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return [];
    }
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    const products = (data || []).map(transformProduct);
    
    // Filter out drafts - only return published products
    return products.filter(p => p.published !== false);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Get featured products (first 4 by default)
 * Only returns published featured products (drafts are excluded)
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .order('updated_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }

    const products = (data || []).map(transformProduct);
    
    // Filter out drafts - only return published products
    return products.filter(p => p.published !== false);
  } catch (error) {
    console.error('Error loading featured products:', error);
    return [];
  }
}

/**
 * Create a new product
 */
export async function createProduct(productData: {
  slug: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  condition: string;
  category: string;
  brand: string;
  payee_email?: string;
  checkout_link: string;
  currency?: string;
  rating?: number;
  review_count?: number;
  reviewCount?: number;
  reviews?: Review[];
  meta?: any;
  in_stock?: boolean;
  inStock?: boolean;
  is_featured?: boolean;
  isFeatured?: boolean;
}): Promise<Product | null> {
  try {
    // Use id if provided, otherwise use slug
    const productId = productData.id || productData.slug;
    
    // Handle both review_count and reviewCount
    const reviewCount = productData.review_count || productData.reviewCount || 0;
    
    // Handle both in_stock and inStock
    const inStock = productData.in_stock !== undefined ? productData.in_stock : (productData.inStock !== undefined ? productData.inStock : true);

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        id: productId,
        slug: productData.slug,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        images: productData.images,
        condition: productData.condition,
        category: productData.category,
        brand: productData.brand,
        payee_email: productData.payee_email || '',
        checkout_link: productData.checkout_link,
        currency: productData.currency || 'USD',
        rating: productData.rating || 0,
        review_count: reviewCount,
        reviews: productData.reviews || [],
        meta: productData.meta || {},
        in_stock: inStock,
        is_featured: productData.is_featured !== undefined ? productData.is_featured : (productData.isFeatured ?? false),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return null;
    }

    return transformProduct(data);
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

/**
 * Update a product by slug
 */
export async function updateProduct(
  slug: string,
  updates: {
    slug?: string;
    title?: string;
    description?: string;
    price?: number;
    images?: string[];
    condition?: string;
    category?: string;
    brand?: string;
    payee_email?: string;
    checkout_link?: string;
    currency?: string;
    rating?: number;
    review_count?: number;
    reviewCount?: number;
    reviews?: Review[];
    meta?: any;
    in_stock?: boolean;
    inStock?: boolean;
    is_featured?: boolean;
    isFeatured?: boolean;
  }
): Promise<Product | null> {
  try {
    // Helper function to check if a value is meaningful (not empty string, null, or undefined)
    const hasValue = (value: any): boolean => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    };

    // Build update object, handling both snake_case and camelCase
    // Only include fields that have meaningful values to avoid NOT NULL constraint violations
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Handle slug update - must be done before the query
    if (updates.slug !== undefined && updates.slug !== slug && hasValue(updates.slug)) {
      updateData.slug = updates.slug;
      // Also update id if it matches the old slug
      updateData.id = updates.slug;
    }

    // Only update fields that have meaningful values (skip empty strings to avoid NOT NULL constraint violations)
    // This allows partial updates - e.g., updating only checkout_link without affecting other fields
    if (updates.title !== undefined && hasValue(updates.title)) updateData.title = updates.title;
    if (updates.description !== undefined && hasValue(updates.description)) updateData.description = updates.description;
    // Price can be 0, so only check for null/undefined/NaN
    if (updates.price !== undefined && updates.price !== null && typeof updates.price === 'number' && !isNaN(updates.price) && isFinite(updates.price)) {
      updateData.price = updates.price;
    }
    if (updates.images !== undefined && hasValue(updates.images)) updateData.images = updates.images;
    if (updates.condition !== undefined && hasValue(updates.condition)) updateData.condition = updates.condition;
    if (updates.category !== undefined && hasValue(updates.category)) updateData.category = updates.category;
    if (updates.brand !== undefined && hasValue(updates.brand)) updateData.brand = updates.brand;
    if (updates.payee_email !== undefined && hasValue(updates.payee_email)) updateData.payee_email = updates.payee_email;
    if (updates.checkout_link !== undefined && hasValue(updates.checkout_link)) updateData.checkout_link = updates.checkout_link;
    if (updates.currency !== undefined && hasValue(updates.currency)) updateData.currency = updates.currency;
    if (updates.rating !== undefined && updates.rating !== null && !isNaN(updates.rating)) updateData.rating = updates.rating;
    
    // Handle both review_count and reviewCount
    if (updates.review_count !== undefined && updates.review_count !== null && !isNaN(updates.review_count)) {
      updateData.review_count = updates.review_count;
    }
    if (updates.reviewCount !== undefined && updates.reviewCount !== null && !isNaN(updates.reviewCount)) {
      updateData.review_count = updates.reviewCount;
    }
    
    if (updates.reviews !== undefined) updateData.reviews = updates.reviews;
    if (updates.meta !== undefined) updateData.meta = updates.meta;
    
    // Handle both in_stock and inStock (booleans can be false, so check for undefined)
    if (updates.in_stock !== undefined) updateData.in_stock = updates.in_stock;
    if (updates.inStock !== undefined) updateData.in_stock = updates.inStock;

    // Handle both is_featured and isFeatured (booleans can be false, so check for undefined)
    if (updates.is_featured !== undefined) updateData.is_featured = updates.is_featured;
    if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;

    // If no fields to update (only updated_at), return existing product
    // Use includeDrafts: true since this is an admin update operation
    if (Object.keys(updateData).length === 1) {
      const existing = await getProductBySlug(slug, true);
      return existing;
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      console.error('Update data:', JSON.stringify(updateData, null, 2));
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    if (!data) {
      console.error('No data returned from update');
      return null;
    }

    return transformProduct(data);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Update checkout link for a product
 */
export async function updateCheckoutLink(
  slug: string,
  checkoutLink: string
): Promise<Product | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        checkout_link: checkoutLink,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Error updating checkout link:', error);
      return null;
    }

    return transformProduct(data);
  } catch (error) {
    console.error('Error updating checkout link:', error);
    return null;
  }
}

/**
 * Delete a product by slug
 */
export async function deleteProduct(slug: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

