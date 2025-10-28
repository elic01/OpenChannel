import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
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

  // Get user's feedback submissions (only non-anonymous ones)
  const { data: submissions } = await supabase
    .from("feedback")
    .select(
      `
      *,
      feedback_responses (
        id,
        response_text,
        is_public,
        created_at
      )
    `,
    )
    .eq("submitter_id", user.id)
    .order("created_at", { ascending: false })

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />
    }
  }

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return "border-green-600 text-green-600"
      case "negative":
        return "border-red-600 text-red-600"
      default:
        return "border-yellow-600 text-yellow-600"
    }
  }

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

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Responses Received</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions?.filter((s) => s.feedback_responses && s.feedback_responses.length > 0).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Addressed</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions?.filter((s) => s.status === "addressed").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions && submissions.length > 0 ? (
            submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        Submitted {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="secondary">{submission.source}</Badge>
                        {submission.category && (
                          <Badge variant="outline">{submission.category.replace(/_/g, " ")}</Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.sentiment && (
                        <Badge variant="outline" className={getSentimentColor(submission.sentiment)}>
                          {getSentimentIcon(submission.sentiment)}
                          {submission.sentiment}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          submission.status === "addressed"
                            ? "default"
                            : submission.status === "under_review"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {submission.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Your Feedback:</p>
                    <p className="mt-1 text-sm">{submission.content}</p>
                  </div>

                  {submission.feedback_responses && submission.feedback_responses.length > 0 && (
                    <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                      <p className="text-sm font-medium">P&C Team Response:</p>
                      {submission.feedback_responses.map((response: any) => (
                        <div key={response.id} className="space-y-1">
                          <p className="text-sm">{response.response_text}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                            {response.is_public && " • Public"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No Submissions Yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  You haven't submitted any identified feedback yet. Anonymous submissions won't appear here.
                </p>
                <Link href="/">
                  <Button>Submit Feedback</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
