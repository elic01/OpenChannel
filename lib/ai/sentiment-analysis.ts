import { generateObject } from "ai"
import { z } from "zod"

const sentimentSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  score: z.number().min(-1).max(1).describe("Sentiment score from -1 (very negative) to 1 (very positive)"),
  reasoning: z.string().describe("Brief explanation of the sentiment classification"),
  suggestedCategory: z
    .enum([
      "workplace_culture",
      "management",
      "compensation",
      "work_life_balance",
      "career_development",
      "communication",
      "facilities",
      "diversity_inclusion",
      "other",
    ])
    .optional()
    .describe("Suggested category if not already provided"),
})

export type SentimentAnalysis = z.infer<typeof sentimentSchema>

export async function analyzeSentiment(feedbackContent: string): Promise<SentimentAnalysis> {
  try {
    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: sentimentSchema,
      prompt: `Analyze the sentiment of this employee feedback. Consider the emotional tone, concerns raised, and overall message.

Feedback: "${feedbackContent}"

Provide:
1. Overall sentiment (positive, neutral, or negative)
2. A sentiment score from -1 (very negative) to 1 (very positive)
3. Brief reasoning for your classification
4. Suggested category if the feedback clearly fits one of the workplace categories`,
    })

    return object
  } catch (error) {
    console.error("[v0] Sentiment analysis error:", error)
    // Fallback to neutral if AI fails
    return {
      sentiment: "neutral",
      score: 0,
      reasoning: "Unable to analyze sentiment",
      suggestedCategory: undefined,
    }
  }
}

export async function categorizeFeedback(feedbackContent: string): Promise<string> {
  try {
    const categorySchema = z.object({
      category: z.enum([
        "workplace_culture",
        "management",
        "compensation",
        "work_life_balance",
        "career_development",
        "communication",
        "facilities",
        "diversity_inclusion",
        "other",
      ]),
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
    })

    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: categorySchema,
      prompt: `Categorize this employee feedback into one of the following categories:
- workplace_culture: Team dynamics, company values, work environment
- management: Leadership, supervision, decision-making
- compensation: Salary, bonuses, benefits, perks
- work_life_balance: Hours, flexibility, remote work, time off
- career_development: Growth opportunities, training, promotions
- communication: Internal communications, transparency, feedback loops
- facilities: Office space, equipment, tools, resources
- diversity_inclusion: DEI initiatives, representation, belonging
- other: Anything that doesn't fit the above

Feedback: "${feedbackContent}"

Choose the most appropriate category.`,
    })

    return object.category
  } catch (error) {
    console.error("[v0] Categorization error:", error)
    return "other"
  }
}
