"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, X } from "lucide-react"

export function CreatePollForm() {
  const router = useRouter()
  const [question, setQuestion] = useState("")
  const [pollType, setPollType] = useState<"rating" | "multiple_choice" | "yes_no">("multiple_choice")
  const [options, setOptions] = useState<string[]>(["", ""])
  const [durationDays, setDurationDays] = useState("7")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation
    if (question.trim().length < 10) {
      setError("Question must be at least 10 characters")
      setIsSubmitting(false)
      return
    }

    if (pollType === "multiple_choice") {
      const validOptions = options.filter((opt) => opt.trim().length > 0)
      if (validOptions.length < 2) {
        setError("Please provide at least 2 options")
        setIsSubmitting(false)
        return
      }
    }

    try {
      const response = await fetch("/api/polls/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          pollType,
          options: pollType === "multiple_choice" ? options.filter((opt) => opt.trim().length > 0) : [],
          durationDays: Number.parseInt(durationDays),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create poll")
      }

      router.push("/admin/polls")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Poll Question *</Label>
        <Textarea
          id="question"
          placeholder="e.g., How satisfied are you with our remote work policy?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Poll Type *</Label>
        <Select value={pollType} onValueChange={(value: "rating" | "multiple_choice" | "yes_no") => setPollType(value)}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="rating">Rating (1-5)</SelectItem>
            <SelectItem value="yes_no">Yes/No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pollType === "multiple_choice" && (
        <div className="space-y-2">
          <Label>Options *</Label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
                {options.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (days) *</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          max="90"
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">How long should this poll remain active?</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Poll"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
