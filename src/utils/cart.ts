import type { Product } from '@/types/product';
import { debugCart, debugError } from './debug';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

export const CART_STORAGE_KEY = 'happydeel_cart';

export function addToCart(product: Product): void {
  debugCart('addToCart called', { product: product ? { id: product.id, slug: product.slug, title: product.title } : null });
  
  if (typeof window === 'undefined') {
    debugError('addToCart: window undefined', new Error('localStorage is not available'));
    return;
  }
  
  if (!product) {
    debugError('addToCart: product is null', new Error('Cannot add to cart: product is null or undefined'));
    return;
  }

  try {
    debugCart('addToCart: creating clean product', { productId: product.id });
    
    // Create a clean serializable product object
    const cleanProduct: Product = {
      id: product.id || '',
      slug: product.slug || '',
      title: product.title || '',
      description: product.description || '',
      price: typeof product.price === 'number' ? product.price : 0,
      images: Array.isArray(product.images) ? product.images : [],
      condition: product.condition || '',
      category: product.category || '',
      brand: product.brand || '',
      payeeEmail: product.payeeEmail || '',
      currency: product.currency || 'USD',
      checkoutLink: product.checkoutLink || '',
      rating: typeof product.rating === 'number' ? product.rating : 0,
      reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : 0,
      reviews: Array.isArray(product.reviews) ? product.reviews : [],
      meta: product.meta || undefined,
      inStock: product.inStock !== undefined ? product.inStock : true,
    };

    debugCart('addToCart: clean product created', { productId: cleanProduct.id });

    const cartItem: CartItem = {
      product: cleanProduct,
      quantity: 1,
      addedAt: new Date().toISOString()
    };
    
    debugCart('addToCart: cart item created', { cartItem });
    
    // Test serialization before storing
    let serialized: string;
    try {
      serialized = JSON.stringify(cartItem);
      debugCart('addToCart: serialization successful', { length: serialized.length });
    } catch (serializeError) {
      debugError('addToCart: serialization failed', serializeError);
      throw serializeError;
    }
    
    try {
      localStorage.setItem(CART_STORAGE_KEY, serialized);
      debugCart('addToCart: stored in localStorage', { key: CART_STORAGE_KEY });
    } catch (storageError) {
      debugError('addToCart: localStorage.setItem failed', storageError);
      throw storageError;
    }
    
    // Dispatch custom event to notify other components
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        debugCart('addToCart: cartUpdated event dispatched', {});
      }
    } catch (eventError) {
      debugError('addToCart: event dispatch failed', eventError);
      // Don't throw - event dispatch is not critical
    }
    
    debugCart('addToCart: SUCCESS', { productId: cleanProduct.id });
  } catch (error) {
    debugError('addToCart: CRITICAL ERROR', error);
    // Don't throw - just log the error to prevent crashes
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    throw error; // Re-throw so caller can handle it
  }
}

export function getCartItem(): CartItem | null {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return null;
  }
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

export function getCartCount(): number {
  const cartItem = getCartItem();
  return cartItem ? cartItem.quantity : 0;
} 