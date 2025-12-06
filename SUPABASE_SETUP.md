# Supabase Setup Guide

This guide will help you set up Supabase for storing and managing product data in your Truegds e-commerce platform.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `truegds` (or your preferred name)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be set up (2-3 minutes)

## Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL
5. Verify the `products` table was created in **Table Editor**

## Step 3: Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (this is `SUPABASE_SERVICE_ROLE_KEY`) - Keep this secret!

## Step 4: Configure Environment Variables

1. Create or update `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Configuration
ADMIN_EMAILS=your-email@example.com,another-admin@example.com

# Existing environment variables
NEXT_PUBLIC_BASE_URL=https://happydeel.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

2. Replace the placeholder values with your actual Supabase credentials
3. Add admin emails (comma-separated) who should have access to the admin dashboard

## Step 5: Set Up Authentication (Optional but Recommended)

### Option A: Email/Password Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable "Email" provider
3. Configure email templates if needed
4. Users can sign up via `/admin/login`

### Option B: Use Supabase Auth (Recommended)

The admin authentication uses Supabase Auth. To set up:

1. Go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Enter admin email and password
4. User will be able to login at `/admin/login`

## Step 6: Migrate Existing Products (Optional)

If you have existing products in JSON files, you can migrate them:

1. Create a migration script or manually insert via Supabase dashboard
2. Or use the admin dashboard to add products manually

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the admin dashboard:
   - Navigate to `/admin/login`
   - Login with your admin credentials
   - Go to `/admin/products`
   - Try creating a new product

3. Test the API:
   - Visit `/api/admin/products` (should return empty array or your products)
   - Test creating a product via the admin dashboard

## Step 8: Row Level Security (RLS)

The schema includes RLS policies that:
- Allow public read access to products (for the public website)
- Restrict write operations (you can customize based on your needs)

For production, consider:
- Adding more restrictive RLS policies
- Using service role key only on server-side (already implemented)
- Setting up proper admin roles and permissions

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has all required variables
- Restart your development server after adding environment variables

### "Authentication failed"
- Check that you've created a user in Supabase Authentication
- Verify your email is in the `ADMIN_EMAILS` environment variable

### "Table does not exist"
- Make sure you ran the SQL schema in Supabase SQL Editor
- Check the Table Editor to verify `products` table exists

### "Permission denied"
- Check your RLS policies in Supabase
- Verify you're using the service role key for admin operations

## Security Notes

- **Never commit** `.env.local` to version control
- The service role key bypasses RLS - keep it secure
- In production, ensure RLS policies are properly configured
- Consider using environment-specific keys for staging/production

## Next Steps

- Customize the admin dashboard UI
- Add image upload functionality
- Set up automated backups
- Configure Supabase storage for product images
- Add product categories and tags management

