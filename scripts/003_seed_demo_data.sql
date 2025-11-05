-- Demo Data Seed Script for Cimas Health Group
-- Creates organization and sample feedback/polls WITHOUT requiring pre-existing auth users
-- Auth users can be created separately through the signup flow

-- Create organization
INSERT INTO organizations (id, name, slug, subscription_plan, subscription_status, employee_count, billing_email, trial_ends_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Cimas Health Group',
  'cimas-health-group',
  'professional',
  'trialing',
  150,
  'billing@cimas.co.zw',
  NOW() + INTERVAL '14 days'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample feedback (anonymous only - no submitter_id to avoid foreign key issues)
-- P&C can create profiles separately through the UI
INSERT INTO feedback (id, organization_id, submitter_id, content, category, sentiment, sentiment_score, status, source, is_spam, created_at)
VALUES 
  (
    '950e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
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
    '950e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    NULL,
    'The office AC has been broken for weeks. Its affecting productivity, especially in the afternoon.',
    'facilities',
    'negative',
    -0.6,
    'under_review',
    'web',
    false,
    NOW() - INTERVAL '3 days'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440003'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
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
    '950e8400-e29b-41d4-a716-446655440004'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
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
    '950e8400-e29b-41d4-a716-446655440005'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
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
    '950e8400-e29b-41d4-a716-446655440006'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
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
    '950e8400-e29b-41d4-a716-446655440007'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
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
    '950e8400-e29b-41d4-a716-446655440008'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
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
    '950e8400-e29b-41d4-a716-446655440009'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
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
    '950e8400-e29b-41d4-a716-446655440010'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
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
ON CONFLICT (id) DO NOTHING;

-- Insert sample pulse polls
INSERT INTO pulse_polls (id, organization_id, created_by, title, description, poll_type, options, is_active, starts_at, ends_at, created_at)
VALUES 
  (
    'a50e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    NULL,
    'How satisfied are you with our workplace facilities?',
    'Quick pulse on current facilities satisfaction',
    'rating',
    '["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]'::jsonb,
    true,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    NULL,
    'Would you recommend Cimas as a great place to work?',
    'Net Promoter Score pulse',
    'yesno',
    '["Yes", "No", "Maybe"]'::jsonb,
    true,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '6 days',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample analytics
INSERT INTO feedback_analytics (id, organization_id, period_start, period_end, total_submissions, sentiment_breakdown, category_breakdown, source_breakdown, created_at)
VALUES (
  'd50e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  NOW() - INTERVAL '30 days',
  NOW(),
  10,
  '{"positive": 5, "neutral": 2, "negative": 3}'::jsonb,
  '{"compensation": 1, "facilities": 2, "career_development": 2, "management": 1, "communication": 1, "work_life_balance": 1, "workplace_culture": 2}'::jsonb,
  '{"web": 7, "ussd": 3}'::jsonb,
  NOW()
) ON CONFLICT (id) DO NOTHING;
