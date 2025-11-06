"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Log all parameters for debugging
    console.log("[Accept Invite] Page loaded with params:", Object.fromEntries(searchParams))

    const type = searchParams.get("type")

    if (type !== "invite") {
      setError("Invalid invitation link. Please check your email for a valid invitation.")
      return
    }

    // For invitations, the user should already be authenticated via the invitation link
    // Let's check if they're already authenticated
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      console.log("[Accept Invite] Current user:", user?.email)

      if (!user) {
        // If not authenticated, try to set session from URL params
        const accessToken = searchParams.get("access_token")
        const refreshToken = searchParams.get("refresh_token")

        if (accessToken && refreshToken) {
          console.log("[Accept Invite] Setting session from URL params")
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error("[Accept Invite] Session set error:", error)
            setError("Failed to authenticate invitation. Please try again.")
          } else {
            console.log("[Accept Invite] Session set successfully")
          }
        } else {
          console.log("[Accept Invite] No tokens in URL, checking for other auth methods")
          // Maybe the invitation uses a different method
        }
      }
    }

    checkAuth()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[Accept Invite] Form submitted")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Check if user is authenticated first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log("[Accept Invite] Current user before password update:", user?.email, userError)

      if (userError || !user) {
        throw new Error("You must be authenticated to set a password. Please use the invitation link from your email.")
      }

      // Update the user's password to complete the invitation
      console.log("[Accept Invite] Updating password for user:", user.email)
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (updateError) {
        console.error("[Accept Invite] Password update error:", updateError)
        throw updateError
      }

      if (!data.user) {
        throw new Error("Failed to update user password")
      }

      console.log("[Accept Invite] Password updated successfully")
      setSuccess(true)

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)

    } catch (error: unknown) {
      console.error("[Accept Invite] Error:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An error occurred while setting up your account")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-900">Account Setup Complete!</CardTitle>
            <CardDescription className="text-green-700">
              Your password has been set successfully. You will be redirected to your dashboard shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                If you're not redirected automatically, click the button below.
              </p>
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Account Setup</CardTitle>
          <CardDescription>
            Set a password for your OpenChannel account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up account...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/auth/login" className="text-primary underline underline-offset-4">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
