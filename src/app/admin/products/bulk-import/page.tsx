"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, FileArchive, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface ImportResult {
  success: boolean;
  productSlug?: string;
  error?: string;
}

interface ImportResponse {
  success: boolean;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: ImportResult[];
  error?: string;
}

export default function BulkImportPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        handleFileUpload(file);
      } else {
        setError('Please upload a ZIP file (.zip)');
      }
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip')) {
        handleFileUpload(file);
      } else {
        setError('Please upload a ZIP file (.zip)');
      }
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    // Reset state
    setError('');
    setImportResult(null);
    setUploading(true);
    setUploadProgress('Preparing upload...');

    // Validate file size (8MB limit)
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB
    if (file.size > MAX_SIZE) {
      setError(`File size exceeds 8MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      setUploading(false);
      return;
    }

    if (file.size === 0) {
      setError('ZIP file is empty');
      setUploading(false);
      return;
    }

    try {
      setUploadProgress('Uploading ZIP file...');

      const formData = new FormData();
      formData.append('zipFile', file);

      setUploadProgress('Processing ZIP file and extracting products...');

      const response = await fetch('/api/admin/products/bulk-import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import products');
      }

      setUploadProgress('Importing products to database...');

      const data: ImportResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data);
      setUploadProgress('');
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import products. Please check the ZIP file structure and try again.');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="Bulk Import" subtitle="Import multiple products from ZIP file">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-800 mb-1">Import Error</div>
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {uploadProgress && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-800">Processing...</div>
                  <div className="text-sm text-blue-700">{uploadProgress}</div>
                </div>
              </div>
            </div>
          )}

          {importResult && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-green-800 mb-2">Import Complete!</div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>
                      <strong>Total Products:</strong> {importResult.summary.total}
                    </div>
                    <div>
                      <strong className="text-green-600">Successfully Imported:</strong> {importResult.summary.successful}
                    </div>
                    {importResult.summary.failed > 0 && (
                      <div>
                        <strong className="text-red-600">Failed:</strong> {importResult.summary.failed}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">How to Use Bulk Import</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-[#0046be]">1.</span>
                <div>
                  <strong>Prepare your ZIP file:</strong> Each product should be in its own folder inside the ZIP.
                  <div className="mt-2 p-3 bg-gray-50 rounded border font-mono text-xs">
                    products.zip<br />
                    ├── product-slug-1/<br />
                    │   ├── product.json<br />
                    │   ├── img1.jpg<br />
                    │   └── img2.png<br />
                    └── product-slug-2/<br />
                        ├── product.json<br />
                        └── img1.webp
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-[#0046be]">2.</span>
                <div>
                  <strong>product.json structure:</strong> Must include slug, title, description, price, images (array of filenames), condition, category, brand, checkoutLink.
                  <div className="mt-2 p-3 bg-gray-50 rounded border font-mono text-xs">
                    {`{
  "slug": "product-slug",
  "title": "Product Title",
  "description": "...",
  "price": 99.99,
  "images": ["img1.jpg", "img2.png"],
  "condition": "New",
  "category": "Electronics",
  "brand": "BrandX",
  "checkoutLink": "https://..."
}`}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-[#0046be]">3.</span>
                <div>
                  <strong>Upload ZIP file:</strong> Maximum size is 8MB per ZIP. Images will be automatically uploaded to Supabase Storage.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-[#0046be]">4.</span>
                <div>
                  <strong>Note:</strong> Products with the same slug will be updated (upserted). Images will be renamed to img1, img2, img3, etc.
                </div>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Upload Product ZIP File</h2>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-colors
                ${
                  dragActive
                    ? 'border-[#0046be] bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }
                ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
              `}
              onClick={() => !uploading && document.getElementById('zip-file-input')?.click()}
            >
              <input
                id="zip-file-input"
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={handleFileInput}
                className="hidden"
                disabled={uploading}
              />

              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto text-[#0046be] animate-spin" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">Processing...</p>
                    <p className="text-sm text-gray-500 mt-2">{uploadProgress || 'Please wait'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileArchive className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drag and drop your ZIP file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Maximum file size: 8MB
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-6 py-2 bg-[#0046be] text-white rounded-lg hover:bg-[#003494] transition-colors"
                    >
                      <Upload className="h-5 w-5" />
                      Select ZIP File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Table */}
          {importResult && importResult.results.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Import Results</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importResult.results.map((result, index) => (
                      <tr key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {result.productSlug || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {result.success ? (
                            <span className="inline-flex items-center gap-1 text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-700">
                              <XCircle className="h-4 w-4" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {result.error || 'Product imported successfully'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <Link
              href="/admin/products"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Products
            </Link>
            {importResult && (
              <button
                onClick={() => {
                  setImportResult(null);
                  setError('');
                  setUploadProgress('');
                  // Reset file input
                  const input = document.getElementById('zip-file-input') as HTMLInputElement;
                  if (input) input.value = '';
                }}
                className="px-6 py-2 bg-[#0046be] text-white rounded-lg hover:bg-[#003494] transition-colors"
              >
                Import Another ZIP
              </button>
            )}
          </div>
        </div>
    </AdminLayout>
  );
}

