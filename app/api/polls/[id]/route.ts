import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { isActive } = await request.json()

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

    // Verify poll belongs to user's organization
    const { data: poll } = await supabase.from("pulse_polls").select("organization_id, ends_at").eq("id", id).single()

    if (!poll || poll.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Check if poll has ended
    if (new Date(poll.ends_at) < new Date() && isActive) {
      return NextResponse.json({ error: "Cannot reactivate an ended poll" }, { status: 400 })
    }

    // Update poll
    const { error } = await supabase.from("pulse_polls").update({ is_active: isActive }).eq("id", id)

    if (error) {
      console.error("[v0] Failed to update poll:", error)
      return NextResponse.json({ error: "Failed to update poll" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Poll update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
