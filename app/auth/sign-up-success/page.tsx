import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>We've sent you a confirmation email to verify your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Next Steps:</p>
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Check your email inbox</li>
                  <li>Click the confirmation link</li>
                  <li>Sign in to your account</li>
                </ol>
              </div>
            </div>
          </div>

          <Link href="/auth/login" className="block">
            <Button className="w-full">Go to Sign In</Button>
          </Link>

          <p className="text-center text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
