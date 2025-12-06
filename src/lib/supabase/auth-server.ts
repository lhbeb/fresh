import 'server-only';
import { cookies } from 'next/headers';
import { supabaseAdmin } from './server';
import { isAdmin } from './auth';

/**
 * Get the current admin session from cookies/headers
 * Returns null if not authenticated
 */
export async function getAdminSession(): Promise<{ email: string; userId: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return null;
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    // Check if user is admin
    const adminStatus = await isAdmin(user.email || '');
    if (!adminStatus) {
      return null;
    }

    return {
      email: user.email || '',
      userId: user.id,
    };
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
}

/**
 * Verify admin authentication
 * Throws error if not authenticated (for use in server components)
 */
export async function requireAdmin(): Promise<{ email: string; userId: string }> {
  const session = await getAdminSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

