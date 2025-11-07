import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function MySubmissionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Note: We don't query for submissions since the system is designed for anonymous feedback

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">My Submissions</h2>
          <p className="text-muted-foreground">View your feedback history and see how the P&C team has responded</p>
        </div>

        {/* Stats - Show organization-wide stats instead of personal submissions */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Organization Feedback</CardTitle>
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
        <div className="text-2xl font-bold">Anonymous</div>
          <p className="text-xs text-muted-foreground">All submissions are anonymous</p>
          </CardContent>
          </Card>

        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Privacy Protected</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
        <div className="text-2xl font-bold">100%</div>
        <p className="text-xs text-muted-foreground">Encourages honest feedback</p>
        </CardContent>
        </Card>

        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">View Trends</CardTitle>
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
        <div className="text-2xl font-bold">Dashboard</div>
        <p className="text-xs text-muted-foreground">See overall feedback trends</p>
        </CardContent>
        </Card>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
        {/* Since submissions are anonymous, show explanation */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="py-6">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-blue-600 dark:text-blue-400" />
                <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">Anonymous Feedback System</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
                  Our feedback system is designed to be completely anonymous to encourage honest and open communication.
                  This means you cannot view your own submissions to maintain privacy and encourage candid feedback.
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  You can track the overall feedback trends and responses on your main dashboard.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <Card>
          <CardContent className="py-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Ready to Share Feedback?</h3>
          <p className="mb-4 text-sm text-muted-foreground">
          Your anonymous feedback helps us improve the workplace for everyone.
          </p>
          <Link href="/submit">
          <Button>Submit Feedback</Button>
          </Link>
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
