import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, TrendingUp, BarChart3, LogOut } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { signOut } from "@/lib/actions/auth"
import Link from "next/link"

export default async function DashboardPage() {
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

  // Get organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single()

  // Get recent analytics
  const { data: analytics } = await supabase
    .from("feedback_analytics")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("period_start", { ascending: false })
    .limit(1)
    .single()

  // Get public responses
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

  // Get active polls
  const { data: activePolls } = await supabase
    .from("pulse_polls")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">OpenChannel</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">{organization?.name}</p>
            </div>
            <form action={signOut}>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">Employee Dashboard</h2>
          <p className="text-muted-foreground">View feedback trends and see how we're responding to your voice</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="responses">P&C Responses</TabsTrigger>
            <TabsTrigger value="polls">Active Polls</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            {analytics && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.total_submissions}</div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(analytics.period_start).toLocaleDateString()} -{" "}
                      {new Date(analytics.period_end).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sentiment Overview</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analytics.sentiment_breakdown && (
                        <>
                          <Badge variant="outline" className="border-green-600 text-green-600">
                            {analytics.sentiment_breakdown.positive || 0} Positive
                          </Badge>
                          <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                            {analytics.sentiment_breakdown.neutral || 0} Neutral
                          </Badge>
                          <Badge variant="outline" className="border-red-600 text-red-600">
                            {analytics.sentiment_breakdown.negative || 0} Negative
                          </Badge>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {analytics.category_breakdown &&
                        Object.entries(analytics.category_breakdown)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 3)
                          .map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{category.replace(/_/g, " ")}</span>
                              <span className="font-medium">{count as number}</span>
                            </div>
                          ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Share your thoughts or participate in polls</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button asChild>
                <Link href="/submit">Submit Feedback</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/submissions">My Submissions</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/feedback/loop">View Feedback Loop</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Recent P&C Team Responses</h3>
              <p className="text-sm text-muted-foreground">
                See how the People & Culture team is addressing feedback from the organization
              </p>
            </div>

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
                        <div className="flex gap-2">
                          {response.feedback?.category && (
                            <Badge variant="secondary">{response.feedback.category.replace(/_/g, " ")}</Badge>
                          )}
                          {response.feedback?.sentiment && (
                            <Badge
                              variant="outline"
                              className={
                                response.feedback.sentiment === "positive"
                                  ? "border-green-600 text-green-600"
                                  : response.feedback.sentiment === "negative"
                                    ? "border-red-600 text-red-600"
                                    : "border-yellow-600 text-yellow-600"
                              }
                            >
                              {response.feedback.sentiment}
                            </Badge>
                          )}
                        </div>
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
          </TabsContent>

          <TabsContent value="polls" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Active Pulse Polls</h3>
              <p className="text-sm text-muted-foreground">Share your quick feedback on current topics</p>
            </div>

            {activePolls && activePolls.length > 0 ? (
              <div className="space-y-4">
                {activePolls.map((poll) => (
                  <Card key={poll.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{poll.question}</CardTitle>
                      <CardDescription>
                        Ends {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild>
                        <Link href={`/polls/${poll.id}`}>Respond to Poll</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No active polls at the moment</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
