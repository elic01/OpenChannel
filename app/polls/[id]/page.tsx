import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PollResponseForm } from "@/components/poll-response-form"
import { formatDistanceToNow } from "date-fns"

export default async function PollResponsePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get poll
  const { data: poll, error } = await supabase
    .from("pulse_polls")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error || !poll) {
    notFound()
  }

  // Check if poll has ended
  const hasEnded = new Date(poll.ends_at) < new Date()

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{poll.question}</CardTitle>
            <CardDescription>
              {hasEnded
                ? "This poll has ended"
                : `Ends ${formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasEnded ? (
              <p className="text-center text-sm text-muted-foreground">
                Thank you for your interest. This poll is no longer accepting responses.
              </p>
            ) : (
              <PollResponseForm poll={poll} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
