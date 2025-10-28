import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function FeedbackSuccessPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>Your feedback has been submitted successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Your anonymous feedback has been received and will be reviewed by our People & Culture team. We appreciate
              you taking the time to help us improve.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">Submit More Feedback</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/feedback/loop">View Feedback Loop</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
