import { NextResponse } from "next/server"

/**
 * USSD Test Endpoint
 * Simulates USSD interactions for testing without a real USSD gateway
 */
export async function GET() {
  return NextResponse.json({
    message: "USSD Test Interface",
    instructions: "Use POST to simulate USSD requests",
    example: {
      method: "POST",
      body: {
        phoneNumber: "+254712345678",
        text: "1*2*This is my feedback",
      },
    },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward to actual webhook
    const webhookUrl = new URL("/api/ussd/webhook", request.url)
    const response = await fetch(webhookUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const text = await response.text()

    return NextResponse.json({
      success: true,
      response: text,
      parsed: {
        type: text.startsWith("CON") ? "continue" : "end",
        message: text.substring(4),
      },
    })
  } catch (error) {
    console.error("[v0] USSD test error:", error)
    return NextResponse.json({ error: "Test failed" }, { status: 500 })
  }
}
