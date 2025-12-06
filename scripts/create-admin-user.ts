import { createClient } from '@supabase/supabase-js';

// Direct Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const adminEmail = 'elmahboubimehdi@gmail.com';
const adminPassword = 'Localserver!!2';

async function createAdminUser() {
  console.log('🚀 Creating admin user in Supabase...\n');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}\n`);

  try {
    // First, check if user already exists
    console.log('📡 Checking if user already exists...');
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('⚠️  Could not check existing users:', listError.message);
    } else {
      const existingUser = existingUsers.users.find(u => u.email === adminEmail);
      if (existingUser) {
        console.log('ℹ️  User already exists!');
        console.log(`   User ID: ${existingUser.id}`);
        console.log(`   Email Confirmed: ${existingUser.email_confirmed_at ? 'Yes ✅' : 'No ❌'}`);
        
        if (!existingUser.email_confirmed_at) {
          console.log('\n📧 User exists but is not confirmed. Attempting to confirm...');
          const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              email_confirm: true,
            }
          );

          if (updateError) {
            console.error('❌ Failed to confirm user:', updateError.message);
            console.log('\n💡 Solution: Delete the user and run this script again, or confirm manually in Supabase Dashboard');
            process.exit(1);
          } else {
            console.log('✅ User confirmed successfully!');
            console.log('✅ You can now log in with these credentials.');
            process.exit(0);
          }
        } else {
          console.log('✅ User is already confirmed and ready to use!');
          console.log('✅ You can log in with these credentials.');
          process.exit(0);
        }
      }
    }

    // Create new user
    console.log('📝 Creating new admin user...');
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm the user
      user_metadata: {
        role: 'admin'
      }
    });

    if (error) {
      console.error('❌ Failed to create user:');
      console.error(`   Error: ${error.message}`);
      
      if (error.message.includes('already registered')) {
        console.log('\n💡 User might already exist but not confirmed.');
        console.log('   Try confirming manually in Supabase Dashboard or delete and recreate.');
      }
      
      process.exit(1);
    }

    if (data.user) {
      console.log('✅ Admin user created successfully!');
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Confirmed: ${data.user.email_confirmed_at ? 'Yes ✅' : 'No ❌'}`);
      
      if (data.user.email_confirmed_at) {
        console.log('\n🎉 Setup complete!');
        console.log('✅ You can now log in at: http://localhost:3000/admin/login');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
      } else {
        console.log('\n⚠️  User created but not confirmed.');
        console.log('   This might cause login issues.');
      }
      
      process.exit(0);
    } else {
      console.error('❌ User creation failed - no user data returned');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('💥 Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdminUser();

