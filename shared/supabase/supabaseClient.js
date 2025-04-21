import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the provided credentials
const supabaseUrl = 'https://zlzzdycsizfwjkbulwgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsenpkeWNzaXpmd2prYnVsd2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzI4OTQsImV4cCI6MjA2MDQ0ODg5NH0.vW5Nmy2Kh7yeI-Td41XKCdJo-n0BQxqQfGNEOcTyJRM';

console.log('Buyer SupabaseClient: Creating Supabase client with URL and anon key', { 
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyStart: supabaseAnonKey.substring(0, 10) + '...'
});

// Create and export the Supabase client
let supabase;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Buyer SupabaseClient: Supabase client created successfully', {
    hasAuth: !!(supabase && supabase.auth),
    hasFrom: !!(supabase && supabase.from)
  });
} catch (error) {
  console.error('Buyer SupabaseClient: Error creating Supabase client', error);
  // Create a dummy client to prevent crashes
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: 'Supabase client failed to initialize' })
        })
      })
    })
  };
}

export default supabase; 