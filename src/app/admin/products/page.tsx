"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, Search, Plus, Edit, Trash2, ExternalLink, 
  Filter, Grid3X3, List, MoreVertical, Eye, X,
  ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Star
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminLoading from '@/components/AdminLoading';

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  original_price?: number;
  images: string[];
  category?: string;
  in_stock?: boolean;
  created_at: string;
  checkoutLink?: string;
  isFeatured?: boolean;
  is_featured?: boolean;
  published?: boolean;
}

type ViewMode = 'grid' | 'list';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not_featured'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const [featuredCount, setFeaturedCount] = useState(0);
  const FEATURE_LIMIT = 6;
  const itemsPerPage = 12;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/products', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
      
      // Count featured products
      const featured = Array.isArray(data) ? data.filter((p: Product) => p.isFeatured || p.is_featured).length : 0;
      setFeaturedCount(featured);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let filtered = [...products];

    // Apply status filter (Published/Draft)
    if (statusFilter === 'published') {
      filtered = filtered.filter(p => p.published === true);
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter(p => p.published !== true);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Apply featured filter
    if (featuredFilter === 'featured') {
      filtered = filtered.filter(p => p.isFeatured || p.is_featured);
    } else if (featuredFilter === 'not_featured') {
      filtered = filtered.filter(p => !(p.isFeatured || p.is_featured));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, featuredFilter, products]);

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setDeletingId(slug);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, { 
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (!response.ok) throw new Error('Failed to delete product');
      await fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (slug: string) => {
    const product = products.find(p => p.slug === slug);
    const isCurrentlyFeatured = product?.isFeatured || product?.is_featured || false;
    const featureLimitReached = featuredCount >= FEATURE_LIMIT;
    
    if (!isCurrentlyFeatured && featureLimitReached) {
      setError(`Maximum of ${FEATURE_LIMIT} featured products reached. Unfeature another product first.`);
      return;
    }

    setTogglingFeatured(slug);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/${encodeURIComponent(slug)}/feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to toggle featured status');
      }

      const result = await response.json();
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p.slug === slug 
          ? { ...p, isFeatured: result.isFeatured, is_featured: result.isFeatured }
          : p
      ));
      setFilteredProducts(prev => prev.map(p => 
        p.slug === slug 
          ? { ...p, isFeatured: result.isFeatured, is_featured: result.isFeatured }
          : p
      ));
      
      // Update featured count
      setFeaturedCount(prev => result.isFeatured ? prev + 1 : prev - 1);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle featured status');
    } finally {
      setTogglingFeatured(null);
    }
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <AdminLoading message="Loading products..." />;
  }

  return (
    <AdminLayout 
      title="Products" 
      subtitle={`${products.length} products • ${products.filter(p => p.published).length} published • ${products.filter(p => !p.published).length} drafts • ${featuredCount}/${FEATURE_LIMIT} featured`}
    >
      {/* Error Alert */}
        {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Status Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'published'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Published ({products.filter(p => p.published).length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'draft'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Draft ({products.filter(p => !p.published).length})
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
              placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>

          {/* Featured Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
                <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as 'all' | 'featured' | 'not_featured')}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
            >
              <option value="all">All Products</option>
              <option value="featured">⭐ Featured Only</option>
              <option value="not_featured">Not Featured</option>
                </select>
              </div>

          {/* View Toggle & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <Grid3X3 className="h-4 w-4 text-gray-600" />
              </button>
                <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <List className="h-4 w-4 text-gray-600" />
                </button>
            </div>

            <button
              onClick={fetchProducts}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </button>

            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add Product</span>
            </Link>
                  </div>
                </div>
              </div>

      {/* Filter Status */}
      {(searchQuery || statusFilter !== 'all' || featuredFilter !== 'all') && (
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-sm text-blue-700">
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
            {statusFilter === 'published' && ` (${products.filter(p => p.published).length} published)`}
            {statusFilter === 'draft' && ` (${products.filter(p => !p.published).length} drafts)`}
            {featuredFilter === 'featured' && ` (${featuredCount} featured)`}
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first product</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md hover:border-gray-200 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-gray-300" />
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {!product.published && (
                    <div className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                      Draft
                    </div>
                  )}
                  {(product.isFeatured || product.is_featured) && (
                    <div className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" />
                      Featured
                    </div>
                  )}
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleFeatured(product.slug);
                    }}
                    disabled={togglingFeatured === product.slug || (!(product.isFeatured || product.is_featured) && featuredCount >= FEATURE_LIMIT)}
                    className={`p-2 rounded-lg transition-colors ${
                      (product.isFeatured || product.is_featured)
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-white hover:bg-gray-100'
                    } disabled:opacity-50`}
                    title={(product.isFeatured || product.is_featured) ? 'Remove from featured' : 'Add to featured'}
                  >
                    {togglingFeatured === product.slug ? (
                      <RefreshCw className={`h-4 w-4 animate-spin ${(product.isFeatured || product.is_featured) ? 'text-white' : 'text-gray-700'}`} />
                    ) : (
                      <Star className={`h-4 w-4 ${(product.isFeatured || product.is_featured) ? 'text-white fill-white' : 'text-gray-700'}`} />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/products/${product.slug}`);
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    title="View product"
                  >
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>
                  <Link
                    href={`/admin/products/${product.slug}/edit`}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-700" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.slug)}
                    disabled={deletingId === product.slug}
                    className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === product.slug ? (
                      <RefreshCw className="h-4 w-4 text-red-600 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate mb-1">{product.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-gray-400 line-through">${product.original_price.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Preview Checkout</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Featured</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                            <Image
                            src={product.images[0]}
                              alt={product.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                            />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                            </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 break-words leading-tight">{product.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-1">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                  <td className="px-4 py-3">
                    {product.published ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                      </td>
                  <td className="px-4 py-3">
                    {product.checkoutLink ? (
                        <a
                          href={product.checkoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Buymeacoffee link
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                      </td>
                  <td className="px-4 py-3 text-center">
                          <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleFeatured(product.slug);
                      }}
                      disabled={togglingFeatured === product.slug || (!(product.isFeatured || product.is_featured) && featuredCount >= FEATURE_LIMIT)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        (product.isFeatured || product.is_featured)
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } disabled:opacity-50`}
                      title={(product.isFeatured || product.is_featured) ? 'Remove from featured' : 'Add to featured'}
                    >
                      {togglingFeatured === product.slug ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Star className={`h-3 w-3 ${(product.isFeatured || product.is_featured) ? 'fill-amber-700' : ''}`} />
                      )}
                      {(product.isFeatured || product.is_featured) ? 'Featured' : 'Feature'}
                          </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                          <button
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/products/${product.slug}`);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View product"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                          <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleFeatured(product.slug);
                        }}
                        disabled={togglingFeatured === product.slug || (!(product.isFeatured || product.is_featured) && featuredCount >= FEATURE_LIMIT)}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                          (product.isFeatured || product.is_featured)
                            ? 'hover:bg-amber-50'
                            : 'hover:bg-gray-100'
                        }`}
                        title={(product.isFeatured || product.is_featured) ? 'Unfeature product' : 'Feature product'}
                      >
                        {togglingFeatured === product.slug ? (
                          <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />
                        ) : (
                          <Star className={`h-4 w-4 ${(product.isFeatured || product.is_featured) ? 'text-amber-500 fill-amber-500' : 'text-gray-500'}`} />
                        )}
                          </button>
                          <Link
                            href={`/admin/products/${product.slug}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                        <Edit className="h-4 w-4 text-gray-500" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.slug)}
                        disabled={deletingId === product.slug}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {deletingId === product.slug ? (
                          <RefreshCw className="h-4 w-4 text-red-600 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600" />
                        )}
                          </button>
                        </div>
                      </td>
                    </tr>
              ))}
              </tbody>
            </table>
          </div>
      )}

          {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
                  <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
            <ChevronLeft className="h-5 w-5" />
                  </button>
                  
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

                        <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
            <ChevronRight className="h-5 w-5" />
                  </button>
        </div>
      )}
    </AdminLayout>
  );
}
