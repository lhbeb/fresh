"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, Search, Plus, Edit, Trash2, ExternalLink, 
  Filter, Grid3X3, List, MoreVertical, Eye, X,
  ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Star, PackageX, PackageCheck,
  Download, CheckSquare, Square
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
  inStock?: boolean;
  created_at: string;
  checkoutLink?: string;
  isFeatured?: boolean;
  is_featured?: boolean;
  published?: boolean;
  listedBy?: string | null;
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
  const [listedByFilter, setListedByFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const [togglingStock, setTogglingStock] = useState<string | null>(null);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-trigger')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

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

    // Apply listed_by filter
    if (listedByFilter !== 'all') {
      if (listedByFilter === 'none') {
        // Filter for products without listed_by
        filtered = filtered.filter(p => !p.listedBy || p.listedBy === null || p.listedBy === '');
      } else {
        // Filter for specific listed_by value
        filtered = filtered.filter(p => p.listedBy === listedByFilter);
      }
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, featuredFilter, listedByFilter, products]);

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
      
      // Remove from selection if selected
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(slug);
        return newSet;
      });
      
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

  const handleToggleStock = async (slug: string) => {
    const product = products.find(p => p.slug === slug);
    if (!product) return;

    const isCurrentlyInStock = product.inStock !== false;

    setTogglingStock(slug);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          inStock: !isCurrentlyInStock
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || errorData.details || 'Failed to update product';
        console.error('❌ [MARK-SOLD-OUT] Error response:', errorData);
        throw new Error(errorMsg);
      }

      const result = await response.json();
      
      // Update local state - the API returns inStock (camelCase)
      const newInStock = result.inStock !== undefined ? result.inStock : !isCurrentlyInStock;
      setProducts(prev => prev.map(p => 
        p.slug === slug 
          ? { ...p, inStock: newInStock }
          : p
      ));
      setFilteredProducts(prev => prev.map(p => 
        p.slug === slug 
          ? { ...p, inStock: newInStock }
          : p
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update stock status');
    } finally {
      setTogglingStock(null);
    }
  };

  const handleToggleSelect = (slug: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      // Deselect all
      setSelectedProducts(new Set());
    } else {
      // Select all on current page
      setSelectedProducts(new Set(paginatedProducts.map(p => p.slug)));
    }
  };

  const handleSelectAllFiltered = () => {
    if (selectedProducts.size === filteredProducts.length && filteredProducts.length > 0) {
      // Deselect all
      setSelectedProducts(new Set());
    } else {
      // Select all filtered products
      setSelectedProducts(new Set(filteredProducts.map(p => p.slug)));
    }
  };

  const handleExport = async () => {
    if (selectedProducts.size === 0) {
      setError('Please select at least one product to export');
      return;
    }

    setExporting(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/products/bulk-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          slugs: Array.from(selectedProducts)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to export products');
      }

      // Get the ZIP file as blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'products-export.zip';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Clear selection after successful export
      setSelectedProducts(new Set());
    } catch (err: any) {
      setError(err.message || 'Failed to export products');
      console.error('Export error:', err);
    } finally {
      setExporting(false);
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

          {/* Listed By Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
                <select
              value={listedByFilter}
              onChange={(e) => setListedByFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
            >
              <option value="all">All Uploaders</option>
              <option value="walid">walid</option>
              <option value="abdo">abdo</option>
              <option value="jebbar">jebbar</option>
              <option value="amine">amine</option>
              <option value="othmane">othmane</option>
              <option value="janah">janah</option>
              <option value="youssef">youssef</option>
              <option value="none">Not Assigned</option>
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

            {selectedProducts.size > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {exporting ? 'Exporting...' : `Export (${selectedProducts.size})`}
                </span>
              </button>
            )}

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

      {/* Selection Controls */}
      {selectedProducts.size > 0 && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedProducts.size === paginatedProducts.length ? 'Deselect Page' : 'Select Page'}
            </button>
            <button
              onClick={handleSelectAllFiltered}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedProducts.size === filteredProducts.length && filteredProducts.length > 0 ? 'Deselect All Filtered' : 'Select All Filtered'}
            </button>
            <button
              onClick={() => setSelectedProducts(new Set())}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Filter Status */}
      {(searchQuery || statusFilter !== 'all' || featuredFilter !== 'all' || listedByFilter !== 'all') && (
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-sm text-blue-700">
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
            {statusFilter === 'published' && ` (${products.filter(p => p.published).length} published)`}
            {statusFilter === 'draft' && ` (${products.filter(p => !p.published).length} drafts)`}
            {featuredFilter === 'featured' && ` (${featuredCount} featured)`}
            {listedByFilter !== 'all' && listedByFilter !== 'none' && ` (listed by: ${listedByFilter})`}
            {listedByFilter === 'none' && ` (not assigned)`}
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
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md hover:border-gray-200 transition-all relative"
            >
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleSelect(product.slug);
                  }}
                  className={`p-1.5 rounded-lg bg-white/90 backdrop-blur-sm border-2 transition-all ${
                    selectedProducts.has(product.slug)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {selectedProducts.has(product.slug) ? (
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

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
                  {product.inStock === false && (
                    <div className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <PackageX className="h-3 w-3" />
                      Sold Out
                    </div>
                  )}
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleStock(product.slug);
                    }}
                    disabled={togglingStock === product.slug}
                    className={`p-2 rounded-lg transition-colors ${
                      product.inStock !== false
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    } disabled:opacity-50`}
                    title={product.inStock !== false ? 'Mark as sold out' : 'Mark as in stock'}
                  >
                    {togglingStock === product.slug ? (
                      <RefreshCw className="h-4 w-4 text-white animate-spin" />
                    ) : product.inStock !== false ? (
                      <PackageCheck className="h-4 w-4 text-white" />
                    ) : (
                      <PackageX className="h-4 w-4 text-white" />
                    )}
                  </button>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-12">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title={selectedProducts.size === paginatedProducts.length ? 'Deselect all' : 'Select all'}
                  >
                    {selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Listed By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden xl:table-cell">Preview Checkout</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Featured</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleSelect(product.slug);
                      }}
                      className={`p-1.5 rounded-lg border-2 transition-all ${
                        selectedProducts.has(product.slug)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {selectedProducts.has(product.slug) ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </td>
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
                        {/* Show status badges on small screens */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 md:hidden">
                          {!product.published && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                              Draft
                            </span>
                          )}
                          {(product.isFeatured || product.is_featured) && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">
                              <Star className="h-2.5 w-2.5 fill-blue-700" />
                              Featured
                            </span>
                          )}
                          {product.inStock === false && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded">
                              <PackageX className="h-2.5 w-2.5" />
                              Sold Out
                            </span>
                          )}
                        </div>
                          </div>
                        </div>
                      </td>
                  <td className="px-4 py-3 hidden md:table-cell">
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
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-700">{product.listedBy || '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
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
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
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
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleStock(product.slug);
                      }}
                      disabled={togglingStock === product.slug}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        product.inStock !== false
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      } disabled:opacity-50`}
                      title={product.inStock !== false ? 'Mark as sold out' : 'Mark as in stock'}
                    >
                      {togglingStock === product.slug ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : product.inStock !== false ? (
                        <PackageCheck className="h-3 w-3" />
                      ) : (
                        <PackageX className="h-3 w-3" />
                      )}
                      {product.inStock !== false ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 relative">
                      {/* Desktop: Show all action buttons */}
                      <div className="hidden xl:flex items-center gap-1">
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

                      {/* Mobile/Tablet: Show three-dot menu */}
                      <div className="xl:hidden relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === product.slug ? null : product.slug);
                          }}
                          className="dropdown-trigger p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="More actions"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdown === product.slug && (
                          <div className="dropdown-menu absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                router.push(`/products/${product.slug}`);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <Eye className="h-4 w-4 text-gray-400" />
                              <span>View Product</span>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleToggleFeatured(product.slug);
                                setOpenDropdown(null);
                              }}
                              disabled={togglingFeatured === product.slug || (!(product.isFeatured || product.is_featured) && featuredCount >= FEATURE_LIMIT)}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {togglingFeatured === product.slug ? (
                                <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />
                              ) : (
                                <Star className={`h-4 w-4 ${(product.isFeatured || product.is_featured) ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                              )}
                              <span>{(product.isFeatured || product.is_featured) ? 'Unfeature Product' : 'Feature Product'}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleToggleStock(product.slug);
                                setOpenDropdown(null);
                              }}
                              disabled={togglingStock === product.slug}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {togglingStock === product.slug ? (
                                <RefreshCw className="h-4 w-4 text-green-600 animate-spin" />
                              ) : product.inStock !== false ? (
                                <PackageCheck className="h-4 w-4 text-green-600" />
                              ) : (
                                <PackageX className="h-4 w-4 text-red-600" />
                              )}
                              <span>{product.inStock !== false ? 'Mark as Sold Out' : 'Mark as In Stock'}</span>
                            </button>

                            <Link
                              href={`/admin/products/${product.slug}/edit`}
                              onClick={() => setOpenDropdown(null)}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors block"
                            >
                              <Edit className="h-4 w-4 text-gray-400" />
                              <span>Edit Product</span>
                            </Link>

                            <div className="border-t border-gray-100 my-1"></div>

                            <button
                              onClick={() => {
                                handleDelete(product.slug);
                                setOpenDropdown(null);
                              }}
                              disabled={deletingId === product.slug}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === product.slug ? (
                                <RefreshCw className="h-4 w-4 text-red-600 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-600" />
                              )}
                              <span>Delete Product</span>
                            </button>
                          </div>
                        )}
                      </div>
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
