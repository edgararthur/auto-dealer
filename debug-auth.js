import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the app
const supabaseUrl = 'https://zlzzdycsizfwjkbulwgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsenpkeWNzaXpmd2prYnVsd2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzI4OTQsImV4cCI6MjA2MDQ0ODg5NH0.vW5Nmy2Kh7yeI-Td41XKCdJo-n0BQxqQfGNEOcTyJRM';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAuth() {
  console.log('🔍 Debugging Authentication Issues...\n');
  
  // Get email from user input - replace with the email you're trying to log in with
  const testEmail = process.argv[2] || 'test@example.com';
  console.log(`Testing with email: ${testEmail}\n`);
  
  try {
    // 1. Check if user exists in auth.users
    console.log('1️⃣ Checking if user exists in auth.users...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error listing users:', usersError.message);
      console.log('ℹ️  This might be expected if not using service_role key\n');
    } else {
      const user = users.find(u => u.email === testEmail);
      if (user) {
        console.log('✅ User found in auth.users');
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`   - Created: ${user.created_at}`);
        console.log(`   - Last sign in: ${user.last_sign_in_at || 'Never'}\n`);
      } else {
        console.log('❌ User not found in auth.users\n');
      }
    }
    
    // 2. Check profiles table
    console.log('2️⃣ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail);
      
    if (profilesError) {
      console.log('❌ Error checking profiles:', profilesError.message);
    } else if (profiles && profiles.length > 0) {
      console.log(`✅ Found ${profiles.length} profile(s) with this email:`);
      profiles.forEach((profile, index) => {
        console.log(`   Profile ${index + 1}:`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Name: ${profile.full_name || profile.name || 'N/A'}`);
        console.log(`   - Role: ${profile.role}`);
        console.log(`   - Active: ${profile.is_active}`);
      });
      console.log('');
    } else {
      console.log('❌ No profiles found with this email\n');
    }
    
    // 3. Test basic connection
    console.log('3️⃣ Testing basic Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.log('❌ Connection test failed:', testError.message);
    } else {
      console.log('✅ Basic connection working\n');
    }
    
    // 4. Test login attempt with debug info
    console.log('4️⃣ Testing login attempt...');
    const testPassword = process.argv[3];
    
    if (!testPassword) {
      console.log('⚠️  No password provided. Usage: node debug-auth.js email@example.com password123');
      console.log('   Skipping login test\n');
    } else {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (loginError) {
        console.log('❌ Login failed:', loginError.message);
        console.log('   Error code:', loginError.status);
        console.log('   Error details:', loginError);
      } else {
        console.log('✅ Login successful!');
        console.log('   User ID:', loginData.user.id);
        console.log('   Email confirmed:', loginData.user.email_confirmed_at ? 'Yes' : 'No');
        
        // Sign out after test
        await supabase.auth.signOut();
      }
    }
    
    console.log('\n📋 Troubleshooting Tips:');
    console.log('   1. Make sure the user has confirmed their email');
    console.log('   2. Check if the user was created in the dealer app vs buyer app');
    console.log('   3. Verify the password is correct');
    console.log('   4. Check if the user account is active');
    console.log('   5. Try resetting the password if needed');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the debug
debugAuth().catch(console.error); 