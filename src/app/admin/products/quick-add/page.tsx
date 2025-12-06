"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileJson, CheckCircle, XCircle } from 'lucide-react';

export default function QuickAddProductPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const json = JSON.parse(content);
        setJsonInput(JSON.stringify(json, null, 2));
        setError('');
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Parse JSON
      let productData;
      try {
        productData = JSON.parse(jsonInput);
      } catch (parseError) {
        throw new Error('Invalid JSON format. Please check your JSON syntax.');
      }

      // Validate required fields
      const requiredFields = ['slug', 'title', 'description', 'price', 'images', 'condition', 'category', 'brand', 'checkoutLink'];
      const missingFields = requiredFields.filter(field => {
        // Handle camelCase and snake_case variations
        const camelField = field;
        const snakeField = field === 'payeeEmail' ? 'payee_email' : 
                          field === 'checkoutLink' ? 'checkout_link' : 
                          field === 'reviewCount' ? 'review_count' : 
                          field === 'inStock' ? 'in_stock' : field;
        return !productData[camelField] && !productData[snakeField];
      });

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Transform JSON to match API format
      const transformedData = {
        slug: productData.slug || productData.id,
        id: productData.id || productData.slug,
        title: productData.title,
        description: productData.description,
        price: typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price,
        brand: productData.brand,
        category: productData.category,
        condition: productData.condition,
        payee_email: productData.payeeEmail || productData.payee_email || '',
        checkout_link: productData.checkoutLink || productData.checkout_link || '',
        currency: productData.currency || 'USD',
        images: Array.isArray(productData.images) ? productData.images : [],
        rating: productData.rating || 0,
        review_count: productData.reviewCount || productData.review_count || 0,
        reviewCount: productData.reviewCount || productData.review_count || 0,
        reviews: productData.reviews || [],
        meta: productData.meta || {},
        in_stock: productData.inStock !== undefined ? productData.inStock : (productData.in_stock !== undefined ? productData.in_stock : true),
        inStock: productData.inStock !== undefined ? productData.inStock : (productData.in_stock !== undefined ? productData.in_stock : true),
      };

      // Create product
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const product = await response.json();
      setCreatedProduct(product);
      setSuccess(true);
      setJsonInput(''); // Clear form after success

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        router.push(`/admin/products/${product.slug}/edit`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    const sample = {
      slug: "example-product",
      title: "Example Product Title",
      description: "This is an example product description.",
      price: 99.99,
      brand: "Example Brand",
      category: "Example Category",
      condition: "New",
      payeeEmail: "your-email@example.com",
      checkoutLink: "https://buymeacoffee.com/example",
      currency: "USD",
      images: [
        "/products/example-product/img1.webp"
      ],
      rating: 4.5,
      reviewCount: 10,
      inStock: true,
      reviews: [],
      meta: {}
    };
    setJsonInput(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/products"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Quick Add Product via JSON</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-800">Error</div>
                <div className="text-sm text-red-700 mt-1">{error}</div>
              </div>
            </div>
          )}

          {success && createdProduct && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-green-800">Product Created Successfully!</div>
                <div className="text-sm text-green-700 mt-1">
                  Redirecting to edit page for &quot;{createdProduct.title}&quot;...
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Paste Product JSON</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Paste your product JSON here or upload a JSON file
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadSample}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Load Sample
                </button>
                <label className="px-4 py-2 text-sm bg-[#0046be] text-white rounded-lg hover:bg-[#003494] cursor-pointer flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  Upload JSON File
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product JSON
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#0046be] focus:border-[#0046be] font-mono text-sm"
                  placeholder='{\n  "slug": "product-slug",\n  "title": "Product Title",\n  "description": "...",\n  "price": 99.99,\n  ...\n}'
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <div className="font-semibold mb-2">Required Fields:</div>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>slug, title, description, price</li>
                    <li>brand, category, condition</li>
                    <li>checkoutLink (or checkout_link)</li>
                    <li>images (array of image URLs)</li>
                  </ul>
                  <div className="mt-3 text-blue-600">
                    <strong>Optional:</strong> payeeEmail, reviews, meta, rating, reviewCount, currency, inStock
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || !jsonInput.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-[#0046be] text-white rounded-lg hover:bg-[#003494] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-5 w-5" />
                  {loading ? 'Creating Product...' : 'Create Product'}
                </button>
                <Link
                  href="/admin/products"
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Tips:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>You can copy JSON directly from your existing product.json files</li>
              <li>Upload a JSON file using the &quot;Upload JSON File&quot; button</li>
              <li>Click &quot;Load Sample&quot; to see the expected format</li>
              <li>The system handles both camelCase and snake_case field names</li>
              <li>After creation, you&apos;ll be redirected to the product edit page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

