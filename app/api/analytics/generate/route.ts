import { createClient } from "@/lib/supabase/server"
import { generateAnalytics } from "@/lib/actions/analytics"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role, organization_id").eq("id", user.id).single()

    if (!profile || !["pc_admin", "system_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Generate analytics for the last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    console.log(`[Analytics] Generating analytics for org ${profile.organization_id} from ${startDate.toISOString()} to ${endDate.toISOString()}`)

    const analytics = await generateAnalytics(profile.organization_id, startDate, endDate)

    if (!analytics) {
      return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analytics,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    })
  } catch (error) {
    console.error("[Analytics] Generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
