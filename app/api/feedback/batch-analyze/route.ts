import { createClient } from "@/lib/supabase/server"
import { analyzeSentiment } from "@/lib/ai/sentiment-analysis"
import { NextResponse } from "next/server"

/**
 * Batch analyze unanalyzed feedback
 * This can be called by a cron job or manually by admins
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["pc_admin", "system_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get unanalyzed feedback (limit to 50 at a time)
    const { data: feedbackList, error: fetchError } = await supabase
      .from("feedback")
      .select("id, content, category")
      .is("sentiment", null)
      .eq("is_spam", false)
      .limit(50)

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
    }

    if (!feedbackList || feedbackList.length === 0) {
      return NextResponse.json({ message: "No feedback to analyze", analyzed: 0 }, { status: 200 })
    }

    // Analyze each feedback item
    const results = []
    for (const feedback of feedbackList) {
      try {
        const analysis = await analyzeSentiment(feedback.content)

        const { error: updateError } = await supabase
          .from("feedback")
          .update({
            sentiment: analysis.sentiment,
            sentiment_score: analysis.score,
            category: feedback.category || analysis.suggestedCategory || "other",
            updated_at: new Date().toISOString(),
          })
          .eq("id", feedback.id)

        if (!updateError) {
          results.push({ id: feedback.id, success: true, sentiment: analysis.sentiment })
        } else {
          results.push({ id: feedback.id, success: false, error: updateError.message })
        }
      } catch (error) {
        console.error(`[v0] Failed to analyze feedback ${feedback.id}:`, error)
        results.push({ id: feedback.id, success: false, error: "Analysis failed" })
      }
    }

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      message: `Analyzed ${successCount} of ${feedbackList.length} feedback items`,
      analyzed: successCount,
      total: feedbackList.length,
      results,
    })
  } catch (error) {
    console.error("[v0] Batch analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
