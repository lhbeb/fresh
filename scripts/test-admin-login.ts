import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = 'elmahboubimehdi@gmail.com';
const password = 'Localserver!!2';

async function testLogin() {
  console.log('🔐 Testing admin login credentials...\n');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);

  try {
    console.log('📡 Attempting to authenticate with Supabase...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Authentication failed!');
      console.error(`Error: ${error.message}`);
      console.error(`Status: ${error.status}`);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n💡 This usually means:');
        console.log('   1. User does not exist in Supabase Authentication');
        console.log('   2. Password is incorrect');
        console.log('   3. User exists but is not confirmed');
        console.log('\n✅ Solution:');
        console.log('   1. Go to Supabase Dashboard → Authentication → Users');
        console.log('   2. Click "+ Add user" → "Create new user"');
        console.log(`   3. Email: ${email}`);
        console.log(`   4. Password: ${password}`);
        console.log('   5. ✅ CHECK "Auto Confirm User"');
        console.log('   6. Click "Create user"');
      }
      
      process.exit(1);
    }

    if (data.user) {
      console.log('✅ Authentication successful!');
      console.log(`User ID: ${data.user.id}`);
      console.log(`Email: ${data.user.email}`);
      console.log(`Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
      
      if (!data.user.email_confirmed_at) {
        console.log('\n⚠️  WARNING: User is not confirmed!');
        console.log('   This will cause login issues.');
        console.log('   Solution: Recreate user with "Auto Confirm User" checked');
      }
      
      // Check if user is admin
      const adminEmailsEnv = process.env.ADMIN_EMAILS || 'elmahboubimehdi@gmail.com';
      const adminEmails = adminEmailsEnv.split(',').map(e => e.trim());
      const isAdmin = adminEmails.includes(data.user.email?.toLowerCase().trim() || '');
      
      if (isAdmin) {
        console.log('✅ User is recognized as admin in code');
      } else {
        console.log('⚠️  WARNING: User email not in admin list!');
        console.log('   Check src/lib/supabase/auth.ts');
      }
      
      console.log('\n✅ Login test passed! Credentials are correct.');
      process.exit(0);
    } else {
      console.error('❌ No user data returned');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('💥 Fatal error:', err.message);
    process.exit(1);
  }
}

testLogin();

