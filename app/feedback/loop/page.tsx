import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, TrendingUp, Users, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default async function FeedbackLoopPage() {
  const supabase = await createClient()

  // Get organization
  const { data: org } = await supabase.from("organizations").select("id, name").limit(1).single()

  if (!org) {
    return <div>Organization not found</div>
  }

  // Get public responses (feedback loop transparency)
  const { data: publicResponses } = await supabase
    .from("feedback_responses")
    .select(
      `
      id,
      response_text,
      created_at,
      feedback:feedback_id (
        category,
        sentiment,
        created_at
      )
    `,
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get recent analytics
  const { data: analytics } = await supabase
    .from("feedback_analytics")
    .select("*")
    .eq("organization_id", org.id)
    .order("period_start", { ascending: false })
    .limit(1)
    .single()

  return (
  <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
  {/* Header */}
  <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container mx-auto flex h-16 items-center justify-between px-4">
  <div className="flex items-center gap-4">
  <Link href="/dashboard">
    <Button variant="ghost" size="sm">
    <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Dashboard
      </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">Feedback Loop</h1>
            <p className="text-muted-foreground">
              See how we're acting on your feedback. Transparency is key to building trust.
            </p>
          </div>

          {/* Stats Overview */}
          {analytics && (
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total_submissions}</div>
                  <p className="text-xs text-muted-foreground">
                    Period: {new Date(analytics.period_start).toLocaleDateString()} -{" "}
                    {new Date(analytics.period_end).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {analytics.sentiment_breakdown && (
                      <>
                        <Badge variant="outline" className="text-green-600">
                          {analytics.sentiment_breakdown.positive || 0} Positive
                        </Badge>
                        <Badge variant="outline" className="text-yellow-600">
                          {analytics.sentiment_breakdown.neutral || 0} Neutral
                        </Badge>
                        <Badge variant="outline" className="text-red-600">
                          {analytics.sentiment_breakdown.negative || 0} Negative
                        </Badge>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Channels</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {analytics.source_breakdown && (
                      <>
                        <Badge variant="outline">{analytics.source_breakdown.web || 0} Web</Badge>
                        <Badge variant="outline">{analytics.source_breakdown.ussd || 0} USSD</Badge>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Public Responses */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Recent Actions & Responses</h2>
            {publicResponses && publicResponses.length > 0 ? (
              <div className="space-y-4">
                {publicResponses.map((response) => (
                  <Card key={response.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">P&C Team Response</CardTitle>
                          <CardDescription>
                            {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                          </CardDescription>
                        </div>
                        {response.feedback?.category && (
                          <Badge variant="secondary">{response.feedback.category.replace(/_/g, " ")}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{response.response_text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No public responses yet. Check back soon!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
