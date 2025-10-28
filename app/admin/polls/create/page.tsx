import { CreatePollForm } from "@/components/create-poll-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreatePollPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">Create Pulse Poll</h2>
          <p className="text-muted-foreground">Create a quick poll to gather instant feedback from employees</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Poll Details</CardTitle>
            <CardDescription>Configure your poll question and response options</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePollForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
