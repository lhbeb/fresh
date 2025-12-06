# Upload Images to Supabase Storage - Guide

This guide will help you upload all product images to Supabase Storage and update the database automatically.

## Step 1: Create Storage Bucket

Run the SQL setup in Supabase:

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New query"**
3. Open `supabase-storage-setup.sql` from this project
4. Copy **ALL** the contents
5. Paste into SQL Editor
6. Click **"Run"**
7. You should see: **"Success. No rows returned"** ✅

This will:
- ✅ Create `product-images` bucket
- ✅ Set up public read access
- ✅ Set up authenticated upload/update/delete policies

## Step 2: Run the Upload Script

After creating the bucket, run:

```bash
npm run upload-images
```

This script will:
1. ✅ Scan all product directories in `/public/products/`
2. ✅ Upload each image to Supabase Storage
3. ✅ Store in structure: `[product-slug]/img1.webp`
4. ✅ Get public URLs from Supabase
5. ✅ Update product records in database with new URLs
6. ✅ Show progress for each image

## Storage Structure

Images will be organized like this in Supabase Storage:

```
product-images/
  ├── canon-camera-g7x-mark-iii/
  │   ├── img1.webp
  │   ├── img2.webp
  │   └── ...
  ├── ninja-slushi-frozen-drink-maker/
  │   ├── img1.webp
  │   └── ...
  └── ...
```

**Benefits:**
- ✅ Organized by product slug
- ✅ Easy to find/manage
- ✅ Matches your current structure
- ✅ URLs like: `https://vfuedgrheyncotoxseos.supabase.co/storage/v1/object/public/product-images/canon-camera-g7x-mark-iii/img1.webp`

## Expected Output

```
🚀 Starting image upload to Supabase Storage...

📦 Found 42 product directories

📸 Processing canon-camera-g7x-mark-iii (12 images)...
  ✅ img1.webp
  ✅ img2.webp
  ...
  ✅ Updated database with 12 images

📸 Processing ninja-slushi... (6 images)...
  ✅ img1.webp
  ...

============================================================
📊 Upload Summary:
   ✅ Images uploaded: 245
   ❌ Errors: 0
   📦 Products processed: 42
============================================================

🎉 Image upload completed successfully!

✨ All image URLs have been updated in the database.
💡 You can now delete images from /public/products/ if you want (optional)

✨ Done!
```

## What Happens

### Before Upload
- Images in: `/public/products/[slug]/img1.webp`
- Database paths: `/products/[slug]/img1.webp`
- Served by: Next.js from public folder

### After Upload
- Images in: Supabase Storage `product-images/[slug]/img1.webp`
- Database URLs: `https://vfuedgrheyncotoxseos.supabase.co/storage/v1/object/public/product-images/[slug]/img1.webp`
- Served by: Supabase CDN

## Verify Upload

After upload:

1. **Check Supabase Storage:**
   - Go to Supabase Dashboard → **Storage**
   - Click on **`product-images`** bucket
   - You should see all product folders and images

2. **Check Database:**
   - Go to **Table Editor** → **products**
   - Open any product
   - Check `images` array - should have Supabase Storage URLs

3. **Check Your Site:**
   - Visit `/admin/products`
   - Products should show images correctly
   - Visit main site - images should load from Supabase CDN

## Troubleshooting

### Error: "Bucket not found"
**Solution:** Make sure you ran `supabase-storage-setup.sql` first (Step 1)

### Error: "Permission denied"
**Solution:** Check that storage policies are set up correctly in the SQL

### Error: "File too large"
**Solution:** Images are limited to 50MB per file (configurable in bucket setup)

### Some images failed
- Check error messages
- Verify file paths exist
- Make sure file extensions are supported (.jpg, .jpeg, .png, .webp)

## After Upload (Optional)

Once everything is working:

1. ✅ **Test your site** - Make sure all images load correctly
2. ✅ **Keep public folder as backup** (recommended)
3. ✅ **Or delete** `/public/products/` folder if you want to save space

**Note:** Don't delete until you've verified everything works!

## Benefits of Supabase Storage

✅ **CDN Delivery** - Faster image loading globally
✅ **Separate from Code** - Smaller repository size
✅ **Scalable** - Handle thousands of images
✅ **Admin Upload** - Can add image upload to admin dashboard later
✅ **Automatic Optimization** - Supabase can optimize images

## Need Help?

If you encounter issues:
1. Check error messages in the output
2. Verify bucket exists in Supabase Dashboard
3. Check storage policies are correct
4. Make sure service_role key is correct in the script

