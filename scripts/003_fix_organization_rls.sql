-- Fix organization and profile creation during signup

-- Allow organization creation during signup
DROP POLICY IF EXISTS "org_allow_signup_insert" ON organizations;
CREATE POLICY "org_allow_signup_insert" ON organizations
  FOR INSERT
  WITH CHECK (true);

-- Ensure organizations RLS is enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Allow profile creation during signup
DROP POLICY IF EXISTS "profile_allow_signup_insert" ON profiles;
CREATE POLICY "profile_allow_signup_insert" ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Ensure profiles RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;