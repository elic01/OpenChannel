"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send } from "lucide-react"

const FEEDBACK_CATEGORIES = [
  { value: "workplace_culture", label: "Workplace Culture" },
  { value: "management", label: "Management & Leadership" },
  { value: "compensation", label: "Compensation & Benefits" },
  { value: "work_life_balance", label: "Work-Life Balance" },
  { value: "career_development", label: "Career Development" },
  { value: "communication", label: "Communication" },
  { value: "facilities", label: "Facilities & Resources" },
  { value: "diversity_inclusion", label: "Diversity & Inclusion" },
  { value: "other", label: "Other" },
]

export function FeedbackForm() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          category: category || null,
          source: "web",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback")
      }

      // Redirect to success page
      router.push("/feedback/success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = content.trim().length >= 10
  const charCount = content.length

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category">Category (Optional)</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {FEEDBACK_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Help us route your feedback to the right team</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Your Feedback *</Label>
          <span className="text-xs text-muted-foreground">{charCount} characters</span>
        </div>
        <Textarea
          id="content"
          placeholder="Share your thoughts, concerns, or suggestions here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          required
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">Minimum 10 characters. Your submission is completely anonymous.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={!isValid || isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Feedback
          </>
        )}
      </Button>
    </form>
  )
}
