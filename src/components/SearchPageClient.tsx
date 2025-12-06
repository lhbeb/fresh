"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";
import { Loader2 } from "lucide-react";

interface SearchPageClientProps {
  initialQuery?: string;
}

/**
 * Advanced search algorithm that scores products based on relevance
 */
function advancedSearch(products: Product[], query: string): Product[] {
  if (!query.trim()) {
    return products;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Score each product based on how well it matches
  const scoredProducts = products.map((product) => {
    let score = 0;

    // Normalize all searchable fields - handle null/undefined safely
    const title = String(product.title || "").toLowerCase().trim();
    const description = String(product.description || "").toLowerCase().trim();
    const brand = String(product.brand || "").toLowerCase().trim();
    const category = String(product.category || "").toLowerCase().trim();
    const slug = String(product.slug || "").toLowerCase().trim();

    // Exact matches get highest scores
    if (title === normalizedQuery) score += 1000;
    if (slug === normalizedQuery) score += 900;
    if (brand === normalizedQuery) score += 800;

    // Title matches (most important)
    if (title.includes(normalizedQuery)) {
      score += 500;
      // Bonus if it starts with the query
      if (title.startsWith(normalizedQuery)) score += 200;
    }

    // Slug matches (very important)
    if (slug.includes(normalizedQuery)) {
      score += 400;
      if (slug.startsWith(normalizedQuery)) score += 150;
    }

    // Word-based matching in title
    queryWords.forEach((word) => {
      if (title.includes(word)) {
        score += 100;
        // Bonus for word at start of title
        if (title.startsWith(word) || title.includes(` ${word}`)) {
          score += 50;
        }
      }
    });

    // Description matches
    if (description.includes(normalizedQuery)) {
      score += 200;
    }
    queryWords.forEach((word) => {
      if (description.includes(word)) {
        score += 30;
      }
    });

    // Brand matches (very important for brand searches)
    if (brand.includes(normalizedQuery)) {
      score += 500; // Increased from 300
    }
    if (brand === normalizedQuery) {
      score += 300; // Bonus for exact brand match
    }
    queryWords.forEach((word) => {
      if (brand.includes(word)) {
        score += 100; // Increased from 80
      }
    });

    // Category matches
    if (category.includes(normalizedQuery)) {
      score += 150;
    }
    queryWords.forEach((word) => {
      if (category.includes(word)) {
        score += 40;
      }
    });

    return { product, score };
  });

  // Filter out products with score 0, sort by score (descending), then return products
  return scoredProducts
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      // Sort by score first
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // If scores are equal, prefer newer products
      return 0;
    })
    .map((item) => item.product);
}

export default function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") || initialQuery || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination constants
  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  
  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [queryParam]);

  // Fetch and search products
  useEffect(() => {
    const fetchAndSearch = async () => {
      if (!queryParam.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setCurrentPage(1); // Reset page when new search starts

      try {
        // Fetch all products from the API
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const allProducts: Product[] = await response.json();

        // Apply advanced search algorithm
        const filteredProducts = advancedSearch(allProducts, queryParam);

        setProducts(filteredProducts);
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Failed to search products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSearch();
  }, [queryParam]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#0046be] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Searching for &quot;{queryParam}&quot;...</p>
          <p className="text-gray-500 text-sm mt-2">Finding products in our database</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-600 text-lg mb-2">Search Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </main>
    );
  }

  if (!queryParam.trim()) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 text-lg">Enter a search term to find products</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {products.length === 0 ? (
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 text-lg mb-2">
            No products found for &quot;{queryParam}&quot;
          </p>
          <p className="text-gray-500 text-sm">
            Try searching with different keywords or check your spelling
          </p>
        </div>
      ) : (
        <>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Search Results for &quot;{queryParam}&quot;
            </h1>
            <p className="text-gray-600">
              Found {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
          
          <div className="container mx-auto px-4 pb-16">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                  }`}
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

