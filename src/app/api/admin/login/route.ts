import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Supabase uses email for authentication, so username should be an email
    // Sign in with Supabase
    const { data, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: username, // Username should be the email address
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminStatus = await isAdmin(data.user.email || '');
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Access denied. Admin access required.' },
        { status: 403 }
      );
    }

    // Create response with token
    const response = NextResponse.json({
      token: data.session.access_token,
      user: {
        email: data.user.email,
        id: data.user.id,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set('admin_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

