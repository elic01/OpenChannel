import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { question, pollType, options, durationDays } = await request.json()

    if (!question || !pollType || !durationDays) {
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

    // Calculate end date
    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + durationDays)

    // Prepare poll options based on type
    let pollOptions: Record<string, unknown> = {}

    if (pollType === "multiple_choice") {
      if (!options || options.length < 2) {
        return NextResponse.json({ error: "Multiple choice polls need at least 2 options" }, { status: 400 })
      }
      pollOptions = { choices: options }
    } else if (pollType === "rating") {
      pollOptions = { min: 1, max: 5 }
    } else if (pollType === "yes_no") {
      pollOptions = { choices: ["Yes", "No"] }
    }

    // Create poll
    const { data: poll, error } = await supabase
      .from("pulse_polls")
      .insert({
        organization_id: profile.organization_id,
        question,
        poll_type: pollType,
        options: pollOptions,
        is_active: true,
        created_by: user.id,
        ends_at: endsAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Failed to create poll:", error)
      return NextResponse.json({ error: "Failed to create poll" }, { status: 500 })
    }

    return NextResponse.json({ success: true, poll })
  } catch (error) {
    console.error("[v0] Poll creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
