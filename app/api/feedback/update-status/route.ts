import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { feedbackId, status } = await request.json()

    if (!feedbackId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validStatuses = ["pending", "under_review", "addressed", "archived"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
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

    // Update status
    const { error } = await supabase
      .from("feedback")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", feedbackId)

    if (error) {
      console.error("[v0] Failed to update status:", error)
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Status update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
