# Hardcoded Credentials - Update These Files

All Supabase credentials are now hardcoded in the code. Update the following files with your actual Supabase credentials:

## Files to Update

### 1. Client-Side Supabase (`src/lib/supabase/client.ts`)

**Update these lines:**
```typescript
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL_HERE';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
```

**Replace with:**
- `YOUR_SUPABASE_PROJECT_URL_HERE` → Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `YOUR_SUPABASE_ANON_KEY_HERE` → Your Supabase anon/public key

**Where to find:**
- Go to Supabase Dashboard → Settings → API
- Copy the "Project URL" and "anon public" key

---

### 2. Server-Side Supabase (`src/lib/supabase/server.ts`)

**Update these lines:**
```typescript
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL_HERE';
const supabaseServiceRoleKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE';
```

**Replace with:**
- `YOUR_SUPABASE_PROJECT_URL_HERE` → Your Supabase project URL (same as above)
- `YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE` → Your Supabase service_role key (⚠️ Keep this secret!)

**Where to find:**
- Go to Supabase Dashboard → Settings → API
- Copy the "service_role" key (⚠️ This bypasses RLS - keep it secure)

---

### 3. Admin Authentication (`src/lib/supabase/auth.ts`)

**Update these lines:**
```typescript
const adminEmails = [
  'your-admin-email@example.com',
  // Add more admin emails here
];
```

**Replace with:**
- `'your-admin-email@example.com'` → Your actual admin email address(es)
- Add additional admin emails as needed

**Example:**
```typescript
const adminEmails = [
  'admin@happydeel.com',
  'manager@happydeel.com',
];
```

---

### 4. Telegram Bot (`src/app/api/notify-visit/route.ts`)

**Update these lines:**
```typescript
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID_HERE';
```

**Replace with:**
- `YOUR_TELEGRAM_BOT_TOKEN_HERE` → Your Telegram bot token from @BotFather
- `YOUR_TELEGRAM_CHAT_ID_HERE` → Your Telegram chat ID (your user ID or group ID)

**How to get:**
1. **Bot Token**: 
   - Message @BotFather on Telegram
   - Send `/newbot` and follow instructions
   - Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Chat ID**:
   - Message @userinfobot on Telegram to get your user ID
   - Or create a group and add @userinfobot to get group ID
   - Chat ID is a number (e.g., `123456789`)

---

## Quick Setup Checklist

1. ✅ Create Supabase project at [supabase.com](https://supabase.com)
2. ✅ Run `supabase-schema.sql` in Supabase SQL Editor
3. ✅ Get credentials from Supabase Dashboard → Settings → API
4. ✅ Update `src/lib/supabase/client.ts` with project URL and anon key
5. ✅ Update `src/lib/supabase/server.ts` with project URL and service_role key
6. ✅ Update `src/lib/supabase/auth.ts` with admin email(s)
7. ✅ Create admin user in Supabase Authentication

---

## Security Notes

⚠️ **Important:** 
- The service_role key bypasses Row Level Security (RLS)
- Never commit these credentials to public repositories
- Keep the service_role key secure and private
- For production, consider using environment variables instead

---

## Testing

After updating credentials:

1. Visit `/admin/login`
2. Login with an admin email
3. Go to `/admin/products`
4. Try creating a product
5. Verify products appear on the main site

