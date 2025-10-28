"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send } from "lucide-react"

interface FeedbackResponseFormProps {
  feedbackId: string
}

export function FeedbackResponseForm({ feedbackId }: FeedbackResponseFormProps) {
  const router = useRouter()
  const [responseText, setResponseText] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/feedback/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackId,
          responseText,
          isPublic,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit response")
      }

      setSuccess(true)
      setResponseText("")
      setIsPublic(false)

      // Refresh the page to show new response
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="response">Your Response</Label>
        <Textarea
          id="response"
          placeholder="Write your response to this feedback..."
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          rows={6}
          required
          className="resize-none"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="public" checked={isPublic} onCheckedChange={(checked) => setIsPublic(checked === true)} />
        <Label htmlFor="public" className="text-sm font-normal">
          Make this response public (visible in the feedback loop)
        </Label>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>Response submitted successfully!</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={!responseText.trim() || isSubmitting}>
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
