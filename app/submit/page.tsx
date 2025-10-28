import { FeedbackForm } from "@/components/feedback-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

export default function SubmitFeedbackPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight">OpenChannel</h1>
            <p className="text-lg text-muted-foreground">Your voice matters. Share feedback anonymously, anytime.</p>
          </div>

          {/* Main Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Anonymous Feedback</CardTitle>
              <CardDescription>
                Help us improve by sharing your thoughts, concerns, or suggestions. Your feedback is completely
                anonymous and will be reviewed by our People & Culture team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackForm />
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Are you a P&C admin?{" "}
              <Link href="/auth/login" className="text-primary underline underline-offset-4 hover:text-primary/80">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
