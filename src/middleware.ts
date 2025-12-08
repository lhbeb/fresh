import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Import shouldBypassAuth dynamically to avoid issues
  const { shouldBypassAuth } = await import('@/lib/supabase/auth');
  const bypassAuth = shouldBypassAuth();

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Bypass authentication in development if enabled
    if (bypassAuth) {
      console.log('🔓 [MIDDLEWARE] Bypassing authentication for:', pathname);
      const response = NextResponse.next();
      response.headers.set('x-pathname', pathname);
      return response;
    }

    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify the token
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        // Invalid token, redirect to login
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('admin_token');
        return response;
      }

      // Check if user is admin
      const adminStatus = await isAdmin(user.email || '');
      if (!adminStatus) {
        // Not an admin, redirect to login
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('admin_token');
        return response;
      }

      // Authenticated admin, allow access
      const response = NextResponse.next();
      response.headers.set('x-pathname', pathname);
      return response;
    } catch (error) {
      // Error verifying token, redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // For non-admin routes, just add pathname header
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

