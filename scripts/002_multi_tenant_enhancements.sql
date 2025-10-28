-- Multi-Tenant Enhancements & Enhanced Anonymity
-- This script adds enhanced security for anonymous feedback

-- Create a secure VIEW for P&C admins that NEVER exposes submitter_id
-- This ensures P&C admins can NEVER see who submitted anonymous feedback
CREATE OR REPLACE VIEW pc_admin_feedback_view AS
SELECT 
  f.id,
  f.organization_id,
  f.content,
  f.category,
  f.sentiment,
  f.sentiment_score,
  f.status,
  f.source,
  f.phone_hash,
  f.is_spam,
  f.created_at,
  f.updated_at,
  -- Count of responses for this feedback
  (SELECT COUNT(*) FROM feedback_responses WHERE feedback_id = f.id) as response_count,
  -- Latest response timestamp
  (SELECT MAX(created_at) FROM feedback_responses WHERE feedback_id = f.id) as last_response_at
FROM feedback f
WHERE f.is_spam = false;

-- Grant access to authenticated users (will be filtered by RLS)
GRANT SELECT ON pc_admin_feedback_view TO authenticated;

-- Add subscription fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS billing_email TEXT;

-- Add index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer 
ON organizations(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status 
ON organizations(subscription_status);

-- Add employee_count to organizations for billing
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 0;

-- Add is_active flag to profiles for terminated employees
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMP WITH TIME ZONE;

-- Create index for active employees
CREATE INDEX IF NOT EXISTS idx_profiles_active 
ON profiles(organization_id, is_active);

-- Update RLS policies to respect is_active flag
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id AND is_active = true);

-- P&C admins can view all active profiles in their org
DROP POLICY IF EXISTS "PC admins can view org profiles" ON profiles;
CREATE POLICY "PC admins can view org profiles" 
ON profiles FOR SELECT 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('pc_admin', 'system_admin')
    AND is_active = true
  )
);

-- Only system admins can update is_active status
CREATE POLICY "System admins can terminate employees" 
ON profiles FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'system_admin'
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'system_admin'
    AND is_active = true
  )
);

-- Add submitter_id to feedback table (nullable for anonymous submissions)
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS submitter_id UUID REFERENCES profiles(id);

-- Create index for submitter lookups
CREATE INDEX IF NOT EXISTS idx_feedback_submitter 
ON feedback(submitter_id);

-- RLS policy: Employees can see their own submissions
CREATE POLICY "Employees can view own submissions" 
ON feedback FOR SELECT 
TO authenticated 
USING (
  submitter_id = auth.uid() 
  OR submitter_id IS NULL -- Anonymous feedback visible to all
);

-- Create a function to update employee count
CREATE OR REPLACE FUNCTION update_organization_employee_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE organizations 
  SET employee_count = (
    SELECT COUNT(*) 
    FROM profiles 
    WHERE organization_id = COALESCE(NEW.organization_id, OLD.organization_id)
    AND is_active = true
  )
  WHERE id = COALESCE(NEW.organization_id, OLD.organization_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update employee count
DROP TRIGGER IF EXISTS trigger_update_employee_count ON profiles;
CREATE TRIGGER trigger_update_employee_count
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_organization_employee_count();
