import { supabaseAdmin } from './server';

/**
 * Check if a user is an admin by email
 */
export async function isAdmin(email: string): Promise<boolean> {
  try {
    const adminEmails = [
      'elmahboubimehdi@gmail.com',  // Admin user
      // Add more admin emails here
    ];
    return adminEmails.includes(email.toLowerCase().trim());
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Authenticate admin user
 */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Authentication failed' };
    }

    // Check if user is admin
    const adminStatus = await isAdmin(data.user.email || '');
    if (!adminStatus) {
      return { success: false, error: 'Access denied. Admin access required.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

