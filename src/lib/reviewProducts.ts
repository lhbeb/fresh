import type { Product } from '@/types/product';

/**
 * Review products - these are products that have reviews but are no longer available
 * They should show as "sold out" or "offer expired" on their product pages
 */
export const reviewProducts: Record<string, Product> = {
  'canon-powershot-g7x-mark-iii': {
    id: 'canon-powershot-g7x-mark-iii',
    slug: 'canon-powershot-g7x-mark-iii',
    title: 'Canon PowerShot G7 X Mark III Digital Camera',
    description: 'The Canon PowerShot G7 X Mark III is a premium compact camera perfect for vloggers and content creators. Features 4K video recording, a flip-up LCD screen, and excellent autofocus performance. Ideal for travel and everyday photography.',
    price: 699.99,
    rating: 4.75,
    reviewCount: 156,
    images: [
      'https://i.ibb.co/fVHvNLnV/61-IKU-b30-JL.jpg',
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=800&fit=crop&auto=format&q=80'
    ],
    condition: 'New',
    category: 'Cameras',
    brand: 'Canon',
    payeeEmail: '',
    currency: 'USD',
    checkoutLink: 'https://example.com/checkout',
    inStock: false, // Sold out
    isFeatured: false
  },
  'nvidia-geforce-rtx-5060-8gb': {
    id: 'nvidia-geforce-rtx-5060-8gb',
    slug: 'nvidia-geforce-rtx-5060-8gb',
    title: 'NVIDIA GeForce RTX 5060 8GB Graphics Card',
    description: 'The NVIDIA GeForce RTX 5060 delivers exceptional gaming and productivity performance. Features DLSS 3 support, ray tracing capabilities, and excellent power efficiency. Perfect for gamers and content creators who need high-performance graphics.',
    price: 399.99,
    rating: 5.0,
    reviewCount: 89,
    images: [
      'https://i.ibb.co/Mk4rkPh3/61b-Nxcpol-YL.jpg',
      'https://i.ibb.co/TMfFGD3V/71q-LKFldc-L.jpg'
    ],
    condition: 'New',
    category: 'Computer Components',
    brand: 'NVIDIA',
    payeeEmail: '',
    currency: 'USD',
    checkoutLink: '#',
    inStock: false, // Sold out
    isFeatured: false
  },
  'ninja-creami-deluxe-ice-cream-slushie-maker': {
    id: 'ninja-creami-deluxe-ice-cream-slushie-maker',
    slug: 'ninja-creami-deluxe-ice-cream-slushie-maker',
    title: 'Ninja CREAMi Deluxe Ice Cream & Slushie Maker',
    description: 'The Ninja CREAMi Deluxe transforms your favorite beverages into delicious frozen treats. Create ice cream, sorbet, milkshakes, and slushies in minutes. Easy to use and clean, perfect for families who love frozen desserts.',
    price: 199.99,
    rating: 4.8,
    reviewCount: 234,
    images: [
      'https://i.ibb.co/pBwtsQbg/51tt-Lc3i-Kb-L.jpg',
      'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800&h=800&fit=crop&auto=format&q=80'
    ],
    condition: 'New',
    category: 'Kitchen Appliances',
    brand: 'Ninja',
    payeeEmail: '',
    currency: 'USD',
    checkoutLink: '#',
    inStock: false, // Offer expired
    isFeatured: false
  }
};

/**
 * Check if a product slug belongs to a review product
 */
export function isReviewProduct(slug: string): boolean {
  return slug in reviewProducts;
}

/**
 * Get a review product by slug
 */
export function getReviewProduct(slug: string): Product | null {
  return reviewProducts[slug] || null;
}

