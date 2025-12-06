# Admin Login Setup Instructions

## Credentials Configured

- **Email**: `elmahboubimehdi@gmail.com`
- **Password**: `Localserver!!2`

## Step 1: Create Admin User in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vfuedgrheyncotoxseos
2. Click **"Authentication"** in the left sidebar
3. Click **"Users"** in the submenu
4. Click **"Add user"** → **"Create new user"**
5. Fill in:
   - **Email**: `elmahboubimehdi@gmail.com`
   - **Password**: `Localserver!!2`
   - ✅ **Auto Confirm User**: Check this box (IMPORTANT!)
6. Click **"Create user"**

**Note**: The email in the code (`elmahboubimehdi@gmail.com`) must match exactly the email you use when creating the user in Supabase.

## Step 2: Verify Setup

1. The code file `src/lib/supabase/auth.ts` is already updated with:
   ```typescript
   const adminEmails = [
     'elmahboubimehdi@gmail.com',
   ];
   ```

## Step 3: Test Login

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to: `http://localhost:3000/admin/login`

3. Login with:
   - **Email**: `elmahboubimehdi@gmail.com`
   - **Password**: `Localserver!!2`

4. You should be redirected to `/admin/products`

## Troubleshooting

### "Access denied. Admin access required."
- Make sure the email in `auth.ts` matches the email you created in Supabase
- The email must be exactly the same (case-insensitive)

### "Authentication failed"
- Verify the password is correct
- Check that "Auto Confirm User" was checked when creating the user
- Make sure the user exists in Supabase Authentication → Users

### Can't create user
- Make sure you're in the correct Supabase project
- Check that email authentication is enabled (Settings → Authentication → Providers)

## Important Notes

✅ **Credentials configured:**
- Email: `elmahboubimehdi@gmail.com`
- Password: `Localserver!!2`

Make sure to create the user in Supabase Authentication with these exact credentials.

