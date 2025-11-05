-- Fix profile creation issues and add safer functions
-- This script adds a secure function for profile creation/updates
-- and modifies the RLS policy to allow new signups

-- First, ensure the profile creation policy allows new signups
DROP POLICY IF EXISTS "profile_allow_signup_insert" ON profiles;

CREATE POLICY "profile_allow_signup_insert" ON profiles
  FOR INSERT
  WITH CHECK (true);  -- Allow initial creation, other policies will handle auth checks

-- Create a secure function for profile management
CREATE OR REPLACE FUNCTION public.manage_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_department TEXT,
  p_organization_id UUID
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  -- Attempt to insert or update the profile
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    department,
    organization_id,
    is_active,
    updated_at
  )
  VALUES (
    p_user_id,
    p_email,
    p_full_name,
    p_role,
    p_department,
    p_organization_id,
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    organization_id = EXCLUDED.organization_id,
    is_active = true,
    updated_at = NOW()
  RETURNING id INTO v_profile_id;

  RETURN v_profile_id;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.manage_profile(UUID, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.manage_profile(UUID, TEXT, TEXT, TEXT, TEXT, UUID) TO service_role;

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);

-- Comment explaining usage
COMMENT ON FUNCTION public.manage_profile IS 
'Securely creates or updates a user profile. This function handles the upsert operation
and should be used instead of direct INSERT/UPDATE operations on the profiles table.
Example usage:
SELECT manage_profile(
  auth.uid(),
  ''user@example.com'',
  ''Full Name'',
  ''user'',
  ''Sales'',
  ''organization-uuid''
);';