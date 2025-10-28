import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { feedbackId, responseText, isPublic } = await request.json()

    if (!feedbackId || !responseText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role, organization_id").eq("id", user.id).single()

    if (!profile || !["pc_admin", "system_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify feedback belongs to user's organization
    const { data: feedback } = await supabase.from("feedback").select("organization_id").eq("id", feedbackId).single()

    if (!feedback || feedback.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Insert response
    const { data: response, error } = await supabase
      .from("feedback_responses")
      .insert({
        feedback_id: feedbackId,
        responder_id: user.id,
        response_text: responseText,
        is_public: isPublic || false,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Failed to create response:", error)
      return NextResponse.json({ error: "Failed to create response" }, { status: 500 })
    }

    // Update feedback status to under_review if it's new
    await supabase
      .from("feedback")
      .update({ status: "under_review", updated_at: new Date().toISOString() })
      .eq("id", feedbackId)
      .eq("status", "new")

    return NextResponse.json({ success: true, response })
  } catch (error) {
    console.error("[v0] Response API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
