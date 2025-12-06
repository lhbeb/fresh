import React, { Suspense } from 'react';
import Hero from '@/components/Hero';
import SameDayShipping from '@/components/SameDayShipping';
import FeaturedProduct from '@/components/FeaturedProduct';
import ProductGrid from '@/components/ProductGrid';
import HomeReviews from '@/components/HomeReviews';
import FashionProducts from '@/components/FashionProducts';
import { getProducts, getFeaturedProducts } from '@/lib/data';
import { homeReviews, homeReviewsStats } from '@/lib/homeReviews';
import ScrollToTop from '@/components/ScrollToTop';
import type { Product } from '@/types/product';

// Use a deterministic seed-based shuffle to avoid hydration mismatches
function getRandomProducts(products: Product[], count: number): Product[] {
  if (products.length === 0) return [];
  
  // Use a deterministic seed (current day) to ensure consistent results across SSR and client
  const today = new Date();
  const seed = today.getDate() + today.getMonth() * 31 + today.getFullYear() * 365;
  
  // Simple seeded shuffle function
  const shuffled = [...products];
  let currentSeed = seed;
  
  // Generate pseudo-random number from seed
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  
  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
}

export default async function HomePage() {
  try {
    const [allProducts, featuredFromAdmin] = await Promise.all([
      getProducts(),
      getFeaturedProducts(),
    ]);

    const featuredProducts = (featuredFromAdmin && featuredFromAdmin.length > 0)
      ? featuredFromAdmin.slice(0, 6)
      : getRandomProducts(allProducts || [], 6);

  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <Hero />
      
      <section id="featured" className="py-16 bg-gray-100 overflow-visible">
        <div className="container mx-auto px-4 overflow-visible">
          <div className="w-full max-w-7xl mx-auto overflow-visible">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:gap-10 overflow-visible">
              {featuredProducts.map((product) => (
                <FeaturedProduct key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <SameDayShipping />
      
      <FashionProducts products={allProducts || []} />
      
      <Suspense fallback={null}>
        <ProductGrid products={allProducts} />
      </Suspense>
      
      <HomeReviews 
        reviews={homeReviews}
        averageRating={homeReviewsStats.averageRating}
        totalReviews={homeReviewsStats.totalReviews}
      />
    </>
  );
  } catch (error) {
    console.error('Error loading homepage:', error);
    // Return a minimal error page that won't break
    return (
      <>
        <Hero />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load products</h2>
          <p className="text-gray-600">Please refresh the page or try again later.</p>
        </div>
      </>
    );
  }
}
