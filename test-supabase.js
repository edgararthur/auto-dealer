import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the app
const supabaseUrl = 'https://zlzzdycsizfwjkbulwgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsenpkeWNzaXpmd2prYnVsd2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzI4OTQsImV4cCI6MjA2MDQ0ODg5NH0.vW5Nmy2Kh7yeI-Td41XKCdJo-n0BQxqQfGNEOcTyJRM';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test basic connection
async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Simple query to check if we can connect
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error('Connection error:', error);
    } else {
      console.log('Connection successful! Data result:', data);
    }
    
    // Try to get session (anonymous)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else {
      console.log('Session check successful:', sessionData);
    }
    
    // Check if we can list the tables we have access to
    const { data: tableData, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
      
    if (tableError) {
      console.error('Table list error:', tableError);
    } else {
      console.log('Tables we can access:', tableData);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the test
testConnection(); 