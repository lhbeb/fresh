import { getProductBySlug } from '@/lib/data';
import { getReviewProduct, isReviewProduct } from '@/lib/reviewProducts';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';
import type { Metadata, ResolvingMetadata } from 'next';

// Hardcoded base URL (no environment variable needed)
const BASE_URL = 'https://happydeel.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  try {
    const { slug } = await params;
    if (!slug) {
      return {
        title: 'Product Not Found | HappyDeel',
      };
    }
    
    // Check if it's a review product first
    let product = isReviewProduct(slug) ? getReviewProduct(slug) : null;
    
    // If not a review product, try to get from database
    if (!product) {
      product = await getProductBySlug(slug);
    }

    if (!product) {
      return {
        title: 'Product Not Found | HappyDeel',
      };
    }

    const title = `${product.title || 'Product'} - ${product.brand || ''} | ${product.category || ''} | HappyDeel`;
    const description = (product.description || '').substring(0, 155) + '...';
    const canonicalUrl = `${BASE_URL}/products/${product.slug}`;

  return {
    title,
    description,
    keywords: product.meta?.keywords || `${product.title}, ${product.brand}, ${product.category}`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'HappyDeel',
      images: (product.images || []).map(img => ({ url: new URL(img, BASE_URL).toString() })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: (product.images || []).map(img => new URL(img, BASE_URL).toString()),
    },
  };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product | HappyDeel',
      description: 'Browse our products on HappyDeel',
    };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    if (!slug || typeof slug !== 'string') {
      notFound();
    }

    // Check if it's a review product first
    let product = isReviewProduct(slug) ? getReviewProduct(slug) : null;
    
    // If not a review product, try to get from database
    if (!product) {
      product = await getProductBySlug(slug);
    }

    if (!product) {
      notFound();
    }

    // Generate Product Schema for Rich Snippets
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title || 'Product',
      "description": product.description || '',
      "image": (product.images || []).map((img: string) => {
        try {
          return new URL(img, BASE_URL).toString();
        } catch {
          return img;
        }
      }),
      "brand": {
        "@type": "Brand",
        "name": product.brand || ''
      },
      "category": product.category || '',
      "sku": product.slug || slug,
      "condition": product.condition || '',
      "offers": {
        "@type": "Offer",
        "price": product.price || 0,
        "priceCurrency": product.currency || "USD",
        "availability": "https://schema.org/InStock",
        "url": `${BASE_URL}/products/${product.slug}`
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating || 0,
        "reviewCount": product.reviewCount || 0,
        "bestRating": 5,
        "worstRating": 1
      },
      "review": ((product.reviews || []) as any[]).slice(0, 5).map((review: any) => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.author || 'Anonymous'
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating || 0,
          "bestRating": 5,
          "worstRating": 1
        },
        "reviewBody": review.content || '',
        "datePublished": review.date || new Date().toISOString(),
      }))
    };
    
    // Generate Breadcrumb Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": "Products", "item": `${BASE_URL}/#products` },
        { "@type": "ListItem", "position": 3, "name": product.category || 'Category', "item": `${BASE_URL}/#products?category=${encodeURIComponent(product.category || '')}` },
        { "@type": "ListItem", "position": 4, "name": product.title || 'Product', "item": `${BASE_URL}/products/${product.slug}` }
      ]
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <ProductPageClient product={product} />
      </>
    );
  } catch (error) {
    console.error('Error in ProductPage:', error);
    notFound();
  }
}
 