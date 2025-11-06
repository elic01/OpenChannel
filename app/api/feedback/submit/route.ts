import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import crypto from "crypto"

// Simple spam detection heuristics
function detectSpam(content: string): boolean {
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /https?:\/\//gi, // URLs (multiple)
    /\b(viagra|cialis|casino|lottery|prize)\b/gi, // Common spam words
  ]

  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return true
    }
  }

  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.7 && content.length > 20) {
    return true
  }

  return false
}

// Hash phone number for USSD submissions (for rate limiting without storing PII)
function hashPhone(phone: string): string {
  return crypto.createHash("sha256").update(phone).digest("hex")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, category, source = "web", phone } = body

    // Validation
    if (!content || content.trim().length < 10) {
      return NextResponse.json({ error: "Feedback must be at least 10 characters" }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: "Feedback is too long (max 5000 characters)" }, { status: 400 })
    }

    // Spam detection
    const isSpam = detectSpam(content)

    // Hash phone if provided (for USSD)
    const phoneHash = phone ? hashPhone(phone) : null

    // Get organization (for now, use first org - in production, this would be determined by subdomain/config)
    const supabase = await createClient()
    const { data: org } = await supabase.from("organizations").select("id").limit(1).single()

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 500 })
    }

    // Insert feedback
    const { data: feedback, error } = await supabase
      .from("feedback")
      .insert({
        organization_id: org.id,
        content: content.trim(),
        category: category || null,
        source,
        phone_hash: phoneHash,
        status: "pending",
        is_spam: isSpam,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Feedback submission error:", error)
      return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
    }

    if (!isSpam) {
      fetch(`${request.url.replace("/submit", "/analyze")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: feedback.id }),
      }).catch((err) => console.error("[v0] Failed to trigger sentiment analysis:", err))
    }

    return NextResponse.json({ success: true, feedbackId: feedback.id }, { status: 201 })
  } catch (error) {
    console.error("[v0] Feedback API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
