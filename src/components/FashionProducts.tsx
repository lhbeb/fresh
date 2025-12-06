"use client";

import React from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types/product';

interface FashionProductsProps {
  products: Product[];
}

const FashionProducts: React.FC<FashionProductsProps> = ({ products }) => {
  // Known fashion brands
  const fashionBrands = [
    'stone island', 'burberry', 'gucci', 'prada', 'versace', 'balenciaga',
    'dior', 'chanel', 'louis vuitton', 'hermes', 'fendi', 'givenchy',
    'saint laurent', 'yves saint laurent', 'ysl', 'moncler', 'canada goose',
    'arcteryx', 'patagonia', 'north face', 'ralph lauren', 'tommy hilfiger',
    'calvin klein', 'hugo boss', 'lacoste', 'polo', 'nike', 'adidas',
    'jordan', 'supreme', 'palace', 'off-white', 'bape', 'stussy'
  ];

  // Fashion-related keywords (more specific)
  const fashionKeywords = [
    'jacket', 'coat', 'shirt', 't-shirt', 'tee', 'pants', 'jeans', 'trousers',
    'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'blazer', 'suit',
    'dress', 'skirt', 'shorts', 'joggers', 'sneakers', 'boots',
    'hat', 'cap', 'beanie', 'scarf', 'gloves', 'belt', 'handbag', 'backpack',
    'jewelry', 'clothing', 'apparel'
  ];

  // Categories to exclude (non-fashion)
  const excludeCategories = [
    'camera', 'cameras', 'tech', 'technology', 'electronics', 'computer',
    'laptop', 'phone', 'smartphone', 'tablet', 'gaming', 'sport gear',
    'sports', 'bike', 'bicycle', 'vehicle', 'automotive'
  ];

  // Keywords to exclude (non-fashion items)
  const excludeKeywords = [
    'camera', 'lens', 'dslr', 'mirrorless', 'photography', 'laptop', 'computer',
    'phone', 'smartphone', 'tablet', 'gaming', 'console', 'bike', 'bicycle',
    'vehicle', 'car', 'motorcycle', 'sport', 'fitness equipment',
    'eyewear', 'glasses', 'sunglasses', 'eyeglasses', 'spectacles',
    'hair accessory', 'hair accessories', 'hair clip', 'hair clips', 'hairpin', 'hairpins',
    'headband', 'headbands', 'hair tie', 'hair ties', 'scrunchy', 'scrunchies'
  ];

  // Filter to only show fashion products
  const fashionProducts = products.filter(product => {
    const category = (product.category || '').toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    const title = (product.title || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    // First, exclude non-fashion items
    const isExcludedCategory = excludeCategories.some((excludeCat: string) => 
      category.includes(excludeCat)
    );
    
    const hasExcludedKeywords = excludeKeywords.some((excludeKeyword: string) => 
      title.includes(excludeKeyword) || description.includes(excludeKeyword)
    );
    
    if (isExcludedCategory || hasExcludedKeywords) {
      return false;
    }
    
    // Check if category contains fashion-related terms
    const isFashionCategory = category.includes('fashion') || 
                              category.includes('clothing') || 
                              category.includes('apparel') ||
                              category.includes('wear');
    
    // Check if brand is a known fashion brand
    const isFashionBrand = fashionBrands.some((fashionBrand: string) => 
      brand.includes(fashionBrand)
    );
    
    // Check if title or description contains fashion keywords
    const hasFashionKeywords = fashionKeywords.some((keyword: string) => 
      title.includes(keyword) || description.includes(keyword)
    );
    
    // Only include if it matches fashion criteria
    return isFashionCategory || isFashionBrand || hasFashionKeywords;
  });

  // If no fashion products, don't render the section
  if (fashionProducts.length === 0) {
    return null;
  }

  // Show up to 8 fashion products
  const displayedProducts = fashionProducts.slice(0, 8);

  return (
    <section id="fashion" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Top Shelf Closet
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Top brands. Checked. Ready to wear.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} cardBackground="bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FashionProducts;

