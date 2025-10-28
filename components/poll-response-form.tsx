"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send } from "lucide-react"

interface PollResponseFormProps {
  poll: {
    id: string
    question: string
    poll_type: string
    options: Record<string, unknown>
  }
}

export function PollResponseForm({ poll }: PollResponseFormProps) {
  const router = useRouter()
  const [selectedValue, setSelectedValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/polls/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId: poll.id,
          responseValue: selectedValue,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit response")
      }

      router.push("/polls/success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get options based on poll type
  let options: string[] = []
  if (poll.poll_type === "multiple_choice" || poll.poll_type === "yes_no") {
    options = (poll.options as { choices?: string[] })?.choices || []
  } else if (poll.poll_type === "rating") {
    const max = (poll.options as { max?: number })?.max || 5
    options = Array.from({ length: max }, (_, i) => `${i + 1}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
        <div className="space-y-3">
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option} className="cursor-pointer font-normal">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={!selectedValue || isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Response
          </>
        )}
      </Button>
    </form>
  )
}
