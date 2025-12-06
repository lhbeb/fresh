# Supabase Setup - Step by Step Guide

Follow these steps to set up your Supabase database for the Truegds e-commerce platform.

---

## Step 1: Create Supabase Account & Project

### 1.1 Sign Up / Sign In
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Sign In"** (or **"Start your project"** if you're new)
3. Sign in with GitHub, Google, or email

### 1.2 Create New Project
1. Once logged in, click **"New Project"** button
2. Fill in the project details:
   - **Name**: `truegds` (or any name you prefer)
   - **Database Password**: Create a strong password (⚠️ **SAVE THIS PASSWORD** - you'll need it!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Select "Free" for development
3. Click **"Create new project"**
4. ⏳ Wait 2-3 minutes for your project to be created

---

## Step 2: Create the Products Table

### 2.1 Open SQL Editor
1. In your Supabase dashboard, look at the left sidebar
2. Click on **"SQL Editor"** (it has a database icon)
3. Click **"New query"** button

### 2.2 Run the Database Schema
1. Open the file `supabase-schema.sql` from this project
2. Copy **ALL** the contents of that file
3. Paste it into the SQL Editor in Supabase
4. Click **"Run"** button (or press `Cmd+Enter` / `Ctrl+Enter`)
5. You should see: **"Success. No rows returned"** ✅

### 2.3 Verify Table Was Created
1. In the left sidebar, click **"Table Editor"**
2. You should see a table called **"products"**
3. Click on it to see the structure (it will be empty for now)

---

## Step 3: Get Your API Keys

### 3.1 Open Settings
1. In the left sidebar, click **"Settings"** (gear icon)
2. Click **"API"** in the settings menu

### 3.2 Copy Your Credentials
You'll see three important values here:

#### a) Project URL
- **Label**: "Project URL"
- **Location**: Under "Project Settings" section
- **Looks like**: `https://xxxxx.supabase.co`
- **Copy this entire URL** ✅

#### b) Anon Public Key
- **Label**: "anon public" or "anon key"
- **Location**: Under "Project API keys" section
- **Looks like**: A long string starting with `eyJ...`
- **Copy this entire key** ✅

#### c) Service Role Key (⚠️ SECRET!)
- **Label**: "service_role" or "service_role secret"
- **Location**: Under "Project API keys" section
- **Looks like**: A long string starting with `eyJ...`
- **Copy this entire key** ✅
- ⚠️ **Keep this secret!** Don't share it publicly.

---

## Step 4: Update Your Code with Credentials

### 4.1 Update Client File
1. Open: `src/lib/supabase/client.ts`
2. Replace:
   ```typescript
   const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL_HERE';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
3. With:
   ```typescript
   const supabaseUrl = 'https://xxxxx.supabase.co';  // Your Project URL from Step 3.2.a
   const supabaseAnonKey = 'eyJ...';  // Your anon key from Step 3.2.b
   ```

### 4.2 Update Server File
1. Open: `src/lib/supabase/server.ts`
2. Replace:
   ```typescript
   const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL_HERE';
   const supabaseServiceRoleKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE';
   ```
3. With:
   ```typescript
   const supabaseUrl = 'https://xxxxx.supabase.co';  // Your Project URL from Step 3.2.a
   const supabaseServiceRoleKey = 'eyJ...';  // Your service_role key from Step 3.2.c
   ```

### 4.3 Update Admin Emails
1. Open: `src/lib/supabase/auth.ts`
2. Replace:
   ```typescript
   const adminEmails = [
     'your-admin-email@example.com',
   ];
   ```
3. With:
   ```typescript
   const adminEmails = [
     'your-actual-email@gmail.com',  // Your actual email address
   ];
   ```

---

## Step 5: Set Up Admin Authentication

### 5.1 Enable Email Authentication
1. In Supabase dashboard, click **"Authentication"** in left sidebar
2. Click **"Providers"**
3. Make sure **"Email"** is enabled (it should be by default)
4. If not, toggle it ON

### 5.2 Create Admin User
1. Still in **"Authentication"** section
2. Click **"Users"** in the submenu
3. Click **"Add user"** → **"Create new user"**
4. Fill in:
   - **Email**: Use the email you put in `auth.ts` admin emails
   - **Password**: Create a strong password (remember this!)
   - **Auto Confirm User**: ✅ Check this box (important!)
5. Click **"Create user"**

### 5.3 Verify User Created
1. You should see your new user in the users list
2. The email should match what you put in `adminEmails` array

---

## Step 6: Test the Setup

### 6.1 Start Your Development Server
```bash
npm run dev
```

### 6.2 Test Admin Login
1. Open browser: `http://localhost:3000/admin/login`
2. Enter:
   - **Email**: The email you created in Step 5.2
   - **Password**: The password you created in Step 5.2
3. Click **"Sign in"**
4. You should be redirected to `/admin/products` ✅

### 6.3 Test Creating a Product
1. In the admin dashboard, click **"Add Product"**
2. Fill in the form:
   - **Slug**: `test-product-1`
   - **Title**: `Test Product`
   - **Description**: `This is a test product`
   - **Price**: `99.99`
   - **Brand**: `Test Brand`
   - **Category**: `Test Category`
   - **Condition**: `New`
   - **Payee Email**: `your-email@example.com`
   - **Checkout Link**: `https://buymeacoffee.com/test`
   - **Images**: `/products/test/img1.webp`
3. Click **"Create Product"**
4. You should see the product in the list ✅

### 6.4 Verify Product Appears on Main Site
1. Go to: `http://localhost:3000`
2. Scroll down to the products section
3. Your test product should appear! ✅

---

## Step 7: Add Sample Data (Optional)

If you want to add products via SQL instead of the dashboard:

1. Go to **SQL Editor** → **New Query**
2. Run this sample insert:

```sql
INSERT INTO products (
  id, slug, title, description, price, brand, category, condition,
  payee_email, checkout_link, images, currency, rating, review_count
) VALUES (
  'test-product-1',
  'test-product-1',
  'Canon PowerShot G7 X Mark III',
  'Excellent camera for photography',
  399.95,
  'Canon',
  'Digital Cameras',
  'Used - Like New',
  'your-email@example.com',
  'https://buymeacoffee.com/test',
  ARRAY['/products/test/img1.webp', '/products/test/img2.webp'],
  'USD',
  4.8,
  3
);
```

---

## Troubleshooting

### ❌ "Missing Supabase environment variables" Error
- **Solution**: Make sure you updated `client.ts` and `server.ts` with actual credentials
- Check you didn't leave the placeholder values

### ❌ "Access denied. Admin access required"
- **Solution**: Make sure your email in `auth.ts` matches the email you used to create the user
- The email must be exactly the same (case-insensitive)

### ❌ "Authentication failed"
- **Solution**: 
  - Verify user exists in Supabase Authentication → Users
  - Check "Auto Confirm User" was checked when creating the user
  - Try logging in with the exact email/password you created

### ❌ Products table not found
- **Solution**: Make sure you ran `supabase-schema.sql` in SQL Editor
- Check Table Editor to verify table exists

### ❌ Cannot insert products
- **Solution**: 
  - Verify RLS policies allow public read (already in schema)
  - For writes, you're using service_role key which bypasses RLS
  - Check your service_role key is correct in `server.ts`

---

## Next Steps

Once everything works:

1. ✅ **Add your real products** via the admin dashboard
2. ✅ **Update checkout links** as needed
3. ✅ **Customize admin dashboard** if desired
4. ✅ **Set up production environment** when ready

---

## Quick Reference

### Where to Find Things in Supabase:

- **SQL Editor**: Left sidebar → SQL Editor
- **Table Editor**: Left sidebar → Table Editor
- **API Keys**: Left sidebar → Settings → API
- **Authentication**: Left sidebar → Authentication → Users
- **Database Password**: Settings → Database (if you forgot it)

---

## Security Reminders

⚠️ **Important:**
- Never commit your service_role key to public repositories
- The service_role key bypasses Row Level Security
- Keep your database password secure
- Only give admin access to trusted emails

---

You're all set! 🎉 If you run into any issues, check the troubleshooting section above.

