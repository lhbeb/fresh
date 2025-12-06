# Order & Email Troubleshooting Guide

## Issue: Orders Not Saving to Supabase

### Step 1: Verify Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Run the `supabase-orders-schema.sql` script
3. Verify the table exists:
   ```sql
   SELECT * FROM orders LIMIT 1;
   ```

### Step 2: Check RLS Policies
The orders table should allow public inserts. Verify:
```sql
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

You should see:
- "Public insert access for orders" policy
- "Admin read access for orders" policy

### Step 3: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Check logs for `/api/send-shipping-email`
3. Look for these log messages:
   - `📦 [API] Starting order save process...`
   - `📦 Attempting to save order to Supabase...`
   - `✅ Order saved successfully with ID: ...`
   - `❌ Supabase error saving order:` (if there's an error)

### Step 4: Test Database Connection
Check if the Supabase credentials are correct in `src/lib/supabase/server.ts`

### Step 5: Common Errors

#### Error: "column does not exist"
- **Solution**: Run the updated `supabase-orders-schema.sql` script

#### Error: "permission denied"
- **Solution**: Check RLS policies - the insert policy should allow public access

#### Error: "relation does not exist"
- **Solution**: The `orders` table doesn't exist - run the schema SQL script

#### Error: "null value in column violates not-null constraint"
- **Solution**: Check that all required fields are being sent from checkout

---

## Issue: Emails Not Sending

### Step 1: Check Email Logs
Look for these in Vercel logs:
- `📧 [Async] Starting email send for order ...`
- `✅ Email sent successfully for order ...`
- `❌ Failed to send email for order ...`

### Step 2: Verify Gmail Credentials
Check `src/lib/email/sender.ts`:
- Email: `arvaradodotcom@gmail.com`
- App Password: `iwar xzav utnb bxyw`

### Step 3: Check Order Status
In Supabase, check the `orders` table:
```sql
SELECT id, email_sent, email_error, email_retry_count, next_retry_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

### Step 4: Manual Retry
1. Go to `/admin/orders`
2. Click "Retry" button on failed orders
3. Or click "Retry All Failed Emails"

---

## Debugging Steps

### 1. Test Order Save Directly
Create a test API call:
```bash
curl -X POST https://your-domain.com/api/send-shipping-email \
  -H "Content-Type: application/json" \
  -d '{
    "shippingData": {
      "fullName": "Test User",
      "email": "test@example.com",
      "phoneNumber": "1234567890",
      "streetAddress": "123 Test St",
      "city": "Test City",
      "state": "CA",
      "zipCode": "12345"
    },
    "product": {
      "slug": "test-product",
      "title": "Test Product",
      "price": 99.99,
      "images": []
    }
  }'
```

### 2. Check Browser Console
Open browser DevTools → Console tab during checkout
- Look for `sendShippingEmail` logs
- Check for any JavaScript errors

### 3. Check Network Tab
Open browser DevTools → Network tab
- Find the `/api/send-shipping-email` request
- Check the response status and body
- Look for error messages

---

## Quick Fixes

### If orders table doesn't exist:
```sql
-- Run the full supabase-orders-schema.sql script
```

### If RLS is blocking inserts:
```sql
-- Make sure this policy exists:
CREATE POLICY "Public insert access for orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);
```

### If columns are missing:
```sql
-- Add missing columns:
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_retry_count INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP WITH TIME ZONE;
```

---

## Expected Behavior

1. **During Checkout:**
   - Order is saved to Supabase immediately
   - API returns success with `orderId`
   - Email sending starts in background (non-blocking)

2. **Email Sending:**
   - Happens asynchronously after checkout completes
   - If it fails, retries are scheduled automatically
   - Up to 5 retry attempts with exponential backoff

3. **Admin Dashboard:**
   - All orders visible in `/admin/orders`
   - Failed emails show retry button
   - Can manually retry failed emails

---

## Still Having Issues?

1. Check Vercel function logs for detailed error messages
2. Verify Supabase table structure matches the schema
3. Test with a simple order to isolate the issue
4. Check that Supabase credentials are correct
5. Verify RLS policies allow inserts

