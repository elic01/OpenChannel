-- Enable RLS on all tables with SECURITY DEFINER functions to avoid recursion
-- This approach separates authentication logic from row-level access

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('pc_admin', 'system_admin')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_user_org(user_id UUID)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT organization_id FROM profiles WHERE id = user_id LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "users_view_own_organization" ON organizations;
DROP POLICY IF EXISTS "admins_manage_organizations" ON organizations;

-- New policies using SECURITY DEFINER functions
CREATE POLICY "org_allow_public_read" ON organizations
  FOR SELECT
  USING (true);

CREATE POLICY "org_admins_manage" ON organizations
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============================================
-- PROFILES TABLE
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_view_org_profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_manage_profiles" ON profiles;

-- New policies using SECURITY DEFINER functions
CREATE POLICY "profile_users_view_own" ON profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profile_admins_view_all" ON profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "profile_users_update_own" ON profiles
  FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profile_admins_manage" ON profiles
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Allow signup without requiring existing profile
CREATE POLICY "profile_allow_signup_insert" ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================
-- FEEDBACK TABLE
-- ============================================
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_submit_feedback" ON feedback;
DROP POLICY IF EXISTS "admins_view_feedback" ON feedback;
DROP POLICY IF EXISTS "users_view_own_feedback" ON feedback;
DROP POLICY IF EXISTS "admins_update_feedback" ON feedback;

-- Simplified feedback policies
CREATE POLICY "feedback_anyone_insert" ON feedback
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "feedback_admins_view" ON feedback
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "feedback_users_view_own" ON feedback
  FOR SELECT
  USING (submitter_id = auth.uid());

CREATE POLICY "feedback_admins_update" ON feedback
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- ============================================
-- FEEDBACK_RESPONSES TABLE
-- ============================================
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_manage_responses" ON feedback_responses;
DROP POLICY IF EXISTS "public_view_public_responses" ON feedback_responses;

CREATE POLICY "response_admins_manage" ON feedback_responses
  FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "response_public_view" ON feedback_responses
  FOR SELECT
  USING (is_public = true);

-- ============================================
-- PULSE_POLLS TABLE
-- ============================================
ALTER TABLE pulse_polls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_view_active_polls" ON pulse_polls;
DROP POLICY IF EXISTS "admins_manage_polls" ON pulse_polls;

CREATE POLICY "poll_public_view" ON pulse_polls
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "poll_admins_manage" ON pulse_polls
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============================================
-- PULSE_POLL_RESPONSES TABLE
-- ============================================
ALTER TABLE pulse_poll_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_submit_poll_response" ON pulse_poll_responses;
DROP POLICY IF EXISTS "admins_view_poll_responses" ON pulse_poll_responses;

CREATE POLICY "poll_response_insert" ON pulse_poll_responses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "poll_response_admins_view" ON pulse_poll_responses
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================
-- FEEDBACK_ANALYTICS TABLE
-- ============================================
ALTER TABLE feedback_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_view_analytics" ON feedback_analytics;
DROP POLICY IF EXISTS "system_insert_analytics" ON feedback_analytics;

CREATE POLICY "analytics_admins_view" ON feedback_analytics
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "analytics_insert" ON feedback_analytics
  FOR INSERT
  WITH CHECK (true);
