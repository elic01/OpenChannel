export type UserRole = "employee" | "pc_admin" | "system_admin"
export type FeedbackSource = "web" | "ussd"
export type FeedbackStatus = "new" | "under_review" | "addressed" | "archived"
export type SentimentType = "positive" | "neutral" | "negative"
export type PollType = "rating" | "multiple_choice" | "yes_no"

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  department: string | null
  organization_id: string
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  organization_id: string
  content: string
  source: FeedbackSource
  phone_hash: string | null
  category: string | null
  sentiment: SentimentType | null
  sentiment_score: number | null
  status: FeedbackStatus
  is_spam: boolean
  created_at: string
  updated_at: string
}

export interface FeedbackResponse {
  id: string
  feedback_id: string
  responder_id: string
  response_text: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface PulsePoll {
  id: string
  organization_id: string
  question: string
  poll_type: PollType
  options: Record<string, unknown>
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  ends_at: string
}

export interface PulsePollResponse {
  id: string
  poll_id: string
  response_value: string
  source: FeedbackSource
  phone_hash: string | null
  created_at: string
}

export interface FeedbackAnalytics {
  id: string
  organization_id: string
  period_start: string
  period_end: string
  total_submissions: number
  sentiment_breakdown: Record<string, number>
  category_breakdown: Record<string, number>
  source_breakdown: Record<string, number>
  created_at: string
}
