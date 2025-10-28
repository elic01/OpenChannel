import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export default async function PollResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get poll
  const { data: poll, error } = await supabase.from("pulse_polls").select("*").eq("id", id).single()

  if (error || !poll) {
    notFound()
  }

  // Get responses
  const { data: responses } = await supabase.from("pulse_poll_responses").select("*").eq("poll_id", id)

  // Calculate response distribution
  const distribution: Record<string, number> = {}
  responses?.forEach((response) => {
    distribution[response.response_value] = (distribution[response.response_value] || 0) + 1
  })

  const totalResponses = responses?.length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Poll Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>{poll.question}</CardTitle>
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
            <p className="text-sm text-muted-foreground">{totalResponses} total responses</p>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Response Distribution</CardTitle>
            <CardDescription>Breakdown of all responses received</CardDescription>
          </CardHeader>
          <CardContent>
            {totalResponses > 0 ? (
              <div className="space-y-4">
                {Object.entries(distribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([value, count]) => {
                    const percentage = Math.round((count / totalResponses) * 100)
                    return (
                      <div key={value} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{value}</span>
                          <span className="text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No responses yet</p>
            )}
          </CardContent>
        </Card>

        {/* Response Details */}
        <Card>
          <CardHeader>
            <CardTitle>Response Details</CardTitle>
            <CardDescription>Source breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Web responses:</span>
                <span className="font-medium">{responses?.filter((r) => r.source === "web").length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">USSD responses:</span>
                <span className="font-medium">{responses?.filter((r) => r.source === "ussd").length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
