"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Generate analytics for a given time period
 */
export async function generateAnalytics(organizationId: string, periodStart: Date, periodEnd: Date) {
  const supabase = await createClient()

  // Get all feedback in the period
  const { data: feedbackList, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("organization_id", organizationId)
    .gte("created_at", periodStart.toISOString())
    .lte("created_at", periodEnd.toISOString())
    .eq("is_spam", false)

  if (error || !feedbackList) {
    console.error("[v0] Failed to fetch feedback for analytics:", error)
    return null
  }

  // Calculate breakdowns
  const sentimentBreakdown: Record<string, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
  }

  const categoryBreakdown: Record<string, number> = {}
  const sourceBreakdown: Record<string, number> = {
    web: 0,
    ussd: 0,
  }

  for (const feedback of feedbackList) {
    // Sentiment
    if (feedback.sentiment) {
      sentimentBreakdown[feedback.sentiment] = (sentimentBreakdown[feedback.sentiment] || 0) + 1
    }

    // Category
    if (feedback.category) {
      categoryBreakdown[feedback.category] = (categoryBreakdown[feedback.category] || 0) + 1
    }

    // Source
    if (feedback.source) {
      sourceBreakdown[feedback.source] = (sourceBreakdown[feedback.source] || 0) + 1
    }
  }

  // Insert or update analytics
  const { data: analytics, error: analyticsError } = await supabase
    .from("feedback_analytics")
    .upsert({
      organization_id: organizationId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      total_submissions: feedbackList.length,
      sentiment_breakdown: sentimentBreakdown,
      category_breakdown: categoryBreakdown,
      source_breakdown: sourceBreakdown,
    })
    .select()
    .single()

  if (analyticsError) {
    console.error("[v0] Failed to save analytics:", analyticsError)
    return null
  }

  return analytics
}
