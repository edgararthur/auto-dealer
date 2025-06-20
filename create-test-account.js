import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the app
const supabaseUrl = 'https://zlzzdycsizfwjkbulwgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsenpkeWNzaXpmd2prYnVsd2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzI4OTQsImV4cCI6MjA2MDQ0ODg5NH0.vW5Nmy2Kh7yeI-Td41XKCdJo-n0BQxqQfGNEOcTyJRM';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestAccount() {
  const email = process.argv[2] || 'elvozorgbe@gmail.com';
  const password = process.argv[3] || 'Breakfast@9am';
  const fullName = process.argv[4] || 'Edward Arthur';
  
  console.log('🔧 Creating test account...');
  console.log(`Email: ${email}`);
  console.log(`Name: ${fullName}\n`);
  
  try {
    // 1. Register user with Supabase Auth
    console.log('1️⃣ Registering user with Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer'
        }
      }
    });

    if (authError) {
      console.log('❌ Auth registration failed:', authError.message);
      return;
    }

    console.log('✅ Auth user created successfully');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);
    console.log(`   Confirmation required: ${authData.user.email_confirmed_at ? 'No' : 'Yes'}\n`);

    // 2. Create profile record
    console.log('2️⃣ Creating profile record...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        email: email,
        role: 'customer',
        created_at: new Date(),
        is_active: true
      });

    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message);
      console.log('   Error details:', profileError);
    } else {
      console.log('✅ Profile created successfully\n');
    }

    // 3. Test login after creation
    console.log('3️⃣ Testing login with new account...');
    
    // Sign out first to clear any existing session
    await supabase.auth.signOut();
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (loginError) {
      console.log('❌ Login test failed:', loginError.message);
      if (loginError.message.includes('Email not confirmed')) {
        console.log('ℹ️  You need to check your email and confirm your account first');
      }
    } else {
      console.log('✅ Login test successful!');
      console.log(`   Logged in as: ${loginData.user.email}`);
      
      // Get profile to verify everything is working
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user.id)
        .single();
        
      if (profile) {
        console.log(`   Profile found: ${profile.full_name} (${profile.role})`);
      }
      
      // Sign out after test
      await supabase.auth.signOut();
    }

    console.log('\n🎉 Account creation complete!');
    console.log('📧 Check your email for a confirmation link if required');
    console.log('🔑 You can now try logging in to the buyer app');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the script
createTestAccount().catch(console.error); 