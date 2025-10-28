/**
 * USSD Menu Builder
 * Constructs USSD menu responses
 */

export interface USSDResponse {
  message: string
  continueSession: boolean
}

export function buildWelcomeMenu(): USSDResponse {
  return {
    message: `Welcome to OpenChannel
    
1. Submit Feedback
2. Respond to Poll
3. View Recent Updates
0. Exit`,
    continueSession: true,
  }
}

export function buildCategoryMenu(): USSDResponse {
  return {
    message: `Select feedback category:

1. Workplace Culture
2. Management
3. Compensation
4. Work-Life Balance
5. Career Development
6. Communication
7. Facilities
8. Diversity & Inclusion
9. Other
0. Back`,
    continueSession: true,
  }
}

export function buildFeedbackPrompt(): USSDResponse {
  return {
    message: `Please type your feedback.

Keep it brief and clear.

0. Cancel`,
    continueSession: true,
  }
}

export function buildConfirmationMenu(category: string, feedback: string): USSDResponse {
  const categoryName = getCategoryName(category)
  const preview = feedback.length > 50 ? feedback.substring(0, 50) + "..." : feedback

  return {
    message: `Confirm submission:

Category: ${categoryName}
Feedback: ${preview}

1. Submit
2. Edit
0. Cancel`,
    continueSession: true,
  }
}

export function buildSuccessMessage(): USSDResponse {
  return {
    message: `Thank you! Your feedback has been submitted anonymously.

Your voice matters.`,
    continueSession: false,
  }
}

export function buildErrorMessage(error: string): USSDResponse {
  return {
    message: `Error: ${error}

Please try again later.`,
    continueSession: false,
  }
}

export function buildPollListMenu(polls: Array<{ id: string; question: string }>): USSDResponse {
  if (polls.length === 0) {
    return {
      message: `No active polls available.

0. Back to main menu`,
      continueSession: true,
    }
  }

  let message = "Active Polls:\n\n"
  polls.forEach((poll, index) => {
    const preview = poll.question.length > 40 ? poll.question.substring(0, 40) + "..." : poll.question
    message += `${index + 1}. ${preview}\n`
  })
  message += "\n0. Back"

  return {
    message,
    continueSession: true,
  }
}

export function buildPollResponseMenu(question: string, options: string[]): USSDResponse {
  let message = `${question}\n\n`

  options.forEach((option, index) => {
    message += `${index + 1}. ${option}\n`
  })
  message += "\n0. Back"

  return {
    message,
    continueSession: true,
  }
}

function getCategoryName(categoryCode: string): string {
  const categories: Record<string, string> = {
    "1": "Workplace Culture",
    "2": "Management",
    "3": "Compensation",
    "4": "Work-Life Balance",
    "5": "Career Development",
    "6": "Communication",
    "7": "Facilities",
    "8": "Diversity & Inclusion",
    "9": "Other",
  }

  return categories[categoryCode] || "Other"
}

export function getCategoryValue(categoryCode: string): string {
  const categories: Record<string, string> = {
    "1": "workplace_culture",
    "2": "management",
    "3": "compensation",
    "4": "work_life_balance",
    "5": "career_development",
    "6": "communication",
    "7": "facilities",
    "8": "diversity_inclusion",
    "9": "other",
  }

  return categories[categoryCode] || "other"
}
