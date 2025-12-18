"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Plus, X, Loader2, Package, DollarSign,
  Tag, Star, Image as ImageIcon, Search, CheckCircle, AlertCircle, 
  ChevronDown, Trash2, Eye, Globe, Twitter, Info, User, MapPin,
  Calendar, ThumbsUp, EyeOff
} from 'lucide-react';
import type { Product } from '@/types/product';
import ImageUploader, { ImageUploaderRef, UploadStatus } from '@/components/admin/ImageUploader';
import AdminLayout from '@/components/AdminLayout';
import AdminLoading from '@/components/AdminLoading';

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful?: number;
  verified?: boolean;
  location?: string;
  purchaseDate?: string;
  images?: string[] | string;
}

// Reusable Section Component
function Section({ 
  id, 
  icon: Icon, 
  title, 
  description,
  children,
  defaultOpen = true,
  badge
}: { 
  id: string;
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOpen ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <Icon className={`h-5 w-5 ${isOpen ? 'text-blue-600' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {badge !== undefined && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{badge}</span>
            )}
          </div>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// Input Field Component
function Field({ 
  label, 
  required, 
  hint,
  children 
}: { 
  label: string; 
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function EditProductPage() {
  const FEATURE_LIMIT = 6;
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const imageUploaderRef = useRef<ImageUploaderRef>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ uploading: false });
  const [slugDirty, setSlugDirty] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    slug: '', title: '', description: '', price: '', original_price: '',
    brand: '', category: '', condition: '', payee_email: '', checkout_link: '',
    currency: 'USD', images: '', rating: '0', review_count: '0',
    in_stock: true, is_featured: false, published: false, listed_by: '',
    metaTitle: '', metaDescription: '', metaKeywords: '',
    metaOgTitle: '', metaOgDescription: '', metaOgImage: '',
    metaTwitterTitle: '', metaTwitterDescription: '', metaTwitterImage: '',
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<{ index: number; data: Partial<Review> } | null>(null);
  const [featuredCount, setFeaturedCount] = useState(0);

  // Fetch product
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
        headers: {
          ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Product not found');
      }
      const data = await response.json();
      setProduct(data);
      
      setFormData({
        slug: data.slug || '',
        title: data.title || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        original_price: data.original_price?.toString() || data.originalPrice?.toString() || '',
        brand: data.brand || '',
        category: data.category || '',
        condition: data.condition || '',
        payee_email: data.payeeEmail || data.payee_email || '',
        checkout_link: data.checkoutLink || data.checkout_link || '',
        currency: data.currency || 'USD',
        images: Array.isArray(data.images) ? data.images.join(', ') : data.images || '',
        rating: data.rating?.toString() || '0',
        review_count: data.reviewCount?.toString() || data.review_count?.toString() || '0',
        in_stock: data.inStock ?? data.in_stock ?? true,
        is_featured: data.isFeatured ?? data.is_featured ?? false,
        published: data.meta?.published ?? false,
        listed_by: data.listedBy || data.listed_by || '',
        metaTitle: data.meta?.title || '',
        metaDescription: data.meta?.description || '',
        metaKeywords: data.meta?.keywords || '',
        metaOgTitle: data.meta?.ogTitle || '',
        metaOgDescription: data.meta?.ogDescription || '',
        metaOgImage: data.meta?.ogImage || '',
        metaTwitterTitle: data.meta?.twitterTitle || '',
        metaTwitterDescription: data.meta?.twitterDescription || '',
        metaTwitterImage: data.meta?.twitterImage || '',
      });

      if (data.reviews?.length) {
        setReviews(data.reviews.map((r: any) => ({
          ...r,
          images: Array.isArray(r.images) ? r.images.join(', ') : r.images || '',
        })));
      }

      // Fetch featured count
      const prodRes = await fetch('/api/admin/products', {
        headers: {
          ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
        }
      });
      if (prodRes.ok) {
        const prods = await prodRes.json();
        setFeaturedCount(prods.filter((p: any) => p.isFeatured || p.is_featured).length);
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !slugDirty) {
        updated.slug = slugify(value);
      }
      return updated;
    });
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);

    try {
      let finalImages = formData.images.split(',').map(s => s.trim()).filter(Boolean);

      if (imageUploaderRef.current) {
        const { allImages } = await imageUploaderRef.current.uploadPendingImages();
        if (allImages.length) finalImages = allImages;
      }

      if (!finalImages.length) throw new Error('At least one image is required');

      // Validate listed_by is selected (required for saving)
      if (!formData.listed_by || formData.listed_by.trim() === '') {
        setError('Listed by is required. Please select a user before saving.');
        setSaving(false);
        return;
      }

      // Build meta object, preserving existing meta data
      const existingMeta = product?.meta || {};
      const meta: any = {
        ...existingMeta, // Preserve existing meta fields
      };
      // Always include published status
      meta.published = formData.published;
      // Add other meta fields if they have values
      ['Title', 'Description', 'Keywords', 'OgTitle', 'OgDescription', 'OgImage', 'TwitterTitle', 'TwitterDescription', 'TwitterImage']
        .forEach(key => {
          const val = formData[`meta${key}` as keyof typeof formData];
          if (val) meta[key.charAt(0).toLowerCase() + key.slice(1)] = val;
        });

      const processedReviews = reviews.map(r => ({
        ...r,
        images: typeof r.images === 'string' 
          ? r.images.split(',').map(s => s.trim()).filter(Boolean) 
          : r.images || []
      }));

      const finalSlug = slugify(formData.slug || formData.title);
      if (!finalSlug) throw new Error('URL slug is required');

      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          slug: finalSlug,
          title: formData.title || '',
          description: formData.description || '',
          price: parseFloat(formData.price) || 0,
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          brand: formData.brand || '',
          category: formData.category || '',
          condition: formData.condition || '',
          payee_email: formData.payee_email?.trim() || '',
          checkout_link: formData.checkout_link || '',
          currency: formData.currency || 'USD',
          images: [...new Set(finalImages)],
          rating: parseFloat(formData.rating) || 0,
          review_count: parseInt(formData.review_count) || 0,
          in_stock: formData.in_stock ?? true,
          inStock: formData.in_stock ?? true, // Send both for compatibility
          is_featured: formData.is_featured ?? false,
          listed_by: formData.listed_by,
          reviews: processedReviews,
          meta: meta, // Always send meta object (even if empty, it will be merged properly on server)
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `Update failed: ${response.status} ${response.statusText}` }));
        throw new Error(err.error || 'Update failed');
      }

      const updatedProduct = await response.json();
      
      // Update local product state with the response
      if (updatedProduct) {
        setProduct(updatedProduct);
        // Update formData with the response to ensure consistency
        setFormData(prev => ({
          ...prev,
          published: updatedProduct.meta?.published ?? updatedProduct.published ?? prev.published,
          listed_by: updatedProduct.listedBy || updatedProduct.listed_by || prev.listed_by,
        }));
      }

      setSuccess('Product saved!');
      setHasChanges(false);
      
      if (finalSlug !== slug) {
        setTimeout(() => router.push(`/admin/products/${finalSlug}/edit`), 1000);
      } else {
        // Refetch product to ensure we have the latest data (especially if published status changed)
        await fetchProduct();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openReviewModal = (index?: number) => {
    if (index !== undefined) {
      setEditingReview({ index, data: { ...reviews[index] } });
    } else {
      setEditingReview({ 
        index: -1, 
        data: { id: `r-${Date.now()}`, author: '', rating: 5, date: new Date().toISOString().split('T')[0], title: '', content: '', verified: true }
      });
    }
    setShowReviewModal(true);
  };

  const saveReview = () => {
    if (!editingReview?.data.author || !editingReview?.data.content) return;
    
    const review = editingReview.data as Review;
    if (editingReview.index === -1) {
      setReviews([...reviews, review]);
    } else {
      const updated = [...reviews];
      updated[editingReview.index] = review;
      setReviews(updated);
    }
    setShowReviewModal(false);
    setHasChanges(true);
  };

  const deleteReview = (index: number) => {
    if (confirm('Delete this review?')) {
    setReviews(reviews.filter((_, i) => i !== index));
      setHasChanges(true);
    }
  };

  if (loading) return <AdminLoading message="Loading product..." />;

  if (!product) {
    return (
      <AdminLayout title="Not Found">
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Product not found</p>
          <Link href="/admin/products" className="text-blue-600 hover:underline">← Back to products</Link>
      </div>
      </AdminLayout>
    );
  }

  const discount = formData.original_price && parseFloat(formData.original_price) > parseFloat(formData.price || '0')
    ? Math.round((1 - parseFloat(formData.price || '0') / parseFloat(formData.original_price)) * 100)
    : null;

    return (
    <AdminLayout>
      {/* Compact Sticky Header */}
      <div className="sticky top-0 z-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/products" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-semibold text-gray-900 truncate">{formData.title || 'Untitled Product'}</h1>
              <p className="text-xs text-gray-400">Editing • /{formData.slug}</p>
      </div>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Unsaved
              </span>
            )}
            
            {/* Publish/Unpublish Toggle */}
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, published: !prev.published }));
                setHasChanges(true);
              }}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                formData.published
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {formData.published ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Published</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Not Published</span>
                </>
              )}
            </button>
            
            <Link
              href={`/products/${slug}`}
              target="_blank"
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Preview"
            >
              <Eye className="h-5 w-5 text-gray-500" />
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(error || success) && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          {error ? <AlertCircle className="h-5 w-5 text-red-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
          <span className={error ? 'text-red-700' : 'text-green-700'}>{error || success}</span>
          <button onClick={() => { setError(''); setSuccess(''); }} className="ml-auto p-1 hover:bg-white/50 rounded">
            <X className="h-4 w-4" />
          </button>
            </div>
          )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        
        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: BASIC INFO
        ═══════════════════════════════════════════════════════════════ */}
        <Section id="basic" icon={Package} title="Basic Information" description="Title, description, and product details">
          <div className="space-y-4">
            <Field label="Product Title" required>
                  <input
                    type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter product title"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
              />
            </Field>

            <Field label="URL Slug" hint="Auto-generated from title. Only lowercase letters, numbers, and hyphens.">
              <div className="flex items-center">
                <span className="text-gray-400 text-sm mr-2">/products/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => { setSlugDirty(true); updateField('slug', slugify(e.target.value)); }}
                  placeholder="product-url"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </Field>

            <Field label="Description">
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the product..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </Field>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Brand">
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                  placeholder="Brand"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </Field>
              <Field label="Category">
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  placeholder="Category"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </Field>
              <Field label="Condition">
                <select
                  value={formData.condition}
                  onChange={(e) => updateField('condition', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="">Select</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </Field>
              </div>

            <Field label="Listed by" required>
              <select
                value={formData.listed_by}
                onChange={(e) => updateField('listed_by', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                required
              >
                <option value="">Select a user</option>
                <option value="walid">walid</option>
                <option value="abdo">abdo</option>
                <option value="jebbar">jebbar</option>
                <option value="amine">amine</option>
                <option value="mehdi">mehdi</option>
                <option value="othmane">othmane</option>
                <option value="janah">janah</option>
                <option value="youssef">youssef</option>
              </select>
            </Field>

            {/* Toggle Switches */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100">
              <label className={`inline-flex items-center gap-3 cursor-pointer ${featuredCount >= FEATURE_LIMIT && !formData.is_featured ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                  onChange={(e) => updateField('is_featured', e.target.checked)}
                  disabled={featuredCount >= FEATURE_LIMIT && !formData.is_featured}
                  className="sr-only peer"
                />
                <div className="relative w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-amber-500 transition-colors">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                </div>
                <span className="text-sm text-gray-700">Featured</span>
                <span className="text-xs text-gray-400">({featuredCount}/{FEATURE_LIMIT})</span>
                </label>
              </div>
            </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: PRICING
        ═══════════════════════════════════════════════════════════════ */}
        <Section id="pricing" icon={DollarSign} title="Pricing" description="Set product price and payment details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Price" required>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder="0.00"
                required
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
              </Field>

              <Field label="Original Price" hint="For discount display">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) => updateField('original_price', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              </Field>

              <Field label="Currency">
                <select
                  value={formData.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </Field>
            </div>

            {/* Discount Badge */}
            {discount && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <Tag className="h-4 w-4" />
                <span className="font-medium">{discount}% OFF</span>
                <span className="text-green-600">
                  (Save ${(parseFloat(formData.original_price) - parseFloat(formData.price)).toFixed(2)})
                </span>
            </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <Field label="Checkout Link">
                <input
                  type="url"
                  value={formData.checkout_link}
                  onChange={(e) => updateField('checkout_link', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </Field>
              </div>
            </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: IMAGES
        ═══════════════════════════════════════════════════════════════ */}
        <Section id="media" icon={ImageIcon} title="Images" description="Upload product photos">
          <ImageUploader
            ref={imageUploaderRef}
            productSlug={formData.slug || slug}
            currentImages={formData.images.split(',').map(s => s.trim()).filter(Boolean)}
            onImagesUpdate={(urls) => updateField('images', urls.join(', '))}
            onUploadStatusChange={setUploadStatus}
          />
          {uploadStatus.message && (
            <p className={`mt-3 text-sm ${uploadStatus.uploading ? 'text-blue-600' : 'text-gray-500'}`}>
              {uploadStatus.message}
            </p>
          )}

          {/* Rating override */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
            <Field label="Display Rating" hint="0-5 stars">
                      <input
                        type="number"
                min="0"
                        max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => updateField('rating', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </Field>
            <Field label="Review Count" hint="Displayed review count">
                      <input
                        type="number"
                        min="0"
                value={formData.review_count}
                onChange={(e) => updateField('review_count', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </Field>
                    </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4: SEO (collapsed by default)
        ═══════════════════════════════════════════════════════════════ */}
        <Section id="seo" icon={Search} title="SEO Settings" description="Search engine & social sharing" defaultOpen={false}>
          <div className="space-y-6">
            {/* Basic SEO */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search Engine</h4>
              <Field label="Meta Title" hint={`${(formData.metaTitle || formData.title).length}/60 characters`}>
                    <input
                      type="text"
                  value={formData.metaTitle}
                  onChange={(e) => updateField('metaTitle', e.target.value)}
                  placeholder={formData.title || 'Page title'}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </Field>
              <Field label="Meta Description" hint={`${formData.metaDescription.length}/160 characters`}>
                    <textarea
                  value={formData.metaDescription}
                  onChange={(e) => updateField('metaDescription', e.target.value)}
                  placeholder="Brief description for search results"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </Field>
              <Field label="Keywords" hint="Comma separated">
                    <input
                      type="text"
                  value={formData.metaKeywords}
                  onChange={(e) => updateField('metaKeywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </Field>
                  </div>

            {/* Open Graph */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-4 w-4" /> Open Graph
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="OG Title">
                  <input type="text" value={formData.metaOgTitle} onChange={(e) => updateField('metaOgTitle', e.target.value)} placeholder={formData.title} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </Field>
                <Field label="OG Image URL">
                  <input type="url" value={formData.metaOgImage} onChange={(e) => updateField('metaOgImage', e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </Field>
                  </div>
              <Field label="OG Description">
                <textarea value={formData.metaOgDescription} onChange={(e) => updateField('metaOgDescription', e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
              </Field>
                  </div>

            {/* Twitter */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Twitter className="h-4 w-4" /> Twitter Card
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Twitter Title">
                  <input type="text" value={formData.metaTwitterTitle} onChange={(e) => updateField('metaTwitterTitle', e.target.value)} placeholder={formData.title} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </Field>
                <Field label="Twitter Image URL">
                  <input type="url" value={formData.metaTwitterImage} onChange={(e) => updateField('metaTwitterImage', e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </Field>
                </div>
              <Field label="Twitter Description">
                <textarea value={formData.metaTwitterDescription} onChange={(e) => updateField('metaTwitterDescription', e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
              </Field>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5: REVIEWS (collapsed by default)
        ═══════════════════════════════════════════════════════════════ */}
        <Section id="reviews" icon={Star} title="Reviews" description="Manage customer reviews" defaultOpen={false} badge={reviews.length}>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Star className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No reviews yet</p>
              </div>
            ) : (
                <div className="space-y-3">
                {reviews.map((review, i) => (
                  <div key={review.id || i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl group">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {review.author?.charAt(0)?.toUpperCase()}
                          </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">{review.author}</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                          ))}
                          </div>
                        {review.verified && <CheckCircle className="h-3 w-3 text-green-500" />}
                        </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.content}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => openReviewModal(i)} className="p-1.5 hover:bg-white rounded-lg">
                        <Info className="h-4 w-4 text-gray-400" />
                          </button>
                      <button type="button" onClick={() => deleteReview(i)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            
            <button
              type="button"
              onClick={() => openReviewModal()}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Review
            </button>
            </div>
        </Section>

      </form>

      {/* Review Modal */}
      {showReviewModal && editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{editingReview.index === -1 ? 'Add Review' : 'Edit Review'}</h3>
              <button onClick={() => setShowReviewModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
              </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Author" required>
                <input
                  type="text"
                    value={editingReview.data.author || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, data: { ...editingReview.data, author: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </Field>
                <Field label="Rating">
                  <select
                    value={editingReview.data.rating || 5}
                    onChange={(e) => setEditingReview({ ...editingReview, data: { ...editingReview.data, rating: parseInt(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Title">
                <input
                  type="text"
                  value={editingReview.data.title || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, data: { ...editingReview.data, title: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </Field>
              <Field label="Content" required>
                <textarea
                  value={editingReview.data.content || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, data: { ...editingReview.data, content: e.target.value } })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Location">
                <input
                  type="text"
                    value={editingReview.data.location || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, data: { ...editingReview.data, location: e.target.value } })}
                    placeholder="City, State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </Field>
                <Field label="Date">
                <input
                    type="date"
                    value={editingReview.data.date || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, data: { ...editingReview.data, date: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingReview.data.verified ?? true}
                  onChange={(e) => setEditingReview({ ...editingReview, data: { ...editingReview.data, verified: e.target.checked } })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Verified Purchase</span>
              </label>
              </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button type="button" onClick={saveReview} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save
              </button>
            </div>
        </div>
      </div>
      )}
    </AdminLayout>
  );
}
