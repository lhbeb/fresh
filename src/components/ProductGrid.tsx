"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";

import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";

const ITEMS_PER_PAGE = 12;
type SortOption = "featured" | "price-high" | "price-low" | "rating";

interface ProductGridProps {
  products: Product[];
}

interface PriceRangeState {
  min: string;
  max: string;
}

const FILTER_SECTION_DEFAULT = {
  price: true,
  brands: false,
  conditions: false,
} as const;

function shuffleWithSeed(items: Product[], seed: number): Product[] {
  if (items.length <= 1) {
    return items;
  }

  const shuffled = [...items];
  let currentSeed = seed;

  const random = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function applySorting(products: Product[], sortBy: SortOption): Product[] {
  if (sortBy === "featured") {
    const today = new Date();
    const seed = today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate();
    return shuffleWithSeed(products, seed);
  }

  const sorted = [...products];

  sorted.sort((a, b) => {
    if (sortBy === "price-high") {
      return b.price - a.price;
    }

    if (sortBy === "price-low") {
      return a.price - b.price;
    }

    if (sortBy === "rating") {
      return (b.rating ?? 0) - (a.rating ?? 0);
    }

    return 0;
  });

  return sorted;
}

const ProductGrid = ({ products }: ProductGridProps) => {
  const searchParams = useSearchParams();

  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<PriceRangeState>({ min: "", max: "" });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllConditions, setShowAllConditions] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ...FILTER_SECTION_DEFAULT,
  });

  const productsRef = useRef<HTMLDivElement>(null);
  const searchQuery = (searchParams?.get("search") ?? "").trim().toLowerCase();

  const brandOptions = useMemo(() => [...new Set(products.map((product) => product.brand))], [products]);
  const conditionOptions = useMemo(
    () => [...new Set(products.map((product) => product.condition))],
    [products],
  );

  // Helper function to check if a product is a fashion product
  const isFashionProduct = (product: Product): boolean => {
    const fashionBrands = [
      'stone island', 'burberry', 'gucci', 'prada', 'versace', 'balenciaga',
      'dior', 'chanel', 'louis vuitton', 'hermes', 'fendi', 'givenchy',
      'saint laurent', 'yves saint laurent', 'ysl', 'moncler', 'canada goose',
      'arcteryx', 'patagonia', 'north face', 'ralph lauren', 'tommy hilfiger',
      'calvin klein', 'hugo boss', 'lacoste', 'polo', 'nike', 'adidas',
      'jordan', 'supreme', 'palace', 'off-white', 'bape', 'stussy'
    ];

    const fashionKeywords = [
      'jacket', 'coat', 'shirt', 't-shirt', 'tee', 'pants', 'jeans', 'trousers',
      'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'blazer', 'suit',
      'dress', 'skirt', 'shorts', 'joggers', 'sneakers', 'boots',
      'hat', 'cap', 'beanie', 'scarf', 'gloves', 'belt', 'handbag', 'backpack',
      'jewelry', 'clothing', 'apparel'
    ];

    const category = (product.category || '').toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    const title = (product.title || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
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
    
    return isFashionCategory || isFashionBrand || hasFashionKeywords;
  };

  const activeFilters = useMemo(() => {
    let count = 0;

    if (priceRange.min !== "") count += 1;
    if (priceRange.max !== "") count += 1;
    count += selectedBrands.length;
    count += selectedConditions.length;

    return count;
  }, [priceRange, selectedBrands, selectedConditions]);

  const filteredProducts = useMemo(() => {
    // First, exclude all fashion products
    let result = products.filter(product => !isFashionProduct(product));

    if (searchQuery) {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      result = result.filter((product) => {
        // Safely get and normalize all searchable fields
        const title = (product.title || '').toLowerCase().trim();
        const description = (product.description || '').toLowerCase().trim();
        const brand = (product.brand || '').toLowerCase().trim();
        const category = (product.category || '').toLowerCase().trim();
        
        // Check if query matches any field
        return (
          title.includes(normalizedQuery) ||
          description.includes(normalizedQuery) ||
          brand.includes(normalizedQuery) ||
          category.includes(normalizedQuery)
        );
      });
    }

    if (selectedBrands.length > 0) {
      result = result.filter((product) => selectedBrands.includes(product.brand));
    }

    if (selectedConditions.length > 0) {
      result = result.filter((product) => selectedConditions.includes(product.condition));
    }

    if (priceRange.min !== "") {
      result = result.filter((product) => product.price >= Number(priceRange.min));
    }

    if (priceRange.max !== "") {
      result = result.filter((product) => product.price <= Number(priceRange.max));
    }

    return applySorting(result, sortBy);
  }, [products, searchQuery, selectedBrands, selectedConditions, priceRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrands, selectedConditions, priceRange, sortBy, searchQuery]);

  useEffect(() => {
    if (!productsRef.current) return;

    const filtersActive =
      searchQuery !== "" ||
      selectedBrands.length > 0 ||
      selectedConditions.length > 0 ||
      priceRange.min !== "" ||
      priceRange.max !== "";

    if (!filtersActive || currentPage === 1) return;

    const headerHeight = 120;
    const rect = productsRef.current.getBoundingClientRect();
    const targetOffset = rect.top + window.pageYOffset - headerHeight;

    window.scrollTo({ top: targetOffset, behavior: "smooth" });
  }, [currentPage, searchQuery, selectedBrands, selectedConditions, priceRange]);

  const handleToggleSection = (section: keyof typeof FILTER_SECTION_DEFAULT) => {
    setExpandedSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  };

  const handleClearFilters = () => {
    setPriceRange({ min: "", max: "" });
    setSelectedBrands([]);
    setSelectedConditions([]);
  };

  const handleRemoveBrand = (brand: string) => {
    setSelectedBrands((previous) => previous.filter((value) => value !== brand));
  };

  const handleRemoveCondition = (condition: string) => {
    setSelectedConditions((previous) => previous.filter((value) => value !== condition));
  };

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);

    if (!productsRef.current) return;

    const headerHeight = 120;
    const rect = productsRef.current.getBoundingClientRect();
    const targetOffset = rect.top + window.pageYOffset - headerHeight;

    window.scrollTo({ top: targetOffset, behavior: "smooth" });
  };

  return (
    <div id="products" ref={productsRef} className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-7xl mx-auto">
          {filterPanelOpen ? (
            <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Filters</p>
                  <h3 className="text-lg font-semibold text-gray-900">Refine your search</h3>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => setFilterPanelOpen(false)}
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-4 px-6 py-6 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
                <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 shadow-sm">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-sm font-semibold text-gray-900"
                    onClick={() => handleToggleSection("price")}
                  >
                    <span>Price range</span>
                    {expandedSections.price ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {expandedSections.price ? (
                    <div className="mt-4 flex gap-3">
                      <div className="w-full">
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                          Min
                        </label>
                        <input
                          type="number"
                          value={priceRange.min}
                          onChange={(event) =>
                            setPriceRange((previous) => ({ ...previous, min: event.target.value }))
                          }
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0046be]"
                        />
                      </div>
                      <div className="w-full">
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                          Max
                        </label>
                        <input
                          type="number"
                          value={priceRange.max}
                          onChange={(event) =>
                            setPriceRange((previous) => ({ ...previous, max: event.target.value }))
                          }
                          placeholder="150"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0046be]"
                        />
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-sm font-semibold text-gray-900"
                    onClick={() => handleToggleSection("brands")}
                  >
                    <span>
                      Brands
                      {selectedBrands.length > 0 ? (
                        <span className="ml-1 text-[#0046be]">({selectedBrands.length})</span>
                      ) : null}
                    </span>
                    {expandedSections.brands ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {expandedSections.brands ? (
                    <div className="mt-4 max-h-48 space-y-1 overflow-y-auto pr-1 text-sm scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
                      {(showAllBrands ? brandOptions : brandOptions.slice(0, 8)).map((brand) => (
                        <label
                          key={brand}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={(event) => {
                              setSelectedBrands((previous) => {
                                if (event.target.checked) {
                                  return [...previous, brand];
                                }
                                return previous.filter((value) => value !== brand);
                              });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-[#0046be] focus:ring-[#0046be]"
                          />
                          {brand}
                        </label>
                      ))}

                      {brandOptions.length > 8 ? (
                        <button
                          type="button"
                          className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#0046be] hover:underline"
                          onClick={() => setShowAllBrands((previous) => !previous)}
                        >
                          {showAllBrands ? "Show fewer brands" : `Show all ${brandOptions.length}`}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-sm font-semibold text-gray-900"
                    onClick={() => handleToggleSection("conditions")}
                  >
                    <span>
                      Condition
                      {selectedConditions.length > 0 ? (
                        <span className="ml-1 text-[#0046be]">({selectedConditions.length})</span>
                      ) : null}
                    </span>
                    {expandedSections.conditions ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {expandedSections.conditions ? (
                    <div className="mt-4 max-h-48 space-y-1 overflow-y-auto pr-1 text-sm scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
                      {(showAllConditions ? conditionOptions : conditionOptions.slice(0, 8)).map((condition) => (
                        <label
                          key={condition}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedConditions.includes(condition)}
                            onChange={(event) => {
                              setSelectedConditions((previous) => {
                                if (event.target.checked) {
                                  return [...previous, condition];
                                }
                                return previous.filter((value) => value !== condition);
                              });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-[#0046be] focus:ring-[#0046be]"
                          />
                          {condition}
                        </label>
                      ))}

                      {conditionOptions.length > 8 ? (
                        <button
                          type="button"
                          className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#0046be] hover:underline"
                          onClick={() => setShowAllConditions((previous) => !previous)}
                        >
                          {showAllConditions ? "Show fewer conditions" : `Show all ${conditionOptions.length}`}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </section>

                {activeFilters > 0 ? (
                  <div className="md:col-[1/-1]">
                    <button
                      type="button"
                      className="w-full rounded-xl border border-[#0046be] bg-[#0046be]/5 px-4 py-3 text-sm font-semibold text-[#0046be] transition-colors duration-200 hover:bg-[#0046be]/10"
                      onClick={handleClearFilters}
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex-grow">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-medium text-gray-900">Endless accessories. Epic prices.</h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-50"
                  onClick={() => setFilterPanelOpen((previous) => !previous)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFilters > 0 ? (
                    <span className="rounded-full bg-[#0046be] px-2 py-0.5 text-xs font-semibold text-white">
                      {activeFilters}
                    </span>
                  ) : null}
                </button>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#0046be]"
                  >
                    <option value="featured">Default</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            {activeFilters > 0 ? (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {priceRange.min !== "" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-[#0046be]">
                    Min: ${priceRange.min}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-blue-100"
                      onClick={() => setPriceRange((previous) => ({ ...previous, min: "" }))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null}

                {priceRange.max !== "" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-[#0046be]">
                    Max: ${priceRange.max}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-blue-100"
                      onClick={() => setPriceRange((previous) => ({ ...previous, max: "" }))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null}

                {selectedBrands.map((brand) => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-[#0046be]"
                  >
                    {brand}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-blue-100"
                      onClick={() => handleRemoveBrand(brand)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {selectedConditions.map((condition) => (
                  <span
                    key={condition}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-[#0046be]"
                  >
                    {condition}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-blue-100"
                      onClick={() => handleRemoveCondition(condition)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            {paginatedProducts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">No products found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 ? (
                  <nav className="mt-8 flex justify-center" aria-label="Pagination">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {/* Previous Button */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-lg transition-colors duration-300 flex items-center gap-1 ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-[#0046be]"
                        }`}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Prev</span>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {/* Always show first page */}
                        {currentPage > 3 && (
                          <>
                            <button
                              type="button"
                              onClick={() => handlePageChange(1)}
                              className="px-3 sm:px-4 py-2 rounded-lg transition-colors duration-300 bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-[#0046be]"
                            >
                              1
                            </button>
                            {currentPage > 4 && (
                              <span className="px-2 text-gray-400">…</span>
                            )}
                          </>
                        )}

                        {/* Pages around current page */}
                        {(() => {
                          const pages = [];
                          // On mobile: show 1 page before and after (total 3)
                          // On desktop: show 2 pages before and after (total 5)
                          const range = typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2;
                          const start = Math.max(1, currentPage - range);
                          const end = Math.min(totalPages, currentPage + range);
                          
                          for (let i = start; i <= end; i++) {
                            pages.push(
                              <button
                                key={i}
                                type="button"
                                onClick={() => handlePageChange(i)}
                                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors duration-300 ${
                                  currentPage === i
                                    ? "bg-[#0046be] text-white font-semibold"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-[#0046be]"
                                }`}
                              >
                                {i}
                              </button>
                            );
                          }
                          return pages;
                        })()}

                        {/* Always show last page */}
                        {currentPage < totalPages - 2 && (
                          <>
                            {currentPage < totalPages - 3 && (
                              <span className="px-2 text-gray-400">…</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handlePageChange(totalPages)}
                              className="px-3 sm:px-4 py-2 rounded-lg transition-colors duration-300 bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-[#0046be]"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      {/* Next Button */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-lg transition-colors duration-300 flex items-center gap-1 ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-[#0046be]"
                        }`}
                        aria-label="Next page"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </nav>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
