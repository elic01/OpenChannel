import { NextResponse } from "next/server"
import { getSession, updateSession, clearSession, createSession } from "@/lib/ussd/session-manager"
import {
  buildWelcomeMenu,
  buildCategoryMenu,
  buildFeedbackPrompt,
  buildConfirmationMenu,
  buildSuccessMessage,
  buildErrorMessage,
  getCategoryValue,
  buildPollListMenu,
  buildPollResponseMenu,
} from "@/lib/ussd/menu-builder"
import { createClient } from "@/lib/supabase/server"

/**
 * USSD Webhook Handler
 * Handles incoming USSD requests from telecom providers
 *
 * Expected request format (Africa's Talking style):
 * {
 *   sessionId: string,
 *   serviceCode: string,
 *   phoneNumber: string,
 *   text: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phoneNumber, text } = body

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Parse user input
    const inputs = text ? text.split("*") : []
    const latestInput = inputs[inputs.length - 1] || ""

    // Get or create session
    let session = getSession(phoneNumber)
    if (!session || inputs.length === 0) {
      session = createSession(phoneNumber)
    }

    // Route based on current step
    let response

    switch (session.step) {
      case "welcome":
        response = await handleWelcomeMenu(latestInput, phoneNumber)
        break

      case "select_category":
        response = await handleCategorySelection(latestInput, phoneNumber)
        break

      case "enter_feedback":
        response = await handleFeedbackInput(latestInput, phoneNumber)
        break

      case "confirm_feedback":
        response = await handleFeedbackConfirmation(latestInput, phoneNumber)
        break

      case "select_poll":
        response = await handlePollSelection(latestInput, phoneNumber)
        break

      case "respond_to_poll":
        response = await handlePollResponse(latestInput, phoneNumber)
        break

      default:
        response = buildWelcomeMenu()
        updateSession(phoneNumber, "welcome")
    }

    // Format response for USSD gateway
    const ussdResponse = response.continueSession ? `CON ${response.message}` : `END ${response.message}`

    return new NextResponse(ussdResponse, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  } catch (error) {
    console.error("[v0] USSD webhook error:", error)
    return new NextResponse("END An error occurred. Please try again later.", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  }
}

async function handleWelcomeMenu(input: string, phoneNumber: string) {
  if (input === "1") {
    updateSession(phoneNumber, "select_category")
    return buildCategoryMenu()
  } else if (input === "2") {
    updateSession(phoneNumber, "select_poll")
    return await loadActivePolls(phoneNumber)
  } else if (input === "3") {
    return buildErrorMessage("Updates feature coming soon")
  } else if (input === "0") {
    clearSession(phoneNumber)
    return { message: "Thank you for using OpenChannel.", continueSession: false }
  } else {
    return buildWelcomeMenu()
  }
}

async function handleCategorySelection(input: string, phoneNumber: string) {
  if (input === "0") {
    updateSession(phoneNumber, "welcome")
    return buildWelcomeMenu()
  }

  if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(input)) {
    updateSession(phoneNumber, "enter_feedback", { category: input })
    return buildFeedbackPrompt()
  }

  return buildCategoryMenu()
}

async function handleFeedbackInput(input: string, phoneNumber: string) {
  if (input === "0") {
    updateSession(phoneNumber, "select_category")
    return buildCategoryMenu()
  }

  if (input.trim().length < 10) {
    return {
      message: "Feedback too short. Please provide at least 10 characters.\n\n0. Cancel",
      continueSession: true,
    }
  }

  const session = getSession(phoneNumber)
  if (!session) {
    return buildErrorMessage("Session expired")
  }

  updateSession(phoneNumber, "confirm_feedback", { feedback: input })
  return buildConfirmationMenu(session.data.category as string, input)
}

async function handleFeedbackConfirmation(input: string, phoneNumber: string) {
  const session = getSession(phoneNumber)
  if (!session) {
    return buildErrorMessage("Session expired")
  }

  if (input === "1") {
    // Submit feedback
    try {
      const supabase = await createClient()

      // Get organization (first org for demo)
      const { data: org } = await supabase.from("organizations").select("id").limit(1).single()

      if (!org) {
        return buildErrorMessage("Organization not found")
      }

      const category = getCategoryValue(session.data.category as string)
      const feedback = session.data.feedback as string

      // Submit feedback
      const { error } = await supabase.from("feedback").insert({
        organization_id: org.id,
        content: feedback,
        category,
        source: "ussd",
        phone_hash: hashPhone(phoneNumber),
        status: "pending",
        is_spam: false,
      })

      if (error) {
        console.error("[v0] USSD feedback submission error:", error)
        return buildErrorMessage("Failed to submit feedback")
      }

      clearSession(phoneNumber)
      return buildSuccessMessage()
    } catch (error) {
      console.error("[v0] USSD submission error:", error)
      return buildErrorMessage("Failed to submit feedback")
    }
  } else if (input === "2") {
    // Edit feedback
    updateSession(phoneNumber, "enter_feedback")
    return buildFeedbackPrompt()
  } else if (input === "0") {
    clearSession(phoneNumber)
    return { message: "Feedback cancelled.", continueSession: false }
  }

  return buildConfirmationMenu(session.data.category as string, session.data.feedback as string)
}

async function loadActivePolls(phoneNumber: string) {
  try {
    const supabase = await createClient()

    // Get organization
    const { data: org } = await supabase.from("organizations").select("id").limit(1).single()

    if (!org) {
      return buildErrorMessage("Organization not found")
    }

    // Get active polls
    const { data: polls } = await supabase
      .from("pulse_polls")
      .select("id, question")
      .eq("organization_id", org.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5)

    updateSession(phoneNumber, "select_poll", { polls: polls || [] })
    return buildPollListMenu(polls || [])
  } catch (error) {
    console.error("[v0] Failed to load polls:", error)
    return buildErrorMessage("Failed to load polls")
  }
}

async function handlePollSelection(input: string, phoneNumber: string) {
  if (input === "0") {
    updateSession(phoneNumber, "welcome")
    return buildWelcomeMenu()
  }

  const session = getSession(phoneNumber)
  if (!session || !session.data.polls) {
    return buildErrorMessage("Session expired")
  }

  const polls = session.data.polls as Array<{ id: string; question: string }>
  const pollIndex = Number.parseInt(input) - 1

  if (pollIndex >= 0 && pollIndex < polls.length) {
    const selectedPoll = polls[pollIndex]

    // Load poll details
    try {
      const supabase = await createClient()
      const { data: poll } = await supabase.from("pulse_polls").select("*").eq("id", selectedPoll.id).single()

      if (!poll) {
        return buildErrorMessage("Poll not found")
      }

      const options = (poll.options as { choices?: string[] })?.choices || []
      updateSession(phoneNumber, "respond_to_poll", { pollId: poll.id, pollOptions: options })
      return buildPollResponseMenu(poll.question, options)
    } catch (error) {
      console.error("[v0] Failed to load poll details:", error)
      return buildErrorMessage("Failed to load poll")
    }
  }

  return buildPollListMenu(polls)
}

async function handlePollResponse(input: string, phoneNumber: string) {
  if (input === "0") {
    updateSession(phoneNumber, "select_poll")
    return await loadActivePolls(phoneNumber)
  }

  const session = getSession(phoneNumber)
  if (!session || !session.data.pollId || !session.data.pollOptions) {
    return buildErrorMessage("Session expired")
  }

  const options = session.data.pollOptions as string[]
  const optionIndex = Number.parseInt(input) - 1

  if (optionIndex >= 0 && optionIndex < options.length) {
    try {
      const supabase = await createClient()

      await supabase.from("pulse_poll_responses").insert({
        poll_id: session.data.pollId as string,
        response_value: options[optionIndex],
        source: "ussd",
        phone_hash: hashPhone(phoneNumber),
      })

      clearSession(phoneNumber)
      return {
        message: "Thank you for your response!",
        continueSession: false,
      }
    } catch (error) {
      console.error("[v0] Failed to submit poll response:", error)
      return buildErrorMessage("Failed to submit response")
    }
  }

  return buildPollResponseMenu(session.data.pollQuestion as string, options)
}

function hashPhone(phone: string): string {
  // Simple hash for demo - in production use crypto
  return Buffer.from(phone).toString("base64")
}
