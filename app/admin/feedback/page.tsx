import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, AlertCircle, CheckCircle2, Archive } from "lucide-react"
import Link from "next/link"

export default async function AdminFeedbackPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) return null

  // Get feedback counts by status
  const { data: newFeedback } = await supabase
    .from("pc_admin_feedback_view")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const { data: underReview } = await supabase
    .from("pc_admin_feedback_view")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .eq("status", "under_review")
    .order("created_at", { ascending: false })

  const { data: addressed } = await supabase
    .from("pc_admin_feedback_view")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .eq("status", "addressed")
    .order("created_at", { ascending: false })
    .limit(20)

  const { data: spamFeedback } = await supabase
    .from("pc_admin_feedback_view")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .eq("status", "spam")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold tracking-tight">Feedback Management</h2>
        <p className="text-muted-foreground">Review, respond to, and manage employee feedback</p>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newFeedback?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underReview?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Addressed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addressed?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spam</CardTitle>
            <Archive className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spamFeedback?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">New ({newFeedback?.length || 0})</TabsTrigger>
          <TabsTrigger value="review">Under Review ({underReview?.length || 0})</TabsTrigger>
          <TabsTrigger value="addressed">Addressed</TabsTrigger>
          <TabsTrigger value="spam">Spam</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          {newFeedback && newFeedback.length > 0 ? (
            newFeedback.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        Feedback #{feedback.id.slice(0, 8)}
                        <Badge variant="secondary" className="ml-2">
                          {feedback.source}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {feedback.category && <Badge variant="outline">{feedback.category.replace(/_/g, " ")}</Badge>}
                      {feedback.sentiment && (
                        <Badge
                          variant="outline"
                          className={
                            feedback.sentiment === "positive"
                              ? "border-green-600 text-green-600"
                              : feedback.sentiment === "negative"
                                ? "border-red-600 text-red-600"
                                : "border-yellow-600 text-yellow-600"
                          }
                        >
                          {feedback.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{feedback.content}</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/admin/feedback/${feedback.id}`}>Review & Respond</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No new feedback to review</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          {underReview && underReview.length > 0 ? (
            underReview.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        Feedback #{feedback.id.slice(0, 8)}
                        <Badge variant="secondary" className="ml-2">
                          {feedback.source}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {feedback.category && <Badge variant="outline">{feedback.category.replace(/_/g, " ")}</Badge>}
                      {feedback.sentiment && (
                        <Badge
                          variant="outline"
                          className={
                            feedback.sentiment === "positive"
                              ? "border-green-600 text-green-600"
                              : feedback.sentiment === "negative"
                                ? "border-red-600 text-red-600"
                                : "border-yellow-600 text-yellow-600"
                          }
                        >
                          {feedback.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{feedback.content}</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/admin/feedback/${feedback.id}`}>Continue Review</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No feedback under review</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="addressed" className="space-y-4">
          {addressed && addressed.length > 0 ? (
            addressed.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        Feedback #{feedback.id.slice(0, 8)}
                        <Badge variant="secondary" className="ml-2">
                          {feedback.source}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {feedback.category && <Badge variant="outline">{feedback.category.replace(/_/g, " ")}</Badge>}
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        Addressed
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{feedback.content}</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/feedback/${feedback.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No addressed feedback</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="spam" className="space-y-4">
          {spamFeedback && spamFeedback.length > 0 ? (
            spamFeedback.map((feedback) => (
              <Card key={feedback.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        Feedback #{feedback.id.slice(0, 8)}
                        <Badge variant="destructive" className="ml-2">
                          Spam
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{feedback.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No spam detected</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
