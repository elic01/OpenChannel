import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { pollId, responseValue } = await request.json()

    if (!pollId || !responseValue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify poll exists and is active
    const { data: poll } = await supabase
      .from("pulse_polls")
      .select("*")
      .eq("id", pollId)
      .eq("is_active", true)
      .single()

    if (!poll) {
      return NextResponse.json({ error: "Poll not found or inactive" }, { status: 404 })
    }

    // Check if poll has ended
    if (new Date(poll.ends_at) < new Date()) {
      return NextResponse.json({ error: "Poll has ended" }, { status: 400 })
    }

    // Submit response
    const { error } = await supabase.from("pulse_poll_responses").insert({
      poll_id: pollId,
      response_value: responseValue,
      source: "web",
      phone_hash: null,
    })

    if (error) {
      console.error("[v0] Failed to submit poll response:", error)
      return NextResponse.json({ error: "Failed to submit response" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Poll response error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
