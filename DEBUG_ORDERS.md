# Debug Orders Not Saving

## Quick Test Steps

### 1. Test the API Endpoint Directly

Visit this URL in your browser (or use curl):
```
https://your-domain.com/api/test-order-save
```

This will:
- Check if the `orders` table exists
- Try to save a test order
- Show you the exact error if it fails

### 2. Check Vercel Logs

1. Go to **Vercel Dashboard** → Your Project → **Functions** tab
2. Look for `/api/send-shipping-email` function logs
3. Search for these log messages:
   - `📦 [API] Received request body:` - Shows what data was received
   - `📦 [saveOrder] Starting order save...` - Shows save attempt started
   - `❌ [saveOrder] Supabase error:` - Shows database errors
   - `✅ [saveOrder] Order saved successfully` - Shows success

### 3. Verify Database Table Exists

Run this in Supabase SQL Editor:
```sql
SELECT * FROM orders LIMIT 1;
```

If you get an error "relation does not exist", run:
```sql
-- Run the full supabase-orders-schema.sql script
```

### 4. Check RLS Policies

Run this in Supabase SQL Editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

You should see:
- "Public insert access for orders" policy
- "Admin read access for orders" policy

If missing, the insert policy should be:
```sql
CREATE POLICY "Public insert access for orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);
```

### 5. Test a Real Checkout

1. Complete a checkout on your site
2. Immediately check Vercel logs
3. Look for error messages starting with `❌`

## Common Issues & Fixes

### Issue: "relation does not exist"
**Fix**: Run `supabase-orders-schema.sql` in Supabase SQL Editor

### Issue: "permission denied" or "new row violates row-level security policy"
**Fix**: Check RLS policies - make sure insert policy exists and allows public inserts

### Issue: "null value in column violates not-null constraint"
**Fix**: Check that all required fields are being sent from checkout

### Issue: API returns 500 error
**Fix**: Check Vercel logs for the exact error message

## What to Check in Logs

After a checkout attempt, look for:

1. **Request received?**
   - `📦 [API] Received request body:` should show the data

2. **Validation passed?**
   - No `❌ [API] Missing required` errors

3. **Database connection?**
   - `📦 [saveOrder] Starting order save...` should appear

4. **Insert successful?**
   - `✅ [saveOrder] Order saved successfully` should appear
   - OR `❌ [saveOrder] Supabase error:` with error details

## Next Steps

1. **Run the test endpoint**: `/api/test-order-save`
2. **Check the response** - it will tell you exactly what's wrong
3. **Fix the issue** based on the error message
4. **Test again** with a real checkout

