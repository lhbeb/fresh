# Orders Table Setup - Fix Email Delivery Issues

## Problem
Only 1 out of 100 checkout forms were being sent to email due to:
- Gmail rate limiting (500 emails/day limit)
- Connection pooling issues
- No order persistence (lost orders when email failed)

## Solution
**Orders are now saved to Supabase database FIRST**, then email is sent. This ensures:
- ✅ **No lost orders** - Even if email fails, order is saved
- ✅ **Better reliability** - Orders persist in database
- ✅ **Improved email handling** - Better connection pooling and rate limiting

## Setup Instructions

### Step 1: Create Orders Table in Supabase

1. Go to your Supabase dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**
4. Open the file `supabase-orders-schema.sql` from this project
5. Copy **ALL** the contents
6. Paste into Supabase SQL Editor
7. Click **"Run"** (or press `Cmd+Enter` / `Ctrl+Enter`)
8. You should see: **"Success. No rows returned"** ✅

### Step 2: Verify Table Created

1. In Supabase dashboard, click **"Table Editor"** in left sidebar
2. You should see a new table called **"orders"**
3. Click on it to see the structure

### Step 3: Test the Fix

1. Go through checkout process
2. Check Supabase `orders` table - you should see the order saved
3. Check your email - email should still be sent (if not rate limited)

## How It Works Now

### Before (Old Flow):
```
User submits checkout → Try to send email → If email fails → Order is LOST ❌
```

### After (New Flow):
```
User submits checkout → Save order to database ✅ → Try to send email → 
  - If email succeeds: Mark order as email_sent = true ✅
  - If email fails: Mark order as email_sent = false, save error message ✅
  → Order is NEVER lost! ✅
```

## Viewing Orders in Supabase

1. Go to Supabase dashboard
2. Click **"Table Editor"**
3. Click **"orders"** table
4. You'll see all orders with:
   - `email_sent`: true/false (whether email was sent)
   - `email_error`: Error message if email failed
   - All customer and shipping information
   - Full order data in JSON format

## Email Rate Limiting

If you're hitting Gmail rate limits:
- **Free Gmail**: 500 emails/day
- **Google Workspace**: 2,000 emails/day

**Solution**: All orders are saved in database, so you can:
1. View orders in Supabase dashboard
2. Export orders as CSV
3. Set up a cron job to send emails in batches
4. Switch to a professional email service (SendGrid, Resend, AWS SES)

## Monitoring

Check the `orders` table regularly:
- Orders with `email_sent = false` need attention
- Check `email_error` column for error details
- Most common errors:
  - `rate limit` or `quota` = Gmail daily limit reached
  - `Invalid login` = Gmail app password expired
  - `timeout` = Network/connection issue

## Next Steps (Optional Improvements)

1. **Create admin dashboard** to view orders
2. **Set up email queue** for failed emails
3. **Switch to professional email service** (SendGrid, Resend, etc.)
4. **Add order notifications** (Telegram, Slack, etc.)

