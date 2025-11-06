-- Drop the function if it exists (to handle any signature changes)
DROP FUNCTION IF EXISTS public.manage_profile(UUID, TEXT, TEXT, TEXT, TEXT, UUID);

-- Create a SECURITY DEFINER function to manage user profiles
-- This bypasses RLS when creating profiles during signup
CREATE FUNCTION public.manage_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_department TEXT,
  p_organization_id UUID
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    department,
    organization_id,
    is_active,
    created_at,
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
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = p_email,
    full_name = p_full_name,
    role = p_role,
    department = p_department,
    updated_at = NOW();

  v_result := json_build_object(
    'success', true,
    'user_id', p_user_id
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.manage_profile(UUID, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
