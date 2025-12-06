-- Supabase Storage Setup for Product Images
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  52428800, -- 50MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create policy for public read access (anyone can view images)
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Step 3: Create policy for authenticated uploads (admin can upload)
CREATE POLICY "Authenticated uploads for product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Step 4: Create policy for authenticated updates (admin can update)
CREATE POLICY "Authenticated updates for product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Step 5: Create policy for authenticated deletes (admin can delete)
CREATE POLICY "Authenticated deletes for product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

