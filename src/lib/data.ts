import 'server-only';
// Re-export Supabase functions for backwards compatibility
export {
  getProducts,
  getProductBySlug,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
} from './supabase/products';

/**
 * Get all products (alias for getProducts for consistency)
 */
export async function getAllProducts() {
  const { getProducts } = await import('./supabase/products');
  return getProducts();
}

// Note: clearProductsCache is no longer needed with Supabase
// Cache is handled by Supabase client internally
export function clearProductsCache(): void {
  // No-op for backwards compatibility
} 