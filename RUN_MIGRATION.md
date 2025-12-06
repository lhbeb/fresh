# How to Run Product Migration to Supabase

This guide will help you migrate all your existing product JSON files to Supabase.

## Step 1: Run the SQL Schema

First, you need to create the products table in Supabase:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vfuedgrheyncotoxseos
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**
4. Open `supabase-schema.sql` from this project
5. Copy **ALL** the contents
6. Paste it into the SQL Editor
7. Click **"Run"** (or press `Cmd+Enter` / `Ctrl+Enter`)
8. You should see: **"Success. No rows returned"** ✅

## Step 2: Run the Migration Script

### Option A: Using Node.js directly

```bash
npx tsx scripts/migrate-products-to-supabase.ts
```

### Option B: Using npm script (if you add it to package.json)

First add this to your `package.json` scripts:
```json
"scripts": {
  "migrate": "tsx scripts/migrate-products-to-supabase.ts"
}
```

Then run:
```bash
npm run migrate
```

### Option C: Manual migration via API

If the script doesn't work, you can use the admin dashboard:
1. Go to `/admin/products`
2. Click "Add Product"
3. Manually add each product

## What the Script Does

The migration script will:
1. ✅ Read all JSON files from `src/lib/products-raw/`
2. ✅ Transform the data (camelCase → snake_case)
3. ✅ Insert products into Supabase
4. ✅ Show progress for each product
5. ✅ Display summary of successes/errors

## Expected Output

```
🚀 Starting product migration to Supabase...

📦 Found 42 products to migrate

✅ Migrated: Canon PowerShot G7 X Mark III 20.1MP Digital Point...
✅ Migrated: Ninja Crispi 4-in-1 Portable Glass Air Fryer...
✅ Migrated: DJI Mini 2 SE Camera Drone Quadcopter...
...

==================================================
📊 Migration Summary:
   ✅ Success: 42
   ❌ Errors: 0
==================================================

🎉 Migration completed successfully!

✨ Done!
```

## Troubleshooting

### Error: "Cannot find module '@/lib/supabase/server'"
**Solution**: Make sure you're running from the project root:
```bash
cd "/Users/elma777boubi/Downloads/truegds-main 3"
npx tsx scripts/migrate-products-to-supabase.ts
```

### Error: "Missing Supabase credentials"
**Solution**: Check that `src/lib/supabase/server.ts` has the correct credentials hardcoded.

### Error: "Table 'products' does not exist"
**Solution**: Make sure you ran the SQL schema first (Step 1).

### Error: "Permission denied" or "RLS policy violation"
**Solution**: Make sure you're using the service_role key in `server.ts` (it bypasses RLS).

### Some products failed to migrate
- Check the error messages in the output
- Common issues:
  - Missing required fields (slug, title, description, etc.)
  - Invalid data types (price must be a number)
  - Duplicate slugs (should be unique)

## Verify Migration

After migration:
1. Go to Supabase Dashboard → **Table Editor** → **products**
2. You should see all your products there
3. Visit your site at `/admin/products` - products should appear
4. Visit the main site - products should be visible

## Next Steps

Once migration is complete:
1. ✅ Products are now in Supabase
2. ✅ Your site will fetch from Supabase (not JSON files)
3. ✅ You can add/edit products via `/admin/products`
4. ✅ You can safely remove JSON files (optional, keep as backup)

## Need Help?

If you encounter issues:
1. Check the error messages
2. Verify your Supabase credentials
3. Make sure the SQL schema ran successfully
4. Check that all JSON files have valid data

