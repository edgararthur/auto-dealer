import supabase from "./shared/supabase/supabaseClient.js";

console.log("Checking database schema...");

async function checkSchema() {
  try {
    // Check what tables exist
    console.log("\n📋 Available tables:");
    
    // Check products table structure
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .limit(1);
      
    if (!productsError && products) {
      console.log("✅ products table accessible");
      if (products[0]) {
        console.log("   - Sample columns:", Object.keys(products[0]).slice(0, 10));
      }
    } else {
      console.log("❌ products table error:", productsError?.message);
    }
    
    // Check dealers table
    const { data: dealers, error: dealersError } = await supabase
      .from("dealers")
      .select("*")
      .limit(1);
      
    if (!dealersError && dealers) {
      console.log("✅ dealers table accessible");
      if (dealers[0]) {
        console.log("   - Sample columns:", Object.keys(dealers[0]).slice(0, 10));
      }
    } else {
      console.log("❌ dealers table error:", dealersError?.message);
    }
    
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);
      
    if (!profilesError && profiles) {
      console.log("✅ profiles table accessible");
      if (profiles[0]) {
        console.log("   - Sample columns:", Object.keys(profiles[0]).slice(0, 10));
      }
    } else {
      console.log("❌ profiles table error:", profilesError?.message);
    }
    
  } catch (error) {
    console.log("❌ Schema check failed:", error.message);
  }
}

checkSchema();
