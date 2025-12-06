"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, CheckCircle2, X, Send, ThumbsUp, ZoomIn, Upload, Image as ImageIcon } from 'lucide-react';
import type { Review } from '@/types/product';

interface HomeReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

function getRandomHelpful(id: string) {
  // Use a seeded pseudo-random for stable numbers per review
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const min = 9, max = 27;
  return min + (Math.abs(hash) % (max - min + 1));
}

const HomeReviews: React.FC<HomeReviewsProps> = ({ 
  reviews = [], 
  averageRating = 0, 
  totalReviews = 0 
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    orderId: '',
    rating: 5,
    title: '',
    content: ''
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  // Track likes per review (not persisted)
  const [likes, setLikes] = useState(() => {
    const initial: Record<string, number> = {};
    reviews.forEach(r => {
      // Use review.helpful if it exists, otherwise use random
      initial[r.id] = r.helpful || getRandomHelpful(r.id);
    });
    return initial;
  });
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Placeholder avatar for reviews without custom avatars
  const placeholderAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80";

  // Show only 6 reviews
  const displayReviews = reviews.slice(0, 6);

  const handleLike = (id: string) => {
    if (liked[id]) return;
    setLikes(l => ({ ...l, [id]: (l[id] || 0) + 1 }));
    setLiked(l => ({ ...l, [id]: true }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fake upload - just create preview URLs (doesn't actually upload)
    Array.from(files).slice(0, 5 - uploadedImages.length).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submit-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowReviewForm(false);
        setShowSuccess(true);
        setFormData({ name: '', orderId: '', rating: 5, title: '', content: '' });
        setUploadedImages([]); // Clear uploaded images
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        console.error('Failed to submit review:', result.error);
        alert('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (reviews.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-8 w-8 text-gray-300" />
                ))}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your experience with our products!</p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-[#0046be] hover:bg-[#003494] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Reviews Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                {/* Rating Summary */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Customer Reviews</h2>
                  <p className="text-sm text-gray-600 mb-3">What our customers are saying about their shopping experience</p>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                    <div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-5 w-5 ${i < Math.floor(averageRating) ? 'text-[#0046be] fill-[#0046be]' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Based on {totalReviews} reviews</p>
                    </div>
                  </div>
                </div>

                {/* Write Review Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-[#0046be] hover:bg-[#003494] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Write a Review
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {displayReviews.map((review, index) => {
                const reviewImages = Array.isArray(review.images) ? review.images : [];
                const previewImages = reviewImages.slice(0, 4);

                return (
                  <div key={`${review.id}-${index}`} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <Image 
                      src={review.avatar || placeholderAvatar} 
                      alt={review.author}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                            {review.author}
                            {review.verified && (
                              <span className="flex items-center text-[#0046be] text-xs whitespace-nowrap">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Verified
                              </span>
                            )}
                          </h3>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {review.location && `${review.location} • `}
                            {formatDate(review.date)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleLike(review.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors duration-200 text-xs flex-shrink-0 ${
                            liked[review.id] 
                              ? 'bg-[#0046be] text-white' 
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                          }`}
                          aria-pressed={liked[review.id]}
                          disabled={liked[review.id]}
                          title={liked[review.id] ? 'You found this helpful' : 'Mark as helpful'}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span className="font-medium">{likes[review.id] || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {review.productTitle && review.productSlug && (
                    <div className="mb-2">
                      <span className="text-xs text-[#0046be] hover:text-[#003494] hover:underline cursor-default inline-flex items-center gap-1">
                        {review.productTitle}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`h-3.5 w-3.5 ${i < review.rating ? 'text-[#0046be] fill-[#0046be]' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 mb-2 text-sm">{review.title}</h4>
                  <p className="text-gray-600 text-sm line-clamp-4 mb-3">{review.content}</p>
                  
                  {/* Review Images Gallery */}
                  {reviewImages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {previewImages.map((img, imgIndex) => (
                        <button
                          key={imgIndex}
                          onClick={() => setSelectedImage(img)}
                          className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-200 group cursor-pointer hover:ring-2 ring-[#0046be] transition-all duration-200"
                        >
                          <Image
                            src={img}
                            alt={`Review image ${imgIndex + 1} by ${review.author}`}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                            <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                          {reviewImages.length > 4 && imgIndex === 3 && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                              <span className="text-white text-[10px] font-semibold">+{reviewImages.length - 4}</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  </div>
                );
              })}
            </div>

            {/* Show More Reviews Link */}
            {reviews.length > 6 && (
              <div className="p-6 border-t border-gray-200 text-center">
                <p className="text-gray-600">
                  Showing 6 of {totalReviews} reviews
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowReviewForm(false);
            setUploadedImages([]);
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setUploadedImages([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0046be] focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID
                  </label>
                  <input
                    type="text"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0046be] focus:border-transparent"
                    placeholder="Enter your order ID (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: i + 1 })}
                        className={`p-1 ${i < formData.rating ? 'text-[#f4de40]' : 'text-gray-300'}`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0046be] focus:border-transparent"
                    placeholder="Summarize your experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Content
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0046be] focus:border-transparent resize-none"
                    placeholder="Share your detailed experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Photos (Optional)
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0046be] hover:bg-blue-50 transition-colors duration-200">
                      <Upload className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Choose photos to upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadedImages.length >= 5}
                      />
                    </label>
                    
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={img}
                                alt={`Upload ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 25vw, 64px"
                                unoptimized
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                aria-label="Remove image"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {uploadedImages.length > 0 && uploadedImages.length < 5 && (
                      <p className="text-xs text-gray-500">
                        {uploadedImages.length} of 5 photos uploaded
                      </p>
                    )}
                    {uploadedImages.length >= 5 && (
                      <p className="text-xs text-amber-600">
                        Maximum 5 photos allowed
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setUploadedImages([]);
                  }}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${
                    isSubmitting 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-[#0046be] hover:bg-[#003494] text-white'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>Review submitted successfully!</span>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close image"
          >
            <X className="h-8 w-8" />
          </button>
          <div
            className="relative max-w-7xl w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '90vh' }}
          >
            <div className="relative w-full" style={{ maxHeight: '90vh', aspectRatio: '4 / 3' }}>
              <Image
                src={selectedImage}
                alt="Enlarged review image"
                fill
                className="object-contain rounded-lg"
                sizes="100vw"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeReviews; 