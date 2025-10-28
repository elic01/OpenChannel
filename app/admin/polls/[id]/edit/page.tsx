import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { EditPollForm } from "@/components/edit-poll-form"

export default async function EditPollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role, organization_id").eq("id", user.id).single()

  if (!profile || !["pc_admin", "system_admin"].includes(profile.role)) {
    redirect("/dashboard")
  }

  // Get poll
  const { data: poll, error } = await supabase
    .from("pulse_polls")
    .select("*")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single()

  if (error || !poll) {
    notFound()
  }

  // Get response count
  const { count: responseCount } = await supabase
    .from("pulse_poll_responses")
    .select("*", { count: "exact", head: true })
    .eq("poll_id", id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight">Manage Poll</h2>
          <p className="text-muted-foreground">Update poll settings and status</p>
        </div>

        {/* Poll Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">{poll.question}</CardTitle>
                <CardDescription>
                  Created {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })} • Ends{" "}
                  {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={poll.is_active ? "default" : "secondary"}>
                  {poll.is_active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">{poll.poll_type}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{responseCount || 0} responses received</p>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Poll Settings</CardTitle>
            <CardDescription>Manage poll status and duration</CardDescription>
          </CardHeader>
          <CardContent>
            <EditPollForm poll={poll} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
