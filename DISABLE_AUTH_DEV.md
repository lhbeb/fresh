# Disable Authentication for Local Development

This feature allows you to bypass authentication when developing locally, so you don't have to enter credentials every time you restart the server.

## How to Enable

Add this line to your `.env.local` file:

```bash
DISABLE_AUTH_IN_DEV=true
```

## How It Works

- **Only works in non-production environments** - Authentication is ALWAYS required in production (`NODE_ENV=production`)
- **Bypasses middleware** - Admin routes are accessible without login
- **Bypasses API authentication** - All admin API endpoints accept requests without tokens
- **Logs when bypassed** - You'll see `🔓 [AUTH] Bypassing authentication` messages in the console

## Security Notes

⚠️ **IMPORTANT**: This feature is automatically disabled in production. Never set `DISABLE_AUTH_IN_DEV=true` in production environments.

The bypass only works when:
1. `NODE_ENV !== 'production'` AND
2. `DISABLE_AUTH_IN_DEV=true` or `DISABLE_AUTH_IN_DEV=1`

## Example `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Disable authentication for local development
DISABLE_AUTH_IN_DEV=true
```

## Testing

After adding the environment variable:
1. Restart your dev server (`npm run dev`)
2. Navigate to `/admin/products` or any admin route
3. You should be able to access it without logging in
4. Check the console for `🔓 [AUTH]` messages confirming the bypass




