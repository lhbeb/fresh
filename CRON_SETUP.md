# Automated Email Retry Setup Guide

## Overview
This project includes an automated email retry system. 

**Note:** Vercel has limits on cron jobs per team. This project does NOT automatically create a cron job to avoid exceeding limits.

**Retry Options:**
1. **Immediate retry on checkout** - Already implemented, retries failed emails when checkout completes
2. **Manual retry from admin** - Use `/admin/orders` to retry failed emails
3. **Optional: Set up cron manually** - Only if you have available cron job slots (see below)
4. **External cron service** - Use free external service for frequent retries (recommended)

## How It Works

1. **Failed emails are scheduled** with a `next_retry_at` timestamp
2. **Cron job runs once daily** (or more frequently with external service) and checks for orders needing retry
3. **Emails are automatically resent** with exponential backoff (5min → 15min → 30min → 1hr → 2hr)
4. **Up to 5 retry attempts** per order
5. **Immediate retry on checkout**: When a checkout completes, emails are also retried immediately in the background

## Setup Instructions

### Option 1: Manual Vercel Cron Job Setup (Optional)

⚠️ **Important**: This project does NOT automatically create cron jobs to avoid exceeding Vercel limits.

**Only set this up if:**
- You have available cron job slots in your Vercel plan
- You want automated daily retries
- You're not using external cron services

**To set up manually:**

1. **Go to Vercel Dashboard:**
   - Your Project → Settings → Cron Jobs
   - Click "Add Cron Job"

2. **Configure:**
   - **Path**: `/api/cron/retry-failed-emails`
   - **Schedule**: `0 9 * * *` (daily at 9 AM UTC) or choose your preferred time
   - **Method**: GET or POST

3. **Save** - The cron job will run daily

**Note**: Vercel Hobby plan allows 1 cron job per day. Pro plan allows unlimited.

### Option 2: Immediate Retries (Already Active)

✅ **This is already working!** When a checkout completes:
- Order is saved to database
- Email sending is attempted immediately in the background
- If email fails, it's scheduled for retry with exponential backoff
- No cron job needed for this to work

### Option 3: External Cron Service (Recommended - No Vercel Limits)

**Best option if you're on Vercel Hobby plan and want frequent retries!**

1. **Use a free external cron service:**
   - [cron-job.org](https://cron-job.org) - Free, reliable
   - [EasyCron](https://www.easycron.com) - Free tier available
   - [UptimeRobot](https://uptimerobot.com) - Free monitoring + cron
   - [GitHub Actions](https://github.com/features/actions) - Free for public repos

2. **Set up a cron job to call:**
   ```
   GET https://your-domain.com/api/cron/retry-failed-emails
   ```

3. **Recommended schedules:**
   - **Every 5 minutes**: `*/5 * * * *` (best for fast retries)
   - **Every 10 minutes**: `*/10 * * * *` (good balance)
   - **Every 15 minutes**: `*/15 * * * *` (conservative)

4. **Example with cron-job.org:**
   - Sign up for free account
   - Create new cron job
   - URL: `https://your-domain.com/api/cron/retry-failed-emails`
   - Schedule: `*/5 * * * *` (every 5 minutes)
   - Method: GET
   - Save and activate

**Note**: Make sure to set `CRON_SECRET` environment variable and include it in the Authorization header for security.

## Security (Optional but Recommended)

To secure the cron endpoint, set an environment variable:

1. **In Vercel Dashboard:**
   - Go to Settings → Environment Variables
   - Add: `CRON_SECRET` = `your-secret-token-here`

2. **The endpoint will check for:**
   - `Authorization: Bearer your-secret-token-here` header, OR
   - Vercel's `x-vercel-cron` header (automatically added by Vercel Cron Jobs)

## Testing

### Test the Endpoint Manually

```bash
# Test locally
curl http://localhost:3000/api/cron/retry-failed-emails

# Test on production
curl https://your-domain.com/api/cron/retry-failed-emails
```

### Check Logs

1. **Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for logs starting with `🔄 [Cron]` or `📧 [Cron]`

2. **Expected Log Messages:**
   - `🔄 [Cron] Starting automated email retry process...`
   - `📧 [Cron] Found X orders needing email retry`
   - `✅ [Cron] Email retry completed: X sent, Y failed`

### Verify It's Working

1. Create a test order with a failed email
2. Wait 5 minutes
3. Check Vercel logs to see if the cron job ran
4. Check Supabase `orders` table to see if `email_sent` was updated

## Schedule Options

### For Vercel Cron (Hobby Plan - Once Daily Only)

You can change the daily schedule in `vercel.json`:

- **9:00 AM UTC daily**: `0 9 * * *` (current)
- **12:00 PM UTC daily**: `0 12 * * *`
- **6:00 PM UTC daily**: `0 18 * * *`
- **Midnight UTC daily**: `0 0 * * *`

### For External Cron Services (Unlimited)

- **Every 5 minutes**: `*/5 * * * *` ⭐ Recommended
- **Every 10 minutes**: `*/10 * * * *`
- **Every 15 minutes**: `*/15 * * * *`
- **Every 30 minutes**: `*/30 * * * *`
- **Every hour**: `0 * * * *`

## Monitoring

### Check Cron Job Status

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. View execution history and status

### Monitor Retry Success Rate

1. Go to `/admin/orders`
2. Check the stats:
   - Total Orders
   - Emails Sent
   - Emails Failed
3. Failed emails should decrease over time as retries succeed

## Troubleshooting

### Cron Job Not Running

1. **Check Vercel Dashboard:**
   - Go to Settings → Cron Jobs
   - Verify the cron job is listed and enabled
   - Check execution history

2. **Check Logs:**
   - Look for errors in Vercel function logs
   - Check if the endpoint is being called

3. **Test Manually:**
   - Call the endpoint directly to see if it works
   - Check for any errors in the response

### Emails Still Not Sending

1. **Check Retry Count:**
   - Orders with `email_retry_count >= 5` won't be retried
   - Manually retry these from `/admin/orders`

2. **Check Next Retry Time:**
   - Orders with `next_retry_at` in the future won't be retried yet
   - Wait for the scheduled time or manually retry

3. **Check Email Credentials:**
   - Verify Gmail app password is correct
   - Check for rate limiting errors

## Manual Retry

Even with automated retries, you can still manually retry:

1. Go to `/admin/orders`
2. Click **"Retry"** button on individual orders
3. Or click **"Retry All Failed Emails"** to process all at once

