-- Fix for Autora Buyer Authentication Issues
-- This script addresses the "JSON object requested, multiple (or no) rows returned" error
-- by ensuring proper profile records exist for buyer users

BEGIN;

-- 1. Create a function to ensure buyer profiles exist
CREATE OR REPLACE FUNCTION public.ensure_buyer_profile_exists(p_user_id UUID, p_email TEXT)
RETURNS UUID AS $$
DECLARE
  profile_id UUID;
  existing_profile_count INTEGER;
BEGIN
  -- Check how many profiles exist with this user ID
  SELECT COUNT(*) INTO existing_profile_count
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- If multiple profiles exist with same ID, keep the first one and delete duplicates
  IF existing_profile_count > 1 THEN
    -- Get the first profile ID
    SELECT id INTO profile_id
    FROM public.profiles
    WHERE id = p_user_id
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Delete duplicates
    DELETE FROM public.profiles
    WHERE id = p_user_id
    AND ctid NOT IN (
      SELECT ctid
      FROM public.profiles
      WHERE id = p_user_id
      ORDER BY created_at ASC
      LIMIT 1
    );
    
    RAISE NOTICE 'Removed duplicate profiles for user %', p_user_id;
  ELSIF existing_profile_count = 1 THEN
    -- Profile exists, just return the ID
    SELECT id INTO profile_id
    FROM public.profiles
    WHERE id = p_user_id;
  ELSE
    -- No profile exists, create one
    -- First check if a profile exists with this email but different ID
    SELECT id INTO profile_id
    FROM public.profiles
    WHERE email = p_email
    LIMIT 1;
    
    IF profile_id IS NOT NULL THEN
      -- Update the existing profile to use the correct auth user ID
      UPDATE public.profiles
      SET id = p_user_id
      WHERE email = p_email;
      
      profile_id := p_user_id;
      RAISE NOTICE 'Updated existing profile with email % to use correct user ID %', p_email, p_user_id;
    ELSE
      -- Create a new buyer profile
      INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        created_at,
        is_active
      ) VALUES (
        p_user_id,
        split_part(p_email, '@', 1), -- Use email prefix as name
        p_email,
        'customer',
        NOW(),
        TRUE
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = 'customer',
        is_active = TRUE;
      
      profile_id := p_user_id;
      RAISE NOTICE 'Created new buyer profile for user %', p_user_id;
    END IF;
  END IF;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a function to fix all existing auth users who might be missing profiles
CREATE OR REPLACE FUNCTION public.fix_buyer_auth_users()
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  fixed_count INTEGER := 0;
BEGIN
  -- Loop through all auth users who don't have profiles
  FOR user_record IN (
    SELECT au.id, au.email
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
    AND au.email IS NOT NULL
  ) LOOP
    -- Ensure profile exists for this user
    PERFORM public.ensure_buyer_profile_exists(user_record.id, user_record.email);
    fixed_count := fixed_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Fixed % auth users missing profiles', fixed_count;
  RETURN fixed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Remove duplicate profiles (same email, different IDs)
CREATE OR REPLACE FUNCTION public.remove_duplicate_buyer_profiles()
RETURNS INTEGER AS $$
DECLARE
  email_record RECORD;
  removed_count INTEGER := 0;
BEGIN
  -- Find emails that have multiple profile records
  FOR email_record IN (
    SELECT email, COUNT(*) as profile_count
    FROM public.profiles
    WHERE role = 'customer'
    GROUP BY email
    HAVING COUNT(*) > 1
  ) LOOP
    -- Keep the profile with the most recent created_at, remove others
    DELETE FROM public.profiles
    WHERE email = email_record.email
    AND role = 'customer'
    AND id NOT IN (
      SELECT id
      FROM public.profiles
      WHERE email = email_record.email
      AND role = 'customer'
      ORDER BY created_at DESC
      LIMIT 1
    );
    
    removed_count := removed_count + (email_record.profile_count - 1);
    
    RAISE NOTICE 'Removed % duplicate profiles for email %', 
                 (email_record.profile_count - 1), email_record.email;
  END LOOP;
  
  RAISE NOTICE 'Total duplicate profiles removed: %', removed_count;
  RETURN removed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Run the fixes
SELECT public.remove_duplicate_buyer_profiles();
SELECT public.fix_buyer_auth_users();

-- 5. Create RPC functions that the frontend can call
CREATE OR REPLACE FUNCTION public.ensure_my_buyer_profile()
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  profile_id UUID;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;
  
  IF current_user_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User email not found'
    );
  END IF;
  
  -- Ensure profile exists
  profile_id := public.ensure_buyer_profile_exists(current_user_id, current_user_email);
  
  RETURN json_build_object(
    'success', true,
    'profile_id', profile_id,
    'message', 'Profile ensured for buyer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.ensure_my_buyer_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_buyer_profile_exists(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.fix_buyer_auth_users() TO service_role;
GRANT EXECUTE ON FUNCTION public.remove_duplicate_buyer_profiles() TO service_role;

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Buyer authentication fix completed successfully!';
  RAISE NOTICE 'You can now run SELECT public.ensure_my_buyer_profile(); to ensure your profile exists';
END $$; 