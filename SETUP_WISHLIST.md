# 🛍️ Wishlist Setup Guide

The wishlist functionality requires a database table that needs to be created in your Supabase project.

## 🚨 Current Status
❌ **Wishlists table not found** - The application is running with limited wishlist functionality

## ✅ Quick Fix

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Navigate to your project dashboard

### Step 2: Run the SQL Script
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy and paste the content from `create_wishlists_table.sql`
4. Click **"Run"** to execute the script

### Step 3: Verify Setup
Run this query to verify the table was created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'wishlists' AND table_schema = 'public';
```

### Step 4: Test the Application
- Refresh your browser
- Try adding items to wishlist
- Check if the wishlist icon shows item count

## 🛠️ Troubleshooting

### If you get "products table not found" error:
1. Run the diagnostic script in `debug_database.sql`
2. Check if you have the `products`, `categories`, and `brands` tables
3. If missing, you may need to set up the complete database schema

### If you get permission errors:
Make sure your Supabase RLS policies are correctly configured for authenticated users.

## 📋 What the Script Creates

- ✅ `wishlists` table with proper structure
- ✅ Foreign key relationships to users and products
- ✅ Row Level Security (RLS) policies
- ✅ Proper indexes for performance
- ✅ Auto-updating timestamps

## 🔄 Fallback Behavior

Until you set up the database:
- ✅ App won't crash
- ✅ Wishlist appears empty
- ⚠️ Adding to wishlist shows "feature not available" message
- ✅ All other features work normally

---

**Need help?** The application is designed to work without the wishlist feature until you're ready to set it up! 