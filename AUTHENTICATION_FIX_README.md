# Autora Buyer Authentication Fix

## Problem
The autora-buyer application was experiencing authentication errors with the message: **"JSON object requested, multiple (or no) rows returned"**

This error occurs when using Supabase's `.single()` method on queries that return either:
- No rows (user has no profile)
- Multiple rows (duplicate profiles)

## Root Cause
The issue was caused by:
1. Missing profile records for authenticated users
2. Potential duplicate profile records with the same email
3. Using `.single()` instead of `.maybeSingle()` in profile queries

## Solution Implemented

### 1. Code Changes
**Files Modified:**
- `src/contexts/AuthContext.jsx` - Main authentication context
- `shared/services/userService.js` - User service functions

**Key Changes:**
- Replaced `.single()` with `.maybeSingle()` to handle missing profiles gracefully
- Added fallback logic to search profiles by email if ID lookup fails
- Added automatic profile creation for buyer users when missing
- Improved error handling to only throw on actual errors, not "no rows found"

### 2. Database Fixes
**File Created:** `fix-buyer-authentication.sql`

This SQL script provides:
- `ensure_buyer_profile_exists()` - Function to create/fix buyer profiles
- `remove_duplicate_buyer_profiles()` - Removes duplicate profiles
- `fix_buyer_auth_users()` - Fixes all auth users missing profiles
- `ensure_my_buyer_profile()` - RPC function for frontend to ensure profile exists

### 3. How to Apply the Fix

#### Step 1: Apply Database Changes
Run the SQL script in your Supabase dashboard:
```bash
# Copy the contents of fix-buyer-authentication.sql
# Paste into Supabase Dashboard > SQL Editor > Run
```

#### Step 2: Code is Already Updated
The authentication context and services have been updated to handle the errors gracefully.

#### Step 3: Test the Application
```bash
npm run dev
```

### 4. Verification

After applying the fix, you should be able to:
1. Log in without the "multiple rows" error
2. Have profiles automatically created for buyer accounts
3. See improved error handling in the browser console

### 5. Prevention

The fix includes:
- **Automatic Profile Creation**: Missing profiles are created automatically
- **Duplicate Handling**: Duplicate profiles are detected and cleaned up
- **Graceful Fallbacks**: Multiple lookup strategies (by ID, then by email)
- **Better Error Handling**: Only real errors are thrown, not "no data found"

### 6. Key Functions Added

#### `ensureBuyerProfile(user)`
Called automatically during authentication to ensure a profile exists.

#### `ensure_my_buyer_profile()`
RPC function that can be called from the frontend to ensure the current user has a profile.

### 7. Troubleshooting

If you still see authentication issues:

1. **Check the browser console** for detailed error logs
2. **Run the database fix manually**:
   ```sql
   SELECT public.ensure_my_buyer_profile();
   ```
3. **Clear browser cache** and try logging in again

### 8. Impact on Dealer Application

✅ **No Impact** - This fix is specific to the buyer application and won't affect the dealer authentication system.

## Technical Details

### Before Fix:
```javascript
// This would throw error if no profile found
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single(); // ❌ Throws error if 0 or 2+ rows
```

### After Fix:
```javascript
// This handles missing profiles gracefully
let { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle(); // ✅ Returns null if no rows, throws only on real errors

// Fallback to email lookup
if (!profile && !error && userEmail) {
  const { data: profileByEmail } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', userEmail)
    .maybeSingle();
  
  if (profileByEmail) {
    profile = profileByEmail;
  }
}

// Create profile if still missing
if (!profile) {
  // Create new buyer profile...
}
```

This ensures robust authentication that works even with missing or inconsistent data. 