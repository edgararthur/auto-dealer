import supabase from "./shared/supabase/supabaseClient.js";

console.log("Testing Supabase connection...");

async function testConnection() {
  try {
    const { data, error } = await supabase.from("profiles").select("id").limit(1);
    
    if (error) {
      console.log("❌ Database query failed:", error.message);
    } else {
      console.log("✅ Database connection successful");
      console.log("   - Can query profiles table:", !!data);
    }
  } catch (err) {
    console.log("❌ Connection test failed:", err.message);
  }
}

testConnection();
