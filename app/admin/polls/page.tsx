import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, BarChart3 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default async function AdminPollsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) return null

  // Get all polls
  const { data: polls } = await supabase
    .from("pulse_polls")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })

  // Get response counts for each poll
  const pollsWithCounts = await Promise.all(
    (polls || []).map(async (poll) => {
      const { count } = await supabase
        .from("pulse_poll_responses")
        .select("*", { count: "exact", head: true })
        .eq("poll_id", poll.id)

      return { ...poll, responseCount: count || 0 }
    }),
  )

  const activePolls = pollsWithCounts.filter((p) => p.is_active)
  const inactivePolls = pollsWithCounts.filter((p) => !p.is_active)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight">Pulse Polls</h2>
          <p className="text-muted-foreground">Create and manage quick feedback polls</p>
        </div>
        <Button asChild>
          <Link href="/admin/polls/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Poll
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePolls.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pollsWithCounts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pollsWithCounts.reduce((sum, p) => sum + p.responseCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Polls */}
      <div className="mb-8 space-y-4">
        <h3 className="text-xl font-semibold">Active Polls</h3>
        {activePolls.length > 0 ? (
          <div className="space-y-4">
            {activePolls.map((poll) => (
              <Card key={poll.id}>
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
                      <Badge variant="default">Active</Badge>
                      <Badge variant="outline">{poll.poll_type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{poll.responseCount} responses</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/polls/${poll.id}`}>View Results</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/admin/polls/${poll.id}/edit`}>Manage</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No active polls. Create one to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Inactive Polls */}
      {inactivePolls.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Inactive Polls</h3>
          <div className="space-y-4">
            {inactivePolls.map((poll) => (
              <Card key={poll.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{poll.question}</CardTitle>
                      <CardDescription>
                        Created {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Inactive</Badge>
                      <Badge variant="outline">{poll.poll_type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{poll.responseCount} responses</p>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/polls/${poll.id}`}>View Results</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
