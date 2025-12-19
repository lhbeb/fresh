/**
 * Robust Image Upload Utility
 * Handles retries, exponential backoff, sequential uploads, and better error handling
 */

export interface UploadOptions {
  file: File;
  path: string;
  folder: string;
  onProgress?: (progress: number) => void;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
  retries?: number;
}

/**
 * Sleep utility for delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parse response as JSON with fallback for HTML/plain text errors
 */
async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch (e) {
      // If JSON parsing fails, return the text as error
      return { error: text || 'Invalid JSON response' };
    }
  }
  
  // If not JSON, it's likely an HTML error page
  // Try to extract error message from common HTML error pages
  if (text.includes('Request Entity Too Large') || text.includes('413')) {
    return { error: 'File is too large. Maximum size is 10MB.' };
  }
  if (text.includes('Timeout') || text.includes('408')) {
    return { error: 'Upload request timed out. Please try again.' };
  }
  if (text.includes('500') || text.includes('Internal Server Error')) {
    return { error: 'Server error occurred. Please try again later.' };
  }
  
  // Return generic error with status
  return { 
    error: `Server returned ${response.status} ${response.statusText}. ${text.substring(0, 200)}` 
  };
}

/**
 * Upload a single image with retry mechanism
 */
export async function uploadImageWithRetry(
  options: UploadOptions
): Promise<UploadResult> {
  const {
    file,
    path,
    folder,
    onProgress,
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 120000, // 2 minutes default timeout
  } = options;

  let lastError: string | undefined;
  let attempt = 0;

  // Validate file before attempting upload
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    };
  }

  while (attempt <= maxRetries) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      formData.append('folder', folder);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle different response statuses
        if (response.ok) {
          const data = await parseResponse(response);
          
          if (data.error) {
            throw new Error(data.error);
          }

          if (data.url) {
            onProgress?.(100);
            return {
              success: true,
              url: data.url,
              path: data.path || path,
              retries: attempt,
            };
          } else {
            throw new Error('Upload succeeded but no URL was returned');
          }
        } else {
          // Handle non-OK responses
          const errorData = await parseResponse(response);
          const errorMessage = errorData.error || `Server returned ${response.status} ${response.statusText}`;
          
          // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
          if (response.status >= 400 && response.status < 500 && 
              response.status !== 408 && response.status !== 429) {
            return {
              success: false,
              error: errorMessage,
              retries: attempt,
            };
          }
          
          throw new Error(errorMessage);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Handle abort/timeout
        if (fetchError.name === 'AbortError' || controller.signal.aborted) {
          throw new Error('Upload request timed out. Please try again with a smaller file or check your connection.');
        }
        
        throw fetchError;
      }
    } catch (error: any) {
      attempt++;
      lastError = error.message || 'Unknown error occurred';

      // Don't retry if it's a validation error or client error (except timeout/rate limit)
      if (error.message?.includes('File size') || 
          error.message?.includes('File type') ||
          error.message?.includes('No file') ||
          error.message?.includes('No path')) {
        return {
          success: false,
          error: lastError,
          retries: attempt - 1,
        };
      }

      // If we've exhausted retries, return error
      if (attempt > maxRetries) {
        return {
          success: false,
          error: lastError,
          retries: attempt - 1,
        };
      }

      // Calculate exponential backoff delay
      const delay = retryDelay * Math.pow(2, attempt - 1);
      onProgress?.(0); // Reset progress on retry
      
      // Wait before retrying
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError || 'Upload failed after all retry attempts',
    retries: attempt - 1,
  };
}

/**
 * Upload multiple images sequentially with progress tracking
 */
export interface BatchUploadOptions {
  uploads: Array<{
    file: File;
    path: string;
    folder: string;
  }>;
  onProgress?: (current: number, total: number, fileName: string) => void;
  onImageComplete?: (index: number, result: UploadResult) => void;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface BatchUploadResult {
  success: boolean;
  results: UploadResult[];
  successful: number;
  failed: number;
  errors: string[];
}

export async function uploadImagesSequentially(
  options: BatchUploadOptions
): Promise<BatchUploadResult> {
  const {
    uploads,
    onProgress,
    onImageComplete,
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 120000,
  } = options;

  const results: UploadResult[] = [];
  const errors: string[] = [];
  let successful = 0;
  let failed = 0;

  // Upload images one at a time to avoid overwhelming the server
  for (let i = 0; i < uploads.length; i++) {
    const upload = uploads[i];
    
    onProgress?.(i, uploads.length, upload.file.name);

    const result = await uploadImageWithRetry({
      file: upload.file,
      path: upload.path,
      folder: upload.folder,
      onProgress: (progress) => {
        // Calculate overall progress
        const overallProgress = ((i / uploads.length) * 100) + (progress / uploads.length);
        onProgress?.(i, uploads.length, upload.file.name);
      },
      maxRetries,
      retryDelay,
      timeout,
    });

    results.push(result);
    onImageComplete?.(i, result);

    if (result.success) {
      successful++;
    } else {
      failed++;
      errors.push(`${upload.file.name}: ${result.error}`);
    }

    // Small delay between uploads to avoid rate limiting
    if (i < uploads.length - 1) {
      await sleep(200); // 200ms delay between uploads
    }
  }

  onProgress?.(uploads.length, uploads.length, '');

  return {
    success: failed === 0,
    results,
    successful,
    failed,
    errors,
  };
}



