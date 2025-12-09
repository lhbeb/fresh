"use client";

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { uploadImagesSequentially, uploadImageWithRetry } from '@/utils/robustUpload';

interface ImageUploaderProps {
  productSlug: string;
  currentImages: string[];
  onImagesUpdate: (imageUrls: string[]) => void;
  onUploadStatusChange?: (status: UploadStatus) => void;
}

interface PendingImage {
  file: File;
  preview: string;
  id: string;
}

export interface ImageUploaderRef {
  uploadPendingImages: () => Promise<UploadResult>;
  getPendingCount: () => number;
}

export interface UploadStatus {
  uploading: boolean;
  message?: string;
}

export interface UploadResult {
  uploadedUrls: string[];
  allImages: string[];
}

const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  ({ productSlug, currentImages, onImagesUpdate, onUploadStatusChange }, ref) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [dragActiveThumbnail, setDragActiveThumbnail] = useState(false);
    const [dragActiveGallery, setDragActiveGallery] = useState(false);
    
    // Separate pending images: thumbnail (single) and gallery (multiple)
    const [pendingThumbnail, setPendingThumbnail] = useState<PendingImage | null>(null);
    const [pendingGallery, setPendingGallery] = useState<PendingImage[]>([]);
    
    // Drag and drop reordering
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [draggedCurrentIndex, setDraggedCurrentIndex] = useState<number | null>(null);
    const [dragOverCurrentIndex, setDragOverCurrentIndex] = useState<number | null>(null);
    
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Get thumbnail (first image) and gallery (rest)
    const thumbnail = currentImages.length > 0 ? currentImages[0] : null;
    const galleryImages = currentImages.slice(1);

    // Upload pending images function (called from parent on form submit)
    const uploadPendingImages = useCallback(
      async (): Promise<UploadResult> => {
        const baseImages = [...currentImages];

        if (!productSlug) {
          onUploadStatusChange?.({ uploading: false });
          return { uploadedUrls: [], allImages: baseImages };
        }

        if (!pendingThumbnail && pendingGallery.length === 0) {
          onUploadStatusChange?.({ uploading: false });
          return { uploadedUrls: [], allImages: baseImages };
        }

        setUploading(true);
        setUploadProgress('Preparing to upload images...');
        onUploadStatusChange?.({ uploading: true, message: 'Preparing to upload images...' });

        try {
          const uploadedUrls: string[] = [];
          const folderName = productSlug;
          const uploadTasks: Array<{ file: File; path: string; folder: string }> = [];

          // Prepare thumbnail upload (always img1)
          if (pendingThumbnail) {
            const extension = pendingThumbnail.file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `img1.${extension}`;
            const filePath = `${folderName}/${fileName}`;
            uploadTasks.push({
              file: pendingThumbnail.file,
              path: filePath,
              folder: folderName,
            });
          }

          // Prepare gallery image uploads (img2, img3, etc.)
          if (pendingGallery.length > 0) {
            // Get next image number (start from img2 if thumbnail exists, otherwise img1)
            const getNextImageNumber = () => {
              if (thumbnail || pendingThumbnail) return 2; // Thumbnail is img1, gallery starts at img2
              if (galleryImages.length === 0) return 1;
              // Extract numbers from existing gallery image URLs
              const numbers = galleryImages
                .map(url => {
                  const match = url.match(/img(\d+)/);
                  return match ? parseInt(match[1]) : 0;
                })
                .filter(num => num > 0);
              return numbers.length > 0 ? Math.max(...numbers) + 1 : galleryImages.length + 1;
            };

            let startNumber = getNextImageNumber();

            for (let i = 0; i < pendingGallery.length; i++) {
              const { file } = pendingGallery[i];
              const imageNumber = startNumber + i;
              const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
              const fileName = `img${imageNumber}.${extension}`;
              const filePath = `${folderName}/${fileName}`;
              
              uploadTasks.push({
                file,
                path: filePath,
                folder: folderName,
              });
            }
          }

          // Upload all images sequentially with retry mechanism
          const batchResult = await uploadImagesSequentially({
            uploads: uploadTasks,
            onProgress: (current, total, fileName) => {
              const progress = Math.round((current / total) * 100);
              setUploadProgress(`Uploading ${current}/${total}: ${fileName || 'images'}... (${progress}%)`);
              onUploadStatusChange?.({ 
                uploading: true, 
                message: `Uploading ${current}/${total}: ${fileName || 'images'}... (${progress}%)` 
              });
            },
            onImageComplete: (index, result) => {
              if (result.success && result.url) {
                uploadedUrls.push(result.url);
                const fileName = uploadTasks[index]?.file.name || 'image';
                setUploadProgress(`✅ ${fileName} uploaded successfully (${index + 1}/${uploadTasks.length})`);
              } else {
                const fileName = uploadTasks[index]?.file.name || 'image';
                console.warn(`Failed to upload ${fileName}:`, result.error);
                setUploadProgress(`⚠️ ${fileName} failed: ${result.error} (retrying...)`);
              }
            },
            maxRetries: 3,
            retryDelay: 1000,
            timeout: 120000, // 2 minutes per image
          });

          // Clean up preview URLs
          if (pendingThumbnail) {
            URL.revokeObjectURL(pendingThumbnail.preview);
            setPendingThumbnail(null);
          }
          pendingGallery.forEach((img) => {
            URL.revokeObjectURL(img.preview);
          });
          setPendingGallery([]);

          // Check if all uploads succeeded
          if (!batchResult.success) {
            const errorMessages = batchResult.errors.join('; ');
            const errorMsg = `Some images failed to upload. ${batchResult.successful} succeeded, ${batchResult.failed} failed. Errors: ${errorMessages}`;
            
            // If at least one image succeeded, we can continue but warn the user
            if (batchResult.successful > 0) {
              console.warn('Some images failed to upload:', batchResult.errors);
              setUploadProgress(`⚠️ ${batchResult.successful} images uploaded, ${batchResult.failed} failed. Continuing...`);
              onUploadStatusChange?.({ uploading: false, message: `Warning: ${batchResult.failed} image(s) failed to upload.` });
            } else {
              // All uploads failed
              throw new Error(errorMsg);
            }
          } else {
            setUploadProgress('✅ All images uploaded successfully!');
            onUploadStatusChange?.({ uploading: false, message: 'All images uploaded successfully!' });
          }

          // Combine: thumbnail (first) + gallery images
          const allImages: string[] = [];
          
          // Add thumbnail (from upload or existing)
          if (pendingThumbnail && uploadedUrls.length > 0) {
            allImages.push(uploadedUrls[0]);
          } else if (thumbnail) {
            allImages.push(thumbnail);
          }

          // Add existing gallery images
          allImages.push(...galleryImages);

          // Add newly uploaded gallery images
          // Note: uploadedUrls may be in order, but we need to match them correctly
          // Since we upload sequentially, the order should be: thumbnail (if exists) then gallery
          const newGalleryUrls = pendingThumbnail ? uploadedUrls.slice(1) : uploadedUrls;
          allImages.push(...newGalleryUrls);

          const uniqueAllImages = Array.from(new Set(allImages.filter(Boolean)));

          // Update parent
          onImagesUpdate(uniqueAllImages);

          return { uploadedUrls, allImages: uniqueAllImages };
        } catch (error: any) {
          console.error('Upload error:', error);
          setUploadProgress('');
          const errorMessage = error?.message || 'Image upload failed. Please try again.';
          onUploadStatusChange?.({ uploading: false, message: errorMessage });
          throw new Error(errorMessage);
        } finally {
          setUploading(false);
        }
      },
      [productSlug, currentImages, thumbnail, galleryImages, pendingThumbnail, pendingGallery, onImagesUpdate, onUploadStatusChange]
    );

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      uploadPendingImages,
      getPendingCount: () => (pendingThumbnail ? 1 : 0) + pendingGallery.length,
    }), [uploadPendingImages, pendingThumbnail, pendingGallery.length]);

    const handleThumbnailAdded = useCallback(
      (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file (JPEG, PNG, WebP, or GIF)');
          return;
        }

        // Validate file size (10MB max)
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
          alert(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB. Please compress the image or select a smaller file.`);
          return;
        }

        // Remove previous pending thumbnail if exists
        if (pendingThumbnail) {
          URL.revokeObjectURL(pendingThumbnail.preview);
        }

        const newPending: PendingImage = {
          file,
          preview: URL.createObjectURL(file),
          id: `thumbnail-${Date.now()}`,
        };

        setPendingThumbnail(newPending);
      },
      [pendingThumbnail]
    );

    const handleGalleryAdded = useCallback(
      (files: File[]) => {
        if (!files || files.length === 0) return;

        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        Array.from(files).forEach((file) => {
          if (!file.type.startsWith('image/')) {
            invalidFiles.push(`${file.name}: Not an image file`);
            return;
          }
          if (file.size > MAX_FILE_SIZE) {
            invalidFiles.push(`${file.name}: File too large (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            return;
          }
          validFiles.push(file);
        });

        if (invalidFiles.length > 0) {
          alert(`Some files were rejected:\n${invalidFiles.join('\n')}\n\nMaximum file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        }

        if (validFiles.length === 0) {
          if (invalidFiles.length === 0) {
            alert('Please select image files only');
          }
          return;
        }

        const newPending: PendingImage[] = validFiles.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          id: `gallery-${Date.now()}-${Math.random()}`,
        }));

        setPendingGallery((prev) => [...prev, ...newPending]);
      },
      []
    );

    const handleThumbnailDrag = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActiveThumbnail(true);
      } else if (e.type === 'dragleave') {
        setDragActiveThumbnail(false);
      }
    }, []);

    const handleGalleryDrag = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActiveGallery(true);
      } else if (e.type === 'dragleave') {
        setDragActiveGallery(false);
      }
    }, []);

    const handleThumbnailDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActiveThumbnail(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleThumbnailAdded(e.dataTransfer.files[0]); // Only take first file
        }
      },
      [handleThumbnailAdded]
    );

    const handleGalleryDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActiveGallery(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleGalleryAdded(Array.from(e.dataTransfer.files));
        }
      },
      [handleGalleryAdded]
    );

    const handleThumbnailInput = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          handleThumbnailAdded(e.target.files[0]); // Only take first file
        }
        if (e.target) {
          e.target.value = '';
        }
      },
      [handleThumbnailAdded]
    );

    const handleGalleryInput = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          handleGalleryAdded(Array.from(e.target.files));
        }
        if (e.target) {
          e.target.value = '';
        }
      },
      [handleGalleryAdded]
    );

    const removeThumbnail = useCallback(() => {
      if (thumbnail) {
        const newImages = galleryImages; // Remove thumbnail, keep gallery
        onImagesUpdate(newImages);
      }
      if (pendingThumbnail) {
        URL.revokeObjectURL(pendingThumbnail.preview);
        setPendingThumbnail(null);
      }
    }, [thumbnail, galleryImages, pendingThumbnail, onImagesUpdate]);

    const removeGalleryImage = useCallback(
      (index: number) => {
        const newGallery = galleryImages.filter((_, i) => i !== index);
        // Reconstruct images array: thumbnail (if exists) + new gallery
        const allImages = thumbnail ? [thumbnail, ...newGallery] : newGallery;
        onImagesUpdate(allImages);
      },
      [thumbnail, galleryImages, onImagesUpdate]
    );

    const removePendingGalleryImage = useCallback(
      (id: string) => {
        setPendingGallery((prev) => {
          const removed = prev.find(img => img.id === id);
          if (removed) {
            URL.revokeObjectURL(removed.preview);
          }
          return prev.filter(img => img.id !== id);
        });
      },
      []
    );

    // Handle drag and drop reordering for pending gallery images
    const handlePendingGalleryDragStart = useCallback((e: React.DragEvent, id: string) => {
      setDraggedItemId(id);
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
      }
    }, []);

    const handlePendingGalleryDragOver = useCallback((e: React.DragEvent, id: string) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      setDragOverId(id);
    }, []);

    const handlePendingGalleryDragEnd = useCallback(() => {
      setDraggedItemId(null);
      setDragOverId(null);
    }, []);

    const handlePendingGalleryDrop = useCallback(
      (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        setDragOverId(null);

        if (!draggedItemId || draggedItemId === targetId) {
          setDraggedItemId(null);
          return;
        }

        setPendingGallery((prev) => {
          const sourceIndex = prev.findIndex((img) => img.id === draggedItemId);
          const targetIndex = prev.findIndex((img) => img.id === targetId);

          if (sourceIndex === -1 || targetIndex === -1) return prev;

          const newGallery = [...prev];
          const [removed] = newGallery.splice(sourceIndex, 1);
          newGallery.splice(targetIndex, 0, removed);

          return newGallery;
        });

        setDraggedItemId(null);
      },
      [draggedItemId]
    );

    // Handle drag and drop reordering for current gallery images
    const handleCurrentGalleryDragStart = useCallback((e: React.DragEvent, index: number) => {
      setDraggedCurrentIndex(index);
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
      }
    }, []);

    const handleCurrentGalleryDragOver = useCallback((e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      setDragOverCurrentIndex(index);
    }, []);

    const handleCurrentGalleryDragEnd = useCallback(() => {
      setDraggedCurrentIndex(null);
      setDragOverCurrentIndex(null);
    }, []);

    const handleCurrentGalleryDrop = useCallback(
      (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        setDragOverCurrentIndex(null);

        if (draggedCurrentIndex === null || draggedCurrentIndex === targetIndex) {
          setDraggedCurrentIndex(null);
          return;
        }

        const newGallery = [...galleryImages];
        const [removed] = newGallery.splice(draggedCurrentIndex, 1);
        newGallery.splice(targetIndex, 0, removed);

        const allImages = thumbnail ? [thumbnail, ...newGallery] : newGallery;
        onImagesUpdate(allImages);

        setDraggedCurrentIndex(null);
      },
      [draggedCurrentIndex, galleryImages, thumbnail, onImagesUpdate]
    );

    if (!productSlug) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please enter a product slug first to enable image upload.
          </p>
        </div>
      );
    }

    const totalPending = (pendingThumbnail ? 1 : 0) + pendingGallery.length;

    return (
      <div className="space-y-6">
        {/* Thumbnail Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <ImageIcon className="h-4 w-4 inline mr-1" />
            Thumbnail Image (Main Image) *
          </label>
          <p className="text-xs text-gray-600 mb-3">
            This is the main image shown in product listings, cards, and search results. Only one image.
          </p>

          <div
            onDragEnter={handleThumbnailDrag}
            onDragLeave={handleThumbnailDrag}
            onDragOver={handleThumbnailDrag}
            onDrop={handleThumbnailDrop}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${
                dragActiveThumbnail
                  ? 'border-[#0046be] bg-blue-50'
                  : 'border-orange-300 hover:border-orange-400'
              }
              ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
              bg-orange-50/50
            `}
            onClick={() => !uploading && thumbnailInputRef.current?.click()}
          >
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailInput}
              className="hidden"
              disabled={uploading}
            />

            {uploading && pendingThumbnail ? (
              <div className="space-y-2">
                <Loader2 className="h-10 w-10 mx-auto text-[#0046be] animate-spin" />
                <p className="text-sm text-gray-600">{uploadProgress}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 mx-auto text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drag thumbnail image here or click to select
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Will be saved as: <code className="bg-gray-100 px-1 rounded">img1</code>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Current Thumbnail */}
          {(thumbnail || pendingThumbnail) && (
            <div className="mt-4">
              <div className="inline-block relative group">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-orange-400 bg-gray-100">
                  {pendingThumbnail ? (
                    <Image
                      src={pendingThumbnail.preview}
                      alt="Pending thumbnail"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt="Current thumbnail"
                      fill
                      className="object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeThumbnail();
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-opacity"
                      title="Remove thumbnail"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {pendingThumbnail && (
                    <div className="absolute top-1 right-1 bg-orange-600 text-white text-xs px-2 py-0.5 rounded">
                      Pending
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 bg-orange-600 text-white text-xs px-2 py-0.5 rounded font-semibold">
                    Thumbnail
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gallery Images Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <ImageIcon className="h-4 w-4 inline mr-1" />
            Gallery Images (Additional Product Images)
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Additional images shown in product detail page. You can upload multiple images.
          </p>

          <div
            onDragEnter={handleGalleryDrag}
            onDragLeave={handleGalleryDrag}
            onDragOver={handleGalleryDrag}
            onDrop={handleGalleryDrop}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${
                dragActiveGallery
                  ? 'border-[#0046be] bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }
              ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
            onClick={() => !uploading && galleryInputRef.current?.click()}
          >
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleGalleryInput}
              className="hidden"
              disabled={uploading}
            />

            {uploading && pendingGallery.length > 0 ? (
              <div className="space-y-2">
                <Loader2 className="h-10 w-10 mx-auto text-[#0046be] animate-spin" />
                <p className="text-sm text-gray-600">{uploadProgress}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drag gallery images here or click to select
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Will be saved as: <code className="bg-gray-100 px-1 rounded">img2</code>, <code className="bg-gray-100 px-1 rounded">img3</code>, etc.
                  </p>
                  {totalPending > 0 && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      {totalPending} image(s) ready to upload
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pending Gallery Images */}
          {pendingGallery.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Pending Gallery Images ({pendingGallery.length}) - Will upload on Save
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pendingGallery.map((pending) => (
                  <div
                    key={pending.id}
                    className={`relative group transition-transform duration-200 ${
                      draggedItemId === pending.id ? 'opacity-50 scale-95' : ''
                    } ${dragOverId === pending.id ? 'scale-105 border-blue-500' : ''} cursor-move`}
                    draggable
                    onDragStart={(e) => handlePendingGalleryDragStart(e, pending.id)}
                    onDragOver={(e) => handlePendingGalleryDragOver(e, pending.id)}
                    onDragEnd={handlePendingGalleryDragEnd}
                    onDrop={(e) => handlePendingGalleryDrop(e, pending.id)}
                  >
                    <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-blue-300 border-dashed bg-gray-50">
                      <Image
                        src={pending.preview}
                        alt="Pending gallery"
                        fill
                        className="object-cover pointer-events-none"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePendingGalleryImage(pending.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-opacity"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                        Pending
                      </div>
                      <div className="absolute top-1 left-1 bg-blue-600 text-white p-1 rounded">
                        <GripVertical className="h-3 w-3" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1 truncate">
                      {pending.file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Gallery Images */}
          {galleryImages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Current Gallery Images ({galleryImages.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryImages.map((url, index) => (
                  <div
                    key={index}
                    className={`relative group transition-transform duration-200 ${
                      draggedCurrentIndex === index ? 'opacity-50 scale-95' : ''
                    } ${dragOverCurrentIndex === index ? 'scale-105 border-blue-500' : ''} cursor-move`}
                    draggable
                    onDragStart={(e) => handleCurrentGalleryDragStart(e, index)}
                    onDragOver={(e) => handleCurrentGalleryDragOver(e, index)}
                    onDragEnd={handleCurrentGalleryDragEnd}
                    onDrop={(e) => handleCurrentGalleryDrop(e, index)}
                  >
                    <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <Image
                        src={url}
                        alt={`Gallery image ${index + 2}`}
                        fill
                        className="object-cover pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGalleryImage(index);
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-opacity"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute top-1 left-1 bg-gray-700 text-white p-1 rounded">
                        <GripVertical className="h-3 w-3" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      img{index + 2}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Message */}
        {uploadProgress && !uploading && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{uploadProgress}</p>
          </div>
        )}
      </div>
    );
  }
);

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader;
