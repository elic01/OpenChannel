-- Enable RLS on all tables and create comprehensive security policies

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own organization
CREATE POLICY "users_view_own_organization" ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Only system admins can insert/update/delete organizations
CREATE POLICY "admins_manage_organizations" ON organizations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'system_admin'
    )
  );

-- ============================================
-- PROFILES TABLE
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON profiles
  FOR SELECT
  USING (id = auth.uid());

-- P&C admins and system admins can view all profiles in their organization
CREATE POLICY "admins_view_org_profiles" ON profiles
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
      AND role IN ('pc_admin', 'system_admin')
    )
  );

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- System admins can insert new profiles
CREATE POLICY "admins_insert_profiles" ON profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'system_admin'
    )
  );

-- ============================================
-- FEEDBACK TABLE
-- ============================================
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for anonymous feedback submission)
CREATE POLICY "anonymous_submit_feedback" ON feedback
  FOR INSERT
  WITH CHECK (true);

-- P&C admins and system admins can view all feedback in their organization
CREATE POLICY "admins_view_org_feedback" ON feedback
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
      AND role IN ('pc_admin', 'system_admin')
    )
  );

-- P&C admins can update feedback status and categorization
CREATE POLICY "admins_update_feedback" ON feedback
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
      AND role IN ('pc_admin', 'system_admin')
    )
  );

-- ============================================
-- FEEDBACK_RESPONSES TABLE
-- ============================================
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

-- P&C admins can create responses
CREATE POLICY "admins_create_responses" ON feedback_responses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN feedback f ON f.organization_id = p.organization_id
      WHERE p.id = auth.uid()
      AND p.role IN ('pc_admin', 'system_admin')
      AND f.id = feedback_id
    )
  );

-- Anyone can view public responses
CREATE POLICY "public_view_public_responses" ON feedback_responses
  FOR SELECT
  USING (is_public = true);

-- P&C admins can view all responses in their organization
CREATE POLICY "admins_view_org_responses" ON feedback_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN feedback f ON f.organization_id = p.organization_id
      WHERE p.id = auth.uid()
      AND p.role IN ('pc_admin', 'system_admin')
      AND f.id = feedback_id
    )
  );

-- P&C admins can update their own responses
CREATE POLICY "admins_update_own_responses" ON feedback_responses
  FOR UPDATE
  USING (responder_id = auth.uid());

-- ============================================
-- PULSE_POLLS TABLE
-- ============================================
ALTER TABLE pulse_polls ENABLE ROW LEVEL SECURITY;

-- Anyone can view active polls for their organization
CREATE POLICY "public_view_active_polls" ON pulse_polls
  FOR SELECT
  USING (is_active = true);

-- P&C admins can create polls
CREATE POLICY "admins_create_polls" ON pulse_polls
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('pc_admin', 'system_admin')
      AND organization_id = pulse_polls.organization_id
    )
  );

-- P&C admins can update their own polls
CREATE POLICY "admins_update_own_polls" ON pulse_polls
  FOR UPDATE
  USING (created_by = auth.uid());

-- ============================================
-- PULSE_POLL_RESPONSES TABLE
-- ============================================
ALTER TABLE pulse_poll_responses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous poll responses
CREATE POLICY "anonymous_submit_poll_response" ON pulse_poll_responses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pulse_polls
      WHERE id = poll_id
      AND is_active = true
    )
  );

-- P&C admins can view poll responses for their organization
CREATE POLICY "admins_view_poll_responses" ON pulse_poll_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN pulse_polls pp ON pp.organization_id = p.organization_id
      WHERE p.id = auth.uid()
      AND p.role IN ('pc_admin', 'system_admin')
      AND pp.id = poll_id
    )
  );

-- ============================================
-- FEEDBACK_ANALYTICS TABLE
-- ============================================
ALTER TABLE feedback_analytics ENABLE ROW LEVEL SECURITY;

-- P&C admins can view analytics for their organization
CREATE POLICY "admins_view_org_analytics" ON feedback_analytics
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
      AND role IN ('pc_admin', 'system_admin')
    )
  );

-- System can insert analytics (via backend processes)
CREATE POLICY "system_insert_analytics" ON feedback_analytics
  FOR INSERT
  WITH CHECK (true);
