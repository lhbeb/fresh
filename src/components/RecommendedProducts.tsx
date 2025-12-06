"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, ShoppingCart } from 'lucide-react';
import type { Product } from '@/types/product';

interface RecommendedProductsProps {
  currentProductSlug: string;
  currentProduct?: Product | null;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ currentProductSlug, currentProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendedProducts = async () => {
      try {
        // Fetch all products and filter out the current one
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const allProducts = await response.json();
        
        // Filter out current product
        let filteredProducts = allProducts.filter((product: Product) => product.slug !== currentProductSlug);
        
        // Smart recommendation logic
        if (currentProduct && filteredProducts.length > 0) {
          // Extract keywords from title (common words to ignore)
          const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'];
          const titleWords = (currentProduct.title || '').toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word));
          
          // Score products based on relevance
          const scoredProducts = filteredProducts.map((product: Product) => {
            let score = 0;
            
            // Same category gets highest priority
            if (product.category && currentProduct.category && 
                product.category.toLowerCase() === currentProduct.category.toLowerCase()) {
              score += 100;
            }
            
            // Same brand gets high priority
            if (product.brand && currentProduct.brand && 
                product.brand.toLowerCase() === currentProduct.brand.toLowerCase()) {
              score += 50;
            }
            
            // Title keyword matches
            const productTitle = (product.title || '').toLowerCase();
            titleWords.forEach(word => {
              if (productTitle.includes(word)) {
                score += 10;
              }
            });
            
            // Description keyword matches (lower weight)
            const productDesc = (product.description || '').toLowerCase();
            titleWords.forEach(word => {
              if (productDesc.includes(word)) {
                score += 2;
              }
            });
            
            return { product, score };
          });
          
          // Sort by score (highest first), then randomize within same score groups
          scoredProducts.sort((a: { product: Product; score: number }, b: { product: Product; score: number }) => {
            if (b.score !== a.score) {
              return b.score - a.score;
            }
            return Math.random() - 0.5;
          });
          
          // Take top 4 products
          filteredProducts = scoredProducts
            .slice(0, 4)
            .map((item: { product: Product; score: number }) => item.product);
          
          // If we don't have 4 products with good matches, fill with random
          if (filteredProducts.length < 4) {
            const remaining = allProducts
              .filter((p: Product) => 
                p.slug !== currentProductSlug && 
                !filteredProducts.some((fp: Product) => fp.slug === p.slug)
              )
              .sort(() => Math.random() - 0.5)
              .slice(0, 4 - filteredProducts.length);
            filteredProducts = [...filteredProducts, ...remaining];
          }
        } else {
          // Fallback to random if no current product provided
          filteredProducts = filteredProducts
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
        }
        
        setProducts(filteredProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommended products');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure the main product page loads first
    const timer = setTimeout(loadRecommendedProducts, 500);
    return () => clearTimeout(timer);
  }, [currentProductSlug, currentProduct]);

  if (loading) {
    return (
      <section className="mt-16 border-t pt-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-96 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                    <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null; // Don't show anything if there's an error or no products
  }

  return (
    <section className="mt-8 border-t pt-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommended Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover more amazing products you might love
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.slug}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
              </div>
              
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 sm:line-clamp-1">
                  {product.title}
                </h3>
                
                <p className="text-sm text-gray-500 overflow-hidden">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                    {product.condition}
                  </span>
                </p>
                
                <div className="text-xl font-bold text-gray-900">${new Intl.NumberFormat('en-US').format(product.price)}</div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>View Details</span>
                  </div>
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedProducts; 