# Troubleshooting Admin Login - "Invalid" Error

## Common Causes of "Invalid" Error

When you get an "Invalid" or "Invalid login credentials" error, it usually means one of these:

### 1. **User Not Created in Supabase** (Most Common)
The user doesn't exist in Supabase Authentication yet.

**Solution:**
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/vfuedgrheyncotoxseos
2. Click **"Authentication"** → **"Users"**
3. Check if `elmahboubimehdi@gmail.com` exists
4. If NOT, create it:
   - Click **"Add user"** → **"Create new user"**
   - Email: `elmahboubimehdi@gmail.com`
   - Password: `Localserver!!2`
   - ✅ **CHECK "Auto Confirm User"** (VERY IMPORTANT!)
   - Click **"Create user"**

### 2. **User Exists But Not Confirmed**
The user was created but "Auto Confirm User" was NOT checked.

**Solution:**
1. Go to Supabase Dashboard → Authentication → Users
2. Find `elmahboubimehdi@gmail.com`
3. Click on the user
4. Check the "Confirmed" status
5. If not confirmed, either:
   - Delete and recreate with "Auto Confirm" checked, OR
   - Manually confirm the user

### 3. **Wrong Email or Password**
Typo in email or password.

**Solution:**
- Email must be EXACTLY: `elmahboubimehdi@gmail.com` (case-insensitive but double-check)
- Password must be EXACTLY: `Localserver!!2` (case-sensitive! Check for typos)

### 4. **Email Authentication Disabled**
Email provider might be disabled in Supabase.

**Solution:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Make sure **"Email"** provider is **ENABLED**
3. Enable it if it's disabled

## Step-by-Step Verification

### Step 1: Verify User Exists
```
Supabase Dashboard → Authentication → Users
```
- Look for: `elmahboubimehdi@gmail.com`
- Status should show: "Confirmed" (green checkmark)

### Step 2: Verify Credentials in Code
Check file: `src/lib/supabase/auth.ts`
- Line 9 should have: `'elmahboubimehdi@gmail.com'`

### Step 3: Verify Supabase Connection
Check file: `src/lib/supabase/client.ts`
- URL should be: `https://vfuedgrheyncotoxseos.supabase.co`
- Anon key should be valid

### Step 4: Test Login
1. Go to: `http://localhost:3000/admin/login`
2. Enter:
   - Email: `elmahboubimehdi@gmail.com`
   - Password: `Localserver!!2`
3. Click "Sign in"

## Quick Fix: Create User via Supabase Dashboard

**If user doesn't exist:**

1. Open: https://supabase.com/dashboard/project/vfuedgrheyncotoxseos/auth/users
2. Click **"+ Add user"** → **"Create new user"**
3. Fill in:
   ```
   Email: elmahboubimehdi@gmail.com
   Password: Localserver!!2
   Auto Confirm User: ✅ CHECK THIS!
   ```
4. Click **"Create user"**
5. Try logging in again

## Still Not Working?

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Check for any JavaScript errors
5. Look for Supabase error messages

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Look for the authentication request
5. Check the response for detailed error message

### Verify Supabase Project
- Make sure you're using the correct Supabase project
- Project URL: `https://vfuedgrheyncotoxseos.supabase.co`
- Check that the project is active and running

## Expected Success Flow

1. ✅ Enter credentials
2. ✅ Click "Sign in"
3. ✅ Page redirects to `/admin/products`
4. ✅ You see the products list

If you get redirected but see an error, the authentication worked but something else is wrong.

## Contact Points

If still having issues:
1. Check Supabase Dashboard → Authentication → Users → Check user exists and is confirmed
2. Check browser console for detailed errors
3. Verify credentials match exactly (copy-paste to avoid typos)

