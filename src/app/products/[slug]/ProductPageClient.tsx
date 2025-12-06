"use client";

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductReviews from '@/components/ProductReviews';
import ShippingInfo from '@/components/ShippingInfo';
import ClientOnly from '@/components/ClientOnly';
import RecommendedProducts from '@/components/RecommendedProducts';
import SameDayShipping from '@/components/SameDayShipping';
import { addToCart } from '@/utils/cart';
import { preventScrollOnClick } from '@/utils/scrollUtils';
import { debugNavigation, debugError, debugLog } from '@/utils/debug';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, ShoppingCart, Zap, Eye, ZoomIn } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/types/product';
import Image from 'next/image';

interface ProductPageClientProps {
  product: Product | null;
}

export default function ProductPageClient({ product: initialProduct }: ProductPageClientProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [activeImage, setActiveImage] = useState(0);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [viewedCount, setViewedCount] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const faqItems = useMemo(() => [
    { question: "Are the items new or used?", answer: "We offer both new and second-hand items. Product condition is clearly listed in the description (e.g., Brand New, Like New, Refurbished, or Used – Good Condition)." },
    { question: "Do products come with a warranty?", answer: "New items typically include a manufacturer warranty. For second-hand items, we offer a 30-day HappyDeel Guarantee for returns and exchanges, unless otherwise stated." },
    { question: "Can I return a product if it doesn't meet my expectations?", answer: "Absolutely! Your satisfaction is our top priority. We offer a generous 30-day return window. Contact us at +17176484487 or support@happydeel.com and we'll work with you to make it right. Read our Return Policy for complete details." },
    { question: "How long does shipping take?", answer: "Orders placed before 2:00 PM EST ship the same day! Standard processing is 1 business day. Domestic US shipping takes 5-8 business days, and Canada shipping takes 7-10 business days. You'll receive tracking information via email once your order ships." },
    { question: "Is there free shipping?", answer: "Yes, we offer free standard shipping on all orders currently. Express options are also available at checkout." },
    { question: "Are your second-hand products tested?", answer: "Absolutely. All second-hand electronics go through a multi-point inspection and are fully functional unless otherwise stated." },
    { question: "Can I trust the product photos?", answer: "Yes — what you see is what you get. Our photos show the actual product (or a very close representation for new items). We do not use stock images for used items." },
    { question: "Is local pickup available?", answer: "Currently, we are an online-only store, but we're working on introducing local pickup options in select cities soon." },
    { question: "How can I contact customer support?", answer: "We're here to help! Call us at +17176484487 or email support@happydeel.com. Business hours: Monday-Friday 9:00 AM - 5:00 PM EST, Saturday 10:00 AM - 3:00 PM EST. We respond to all inquiries promptly and are committed to resolving any issues quickly." }
  ], []);

  // Generate viewed count that persists during session
  useEffect(() => {
    if (!product || typeof window === 'undefined') return;

    const sessionKey = `product_viewed_${product.slug}`;
    
    // Check if we already have a count for this product in this session
    const storedCount = sessionStorage.getItem(sessionKey);
    
    if (storedCount) {
      // Use the stored count
      setViewedCount(parseInt(storedCount, 10));
    } else {
      // Generate a new random number based on product slug for consistency
      let hash = 0;
      for (let i = 0; i < product.slug.length; i++) {
        const char = product.slug.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
          // Generate a random number between 27 and 123 based on hash
          const seed = Math.abs(hash);
          const count = 27 + (seed % 97); // 27 to 123 range (123 - 27 + 1 = 97)
      
      // Store it in sessionStorage for this session
      sessionStorage.setItem(sessionKey, count.toString());
      setViewedCount(count);
    }
  }, [product]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = showZoom ? 'hidden' : 'unset';
      return () => { document.body.style.overflow = 'unset'; };
    }
  }, [showZoom]);

  const handleAddToCart = async () => {
    debugLog('handleAddToCart', 'Function called', 'log');
    
    if (!product) {
      debugError('handleAddToCart: product is null', new Error('Cannot add to cart: product is null'));
      setIsAddingToCart(false);
      return;
    }

    // Check if product is sold out
    if (product.inStock === false) {
      alert('This product is currently sold out.');
      return;
    }
    
    debugLog('handleAddToCart', { productId: product.id, productSlug: product.slug }, 'log');
    setIsAddingToCart(true);
    
    try {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }
      
      debugLog('handleAddToCart', 'Calling addToCart...', 'log');
      
      // Add to cart - this is client-side only (localStorage)
      addToCart(product);
      
      // Send Telegram notification for "Add to Cart" action
      try {
        const { sendTelegramNotification } = await import('@/utils/telegram-notify');
        await sendTelegramNotification({
          url: window.location.href,
          productTitle: product.title,
          productSlug: product.slug,
          productPrice: product.price,
          action: 'add_to_cart',
        });
      } catch (notifyError) {
        // Don't break the flow if notification fails
        console.warn('Failed to send add to cart notification:', notifyError);
      }
      
      debugLog('handleAddToCart', 'addToCart completed, waiting 100ms...', 'log');
      
      // Small delay to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      debugNavigation('handleAddToCart', 'Attempting navigation to /checkout');
      
      // Redirect to checkout - client-side navigation only
      if (typeof window !== 'undefined') {
        try {
          // Use Next.js router for client-side navigation
          debugLog('handleAddToCart', 'Using router.push', 'log');
          router.push('/checkout');
          debugLog('handleAddToCart', 'router.push called successfully', 'log');
          
          // Small delay before scroll
          setTimeout(() => {
            try {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (scrollError) {
              debugError('handleAddToCart: scroll failed', scrollError);
            }
          }, 50);
        } catch (navError) {
          debugError('handleAddToCart: router.push failed', navError);
          // Fallback: direct navigation
          try {
            debugLog('handleAddToCart', 'Using window.location.href as fallback', 'warn');
            window.location.href = '/checkout';
          } catch (fallbackError) {
            debugError('handleAddToCart: fallback navigation failed', fallbackError);
            setIsAddingToCart(false);
            alert('Failed to navigate to checkout. Please try again.');
            return;
          }
        }
      }
      
      debugLog('handleAddToCart', 'SUCCESS - Navigation completed', 'log');
    } catch (error) {
      debugError('handleAddToCart: CRITICAL ERROR', error);
      setIsAddingToCart(false);
      alert('Failed to add product to cart. Please check the console for details.');
      throw error; // Re-throw for better error tracking
    }
  };

  const handleBuyNow = async () => {
    if (!product) {
      console.error('Cannot proceed to checkout: product is null');
      return;
    }

    // Check if product is sold out
    if (product.inStock === false) {
      alert('This product is currently sold out.');
      return;
    }
    
    setIsBuyingNow(true);
    
    // Use a small delay to ensure the UI updates
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }
      
      addToCart(product);
      
      // Redirect to checkout after adding to cart
      setTimeout(() => {
        preventScrollOnClick(() => {
          goToCheckout();
        }, true);
      }, 200);
    } catch (error) {
      console.error('Error in buy now:', error);
      setIsBuyingNow(false);
      alert('Failed to proceed to checkout. Please try again.');
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  const resetZoom = () => setZoomLevel(1);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(touchStart.y - touchEnd.y) && Math.abs(distanceX) > 50;
    if (isHorizontalSwipe) {
      setActiveImage(prev => (distanceX > 0 ? (prev < product!.images.length - 1 ? prev + 1 : 0) : (prev > 0 ? prev - 1 : product!.images.length - 1)));
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleImageClick = (index: number) => {
    setActiveImage(index);
    setShowZoom(true);
    setZoomLevel(1);
  };

  const goToCheckout = () => {
    try {
      router.push('/checkout');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error navigating to checkout:', error);
      // Fallback navigation
      if (typeof window !== 'undefined') {
        window.location.href = '/checkout';
      }
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: product.title,
      text: product.description.substring(0, 200),
      url: url,
    };

    try {
      // Try native share API if available (mobile)
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url);
        alert('Product link copied to clipboard!');
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(url);
          alert('Product link copied to clipboard!');
        } catch (clipboardError) {
          console.error('Error sharing:', clipboardError);
          alert('Failed to share. Please copy the URL manually.');
        }
      }
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/"
            className="inline-block bg-[#0046be] hover:bg-[#003494] text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  const { slug, title, description, price, images, condition, reviews } = product || {};
  
  // Safety checks
  if (!slug || !title || !images || images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Product Data</h1>
          <p className="text-gray-600 mb-8">The product information is incomplete.</p>
          <Link
            href="/"
            className="inline-block bg-[#0046be] hover:bg-[#003494] text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-100">
      <main className="flex-grow bg-gray-100 py-12 pb-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">
            <div className="relative lg:sticky lg:top-0 lg:self-start">
              <div onClick={() => handleImageClick(activeImage)} className="cursor-zoom-in relative group aspect-[4/3] w-full">
                {images && images.length > 0 && images[activeImage] ? (
                  <>
                    {!imgLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse rounded-md z-10">
                        <div className="h-16 w-16 bg-gray-300 rounded-full" />
                      </div>
                    )}
                    <Image 
                      src={images[activeImage]} 
                      alt={`${title || 'Product'} - Image ${activeImage + 1}`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={`object-cover rounded-md transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onError={(e) => {
                        console.error('Image failed to load:', images[activeImage]);
                        (e.target as HTMLImageElement).src = '/placeholder.png';
                      }}
                      onLoadingComplete={() => setImgLoaded(true)}
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded-md flex items-center justify-center">
                  <ZoomIn className="h-12 w-12 text-white opacity-0 group-hover:opacity-75 transition-opacity" />
                </div>
              </div>
              {images && images.length > 1 && (
                <div className="mt-4 flex justify-center space-x-2 overflow-x-auto py-2">
                  {images.map((image, idx) => (
                    image ? (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${activeImage === idx ? 'ring-2 ring-[#0046be]' : 'ring-1 ring-gray-200'}`}
                      >
                        <Image src={image} alt={`${title || 'Product'} thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" onError={(e) => {
                          console.error('Thumbnail failed to load:', image);
                          (e.target as HTMLImageElement).src = '/placeholder.png';
                        }} unoptimized />
                        {activeImage === idx && <div className="absolute inset-0 bg-white/10"></div>}
                      </button>
                    ) : null
                  ))}
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 transform bg-white/80 hover:bg-[#0046be] hover:text-white p-2 rounded-full transition-all duration-300 z-10">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button onClick={() => setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 transform bg-white/80 hover:bg-[#0046be] hover:text-white p-2 rounded-full transition-all duration-300 z-10">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
            
            <div className="lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:pr-4 scrollbar-hide">
              <h1 className="text-3xl font-medium text-gray-900">{title}</h1>
              <div className="mt-2 text-gray-600">{condition}</div>
              {product && product.inStock === false && product.checkoutLink === '#' && (
                <div className="mt-4 bg-amber-50 border-2 border-amber-200 rounded-xl py-3 px-4">
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ This offer has expired and the product is no longer available for purchase.
                  </p>
                </div>
              )}
              <div className="mt-4 text-4xl font-bold text-gray-900">${new Intl.NumberFormat('en-US').format(price)}</div>
              
              <ClientOnly>
                {viewedCount !== null && viewedCount > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="flex items-center text-blue-700">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                          <span className="text-xs sm:text-sm font-medium">
                            {viewedCount.toLocaleString()} viewed in the last 24 hours
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                        <span className="text-xs text-gray-600 font-medium hidden sm:inline">Live activity</span>
                      </div>
                    </div>
                  </div>
                )}
              </ClientOnly>

              {/* Mobile Sticky Buttons */}
              <div className="lg:mt-8 lg:space-y-3 fixed bottom-0 left-0 right-0 z-50 lg:relative lg:z-auto bg-white border-t border-gray-200 lg:border-0 lg:bg-transparent px-4 py-3 lg:px-0 lg:py-0 shadow-lg lg:shadow-none lg:space-y-3 space-y-2">
                {product && product.inStock === false ? (
                  /* Sold Out / Offer Expired Message */
                  <div className="w-full bg-gray-100 rounded-lg py-3 px-4 text-center">
                    <p className="text-sm text-gray-600">
                      {product.checkoutLink === '#' 
                        ? 'Sorry, this offer has expired' 
                        : 'Sorry, this product is sold out'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3 lg:flex-col lg:gap-3">
                          {/* Share Button - Mobile Only */}
                          <button 
                            onClick={handleShare}
                            className="lg:hidden flex-shrink-0 w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                            style={{ color: '#6b7280' }}
                            aria-label="Share product"
                          >
                            <svg className="h-6 w-6 group-hover:opacity-80 transition-opacity" fill="currentColor" fillRule="nonzero" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.86197 3.52794L7.52828 0.861631L7.53151 0.858423C7.59476 0.795922 7.6674 0.748648 7.74485 0.716601C7.82346 0.684006 7.90965 0.666016 8.00004 0.666016C8.18414 0.666016 8.3508 0.740635 8.47145 0.861278L11.1381 3.52794C11.3985 3.78829 11.3985 4.2104 11.1381 4.47075C10.8778 4.7311 10.4557 4.7311 10.1953 4.47075L8.66671 2.94216V10.666C8.66671 11.0342 8.36823 11.3327 8.00004 11.3327C7.63185 11.3327 7.33337 11.0342 7.33337 10.666V2.94216L5.80478 4.47075C5.54443 4.7311 5.12232 4.7311 4.86197 4.47075C4.60162 4.2104 4.60162 3.78829 4.86197 3.52794Z"></path>
                              <path d="M13.3334 14.666V7.33268H11.3334C10.9652 7.33268 10.6667 7.0342 10.6667 6.66602C10.6667 6.29783 10.9652 5.99935 11.3334 5.99935H14C14.3682 5.99935 14.6667 6.29783 14.6667 6.66602V15.3327C14.6667 15.7009 14.3682 15.9993 14 15.9993H2.00004C1.63185 15.9993 1.33337 15.7009 1.33337 15.3327V6.66602C1.33337 6.29783 1.63185 5.99935 2.00004 5.99935H4.66671C5.0349 5.99935 5.33337 6.29783 5.33337 6.66602C5.33337 7.0342 5.0349 7.33268 4.66671 7.33268H2.66671V14.666H13.3334Z"></path>
                            </svg>
                          </button>
                      <button onClick={handleAddToCart} disabled={isAddingToCart || isBuyingNow} className="flex-1 lg:w-full bg-[#0046be] hover:bg-[#003494] text-white py-3 lg:py-4 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base">
                        {isAddingToCart ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Adding to Cart...</> : <><ShoppingCart className="h-5 w-5 mr-2" />Add to Cart</>}
                      </button>
                    </div>
                    <button 
                      onClick={handleBuyNow} 
                      disabled={isAddingToCart || isBuyingNow} 
                      className="hidden lg:flex w-full bg-transparent border-2 border-[#0046be] hover:border-[#003494] text-[#0046be] hover:text-[#003494] py-4 px-6 rounded-xl font-semibold transition-colors duration-200 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBuyingNow ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Buy Now
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8"><h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping & Delivery</h3><ClientOnly><ShippingInfo /></ClientOnly></div>
              <div className="mt-8"><h2 className="text-xl font-medium text-gray-900 mb-4">Description</h2><p className="text-gray-600 whitespace-pre-line">{description}</p></div>
            </div>
          </div>

          {/* FAQ Section - Full Width */}
          <div className="mt-16 w-full">
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
              <button onClick={() => setShowFAQ(!showFAQ)} className="w-full flex items-center justify-between text-left text-gray-900 hover:text-[#0046be] transition-colors duration-300">
                <span className="text-xl font-medium">Frequently Asked Questions</span>
                <div className="flex items-center space-x-2">
                  {!showFAQ && <span className="text-sm text-[#0046be] font-medium">({faqItems.length - 1} more questions)</span>}
                  {showFAQ ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </button>
              <div className="mt-6 space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className={`border-b border-gray-100 pb-6 last:border-0 ${!showFAQ && index > 0 ? 'hidden' : ''}`}>
                    <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                    <div className="text-gray-600">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {reviews && reviews.length > 0 && <div className="mt-16"><ProductReviews reviews={reviews} averageRating={product.rating} totalReviews={product.reviewCount} /></div>}
          <div className="mt-8">
            <SameDayShipping fullWidth={true} contained={true} />
          </div>
          <RecommendedProducts currentProductSlug={slug} currentProduct={product} />
        </div>
      </main>

      {showZoom && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50" onClick={() => setShowZoom(false)}>
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleZoomOut(); }} className="p-2 text-white hover:text-[#0046be] transition-colors duration-200" aria-label="Zoom out"><span className="text-2xl">−</span></button>
            <button onClick={(e) => { e.stopPropagation(); handleZoomIn(); }} className="p-2 text-white hover:text-[#0046be] transition-colors duration-200" aria-label="Zoom in"><span className="text-2xl">+</span></button>
            <button onClick={(e) => { e.stopPropagation(); resetZoom(); }} className="p-2 text-white hover:text-[#0046be] transition-colors duration-200" aria-label="Reset zoom"><span className="text-lg">⟲</span></button>
            <button onClick={(e) => { e.stopPropagation(); setShowZoom(false); }} className="p-2 text-white hover:text-[#0046be] transition-colors duration-200" aria-label="Close zoom view"><X className="h-8 w-8" /></button>
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div className="relative w-full h-full">
              <Image src={images[activeImage]} alt={`${title} - Image ${activeImage + 1}`} fill sizes="100vw" className="object-contain transition-transform duration-200" style={{ transform: `scale(${zoomLevel})` }} onClick={(e) => e.stopPropagation()} />
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1)); setZoomLevel(1); }} className="absolute left-4 top-1/2 -translate-y-1/2 transform bg-white/10 hover:bg-[#0046be] p-3 rounded-full text-white transition-colors duration-200" aria-label="Previous image"><ChevronLeft className="h-8 w-8" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0)); setZoomLevel(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 transform bg-white/10 hover:bg-[#0046be] p-3 rounded-full text-white transition-colors duration-200" aria-label="Next image"><ChevronRight className="h-8 w-8" /></button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 