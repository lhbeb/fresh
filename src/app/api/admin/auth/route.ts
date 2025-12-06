import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/auth';

/**
 * POST - Set admin session cookie (token already validated client-side)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { token } = await request.json().catch(() => ({}));

    // Get token from Authorization header or body
    const accessToken = authHeader?.replace('Bearer ', '') || token;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminStatus = await isAdmin(user.email || '');
    if (!adminStatus) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin access required.' },
        { status: 403 }
      );
    }

    // Create response with success
    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        id: user.id,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set('admin_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Logout (clear cookie)
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}

