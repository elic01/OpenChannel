import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { FeedbackResponseForm } from "@/components/feedback-response-form"
import { FeedbackStatusUpdate } from "@/components/feedback-status-update"

export default async function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || !["pc_admin", "system_admin"].includes(profile.role)) {
    redirect("/dashboard")
  }

  // Get feedback
  const { data: feedback, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single()

  if (error || !feedback) {
    notFound()
  }

  // Get responses
  const { data: responses } = await supabase
    .from("feedback_responses")
    .select(
      `
      *,
      responder:responder_id (
        full_name,
        role
      )
    `,
    )
    .eq("feedback_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Feedback Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Feedback #{feedback.id.slice(0, 8)}</CardTitle>
                <CardDescription>
                  Submitted {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })} via{" "}
                  {feedback.source}
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
                    {feedback.sentiment_score !== null && ` (${feedback.sentiment_score.toFixed(2)})`}
                  </Badge>
                )}
                <Badge
                  variant={
                    feedback.status === "new" ? "default" : feedback.status === "under_review" ? "secondary" : "outline"
                  }
                >
                  {feedback.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{feedback.content}</p>
          </CardContent>
        </Card>

        {/* Status Update */}
        <FeedbackStatusUpdate feedbackId={feedback.id} currentStatus={feedback.status} />

        {/* Response Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Response</CardTitle>
            <CardDescription>Respond to this feedback. You can choose to make it public or private.</CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackResponseForm feedbackId={feedback.id} />
          </CardContent>
        </Card>

        {/* Previous Responses */}
        {responses && responses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Response History</CardTitle>
              <CardDescription>{responses.length} response(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {responses.map((response) => (
                <div key={response.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{response.responder?.full_name || "Unknown"}</p>
                      <Badge variant="outline" className="text-xs">
                        {response.responder?.role || "Unknown"}
                      </Badge>
                      {response.is_public && (
                        <Badge variant="secondary" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm">{response.response_text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
