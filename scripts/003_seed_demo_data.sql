-- Demo Data Seed Script for Cimas Health Group
-- This script creates a complete demo organization with users, feedback, and polls

-- Insert demo organization
INSERT INTO organizations (id, name, slug, subscription_plan, subscription_status, employee_count, billing_email, trial_ends_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Cimas Health Group',
  'cimas-health',
  'professional',
  'trialing',
  150,
  'billing@cimas.co.zw',
  NOW() + INTERVAL '14 days'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subscription_plan = EXCLUDED.subscription_plan,
  subscription_status = EXCLUDED.subscription_status,
  employee_count = EXCLUDED.employee_count,
  billing_email = EXCLUDED.billing_email,
  trial_ends_at = EXCLUDED.trial_ends_at;

-- Note: To create actual working demo users, you need to:
-- 1. Sign up via the UI at /auth/sign-up with these emails:
--    - pandc@cimas.co.zw (P&C Officer)
--    - admin1@cimas.co.zw (System Admin)
--    - elic@cimas.co.zw (Employee)
-- 2. Or use Supabase Auth API to create users programmatically
-- 3. Then update the profiles with the correct organization_id

-- For demo purposes, we'll create sample feedback without submitter_id (anonymous)
-- This allows the seed script to run without auth users

-- Insert sample anonymous feedback items
INSERT INTO feedback (id, organization_id, submitter_id, content, category, sentiment, sentiment_score, status, source, is_spam, created_at)
VALUES 
  -- Anonymous feedback examples
  (
    'c0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'The new health insurance benefits are excellent! Really appreciate the expanded coverage for dependents.',
    'compensation',
    'positive',
    0.85,
    'addressed',
    'web',
    false,
    NOW() - INTERVAL '5 days'
  ),
  (
    'c0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'The office AC has been broken for weeks. It''s affecting productivity, especially in the afternoon.',
    'facilities',
    'negative',
    -0.6,
    'under_review',
    'web',
    false,
    NOW() - INTERVAL '3 days'
  ),
  (
    'c0000000-0000-0000-0000-000000000003'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'Would love to see more professional development opportunities, especially for mid-level staff.',
    'career_development',
    'neutral',
    0.2,
    'new',
    'web',
    false,
    NOW() - INTERVAL '2 days'
  ),
  (
    'c0000000-0000-0000-0000-000000000004'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'The new manager in our department has been very supportive and approachable. Great hire!',
    'management',
    'positive',
    0.9,
    'addressed',
    'ussd',
    false,
    NOW() - INTERVAL '7 days'
  ),
  (
    'c0000000-0000-0000-0000-000000000005'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'Communication about policy changes has been unclear. Would appreciate more transparency.',
    'communication',
    'negative',
    -0.4,
    'under_review',
    'web',
    false,
    NOW() - INTERVAL '1 day'
  ),
  (
    'c0000000-0000-0000-0000-000000000006'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'The flexible work hours policy has greatly improved my work-life balance. Thank you!',
    'work_life_balance',
    'positive',
    0.95,
    'addressed',
    'web',
    false,
    NOW() - INTERVAL '10 days'
  ),
  (
    'c0000000-0000-0000-0000-000000000007'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'Parking situation is getting worse with more staff. Need more parking spaces or shuttle service.',
    'facilities',
    'negative',
    -0.5,
    'new',
    'ussd',
    false,
    NOW() - INTERVAL '4 hours'
  ),
  (
    'c0000000-0000-0000-0000-000000000008'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'Really enjoying the new team building activities. They help us connect better as a team.',
    'workplace_culture',
    'positive',
    0.8,
    'addressed',
    'web',
    false,
    NOW() - INTERVAL '12 days'
  ),
  (
    'c0000000-0000-0000-0000-000000000009'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'The IT support team has been incredibly responsive. Issues are resolved within hours!',
    'workplace_culture',
    'positive',
    0.88,
    'addressed',
    'web',
    false,
    NOW() - INTERVAL '15 days'
  ),
  (
    'c0000000-0000-0000-0000-000000000010'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'Would appreciate clearer career progression paths. Not sure what the next steps are for my role.',
    'career_development',
    'neutral',
    0.1,
    'new',
    'ussd',
    false,
    NOW() - INTERVAL '8 hours'
  )
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  sentiment = EXCLUDED.sentiment,
  sentiment_score = EXCLUDED.sentiment_score,
  status = EXCLUDED.status;

-- Note: feedback_responses require a responder_id (P&C admin user)
-- These will be added after you create the P&C admin user via sign-up

-- Insert sample pulse polls (also requires created_by user)
-- For now, we'll skip these and they can be created via the UI after sign-up

-- Insert sample analytics
INSERT INTO feedback_analytics (id, organization_id, period_start, period_end, total_submissions, sentiment_breakdown, category_breakdown, source_breakdown, created_at)
VALUES (
  'g0000000-0000-0000-0000-000000000001'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  NOW() - INTERVAL '30 days',
  NOW(),
  10,
  '{"positive": 5, "neutral": 2, "negative": 3}'::jsonb,
  '{"compensation": 1, "facilities": 2, "career_development": 2, "management": 1, "communication": 1, "work_life_balance": 1, "workplace_culture": 2}'::jsonb,
  '{"web": 7, "ussd": 3}'::jsonb,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  total_submissions = EXCLUDED.total_submissions,
  sentiment_breakdown = EXCLUDED.sentiment_breakdown,
  category_breakdown = EXCLUDED.category_breakdown,
  source_breakdown = EXCLUDED.source_breakdown;

-- Instructions for completing the demo setup:
-- 
-- 1. Run this seed script to create the organization and sample feedback
-- 2. Sign up three users via the UI at /auth/sign-up:
--    a. pandc@cimas.co.zw - Select "P&C Officer" role, join "Cimas Health Group"
--    b. admin1@cimas.co.zw - Select "System Admin" role, join "Cimas Health Group"
--    c. elic@cimas.co.zw - Select "Employee" role, join "Cimas Health Group"
-- 3. Log in as the P&C officer to respond to feedback and create polls
-- 4. Log in as employees to submit feedback and respond to polls
-- 
-- This approach avoids the foreign key constraint error by not requiring
-- auth users to exist before running the seed script.
