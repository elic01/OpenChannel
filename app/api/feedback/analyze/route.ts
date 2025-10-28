import { createClient } from "@/lib/supabase/server"
import { analyzeSentiment } from "@/lib/ai/sentiment-analysis"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { feedbackId } = await request.json()

    if (!feedbackId) {
      return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the feedback
    const { data: feedback, error: fetchError } = await supabase
      .from("feedback")
      .select("*")
      .eq("id", feedbackId)
      .single()

    if (fetchError || !feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Skip if already analyzed
    if (feedback.sentiment && feedback.sentiment_score !== null) {
      return NextResponse.json({ message: "Already analyzed", sentiment: feedback.sentiment }, { status: 200 })
    }

    // Perform sentiment analysis
    const analysis = await analyzeSentiment(feedback.content)

    // Update feedback with sentiment data
    const { error: updateError } = await supabase
      .from("feedback")
      .update({
        sentiment: analysis.sentiment,
        sentiment_score: analysis.score,
        category: feedback.category || analysis.suggestedCategory || "other",
        updated_at: new Date().toISOString(),
      })
      .eq("id", feedbackId)

    if (updateError) {
      console.error("[v0] Failed to update feedback with sentiment:", updateError)
      return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sentiment: analysis.sentiment,
      score: analysis.score,
      reasoning: analysis.reasoning,
    })
  } catch (error) {
    console.error("[v0] Sentiment analysis API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
