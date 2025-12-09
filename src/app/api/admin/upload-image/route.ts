import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Maximum file size: 10MB (adjust as needed)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Set a longer timeout for large file uploads
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const path = formData.get('path') as string;

      if (!file) {
        clearTimeout(timeoutId);
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      if (!path) {
        clearTimeout(timeoutId);
        return NextResponse.json(
          { error: 'No path provided' },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        clearTimeout(timeoutId);
        return NextResponse.json(
          { 
            error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` 
          },
          { status: 400 }
        );
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        clearTimeout(timeoutId);
        return NextResponse.json(
          { error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      // Convert File to ArrayBuffer for Supabase
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Supabase Storage with timeout
      const uploadPromise = supabaseAdmin.storage
        .from('product-images')
        .upload(path, buffer, {
          contentType: file.type,
          upsert: true, // Overwrite if exists
        });

      const { data, error } = await Promise.race([
        uploadPromise,
        new Promise<{ data: null; error: { message: string } }>((_, reject) => {
          setTimeout(() => reject(new Error('Upload timeout')), 100000); // 100 seconds
        })
      ]) as any;

      clearTimeout(timeoutId);

      if (error) {
        console.error('Supabase storage error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to upload image to storage' },
          { status: 500 }
        );
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);

      if (!publicUrl) {
        return NextResponse.json(
          { error: 'Failed to generate public URL for uploaded image' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        url: publicUrl,
        path: data.path,
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout errors
      if (error.name === 'AbortError' || error.message === 'Upload timeout') {
        return NextResponse.json(
          { error: 'Upload request timed out. The file may be too large or the connection is slow. Please try again with a smaller file.' },
          { status: 408 }
        );
      }

      console.error('Upload error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to upload image' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process upload request' },
      { status: 500 }
    );
  }
}

