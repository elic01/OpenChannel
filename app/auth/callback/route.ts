import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
const { searchParams } = new URL(request.url)
const code = searchParams.get("code")
const next = searchParams.get("next")
  const type = searchParams.get("type")

console.log("[Auth Callback] Incoming request, params:", Object.fromEntries(searchParams))

// Handle invitation acceptance - check for various invitation indicators
const hasInvitationParams = type === "invite" ||
                           searchParams.has("access_token") ||
                           searchParams.has("invite_token") ||
                           searchParams.has("token")

if (hasInvitationParams) {
    console.log("[Auth Callback] Invitation detected, params:", Object.fromEntries(searchParams))
    // Redirect to a page where user can complete invitation
const inviteUrl = new URL("/auth/accept-invite", request.url)
// Pass along all search params
for (const [key, value] of searchParams) {
inviteUrl.searchParams.set(key, value)
}
return NextResponse.redirect(inviteUrl)
}

if (code) {
const supabase = await createClient()
const { error } = await supabase.auth.exchangeCodeForSession(code)

if (!error) {
// Get user and profile to determine redirect destination
const { data: { user } } = await supabase.auth.getUser()
if (user) {
const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profileError) {
    console.error("[Auth Callback] Profile fetch error:", profileError)
      // If profile doesn't exist, redirect to dashboard (will be handled by layout checks)
      return NextResponse.redirect(new URL(next || "/dashboard", request.url))
      }
        if (profile) {
          const isAdmin = profile.role === "pc_admin" || profile.role === "system_admin"
          const redirectPath = isAdmin ? "/admin" : "/dashboard"
          return NextResponse.redirect(new URL(next || redirectPath, request.url))
        }
      }
      return NextResponse.redirect(new URL(next || "/dashboard", request.url))
    }
  }

  // Return to an error page
  return NextResponse.redirect(new URL("/auth/login?error=unable-to-login", request.url))
}
