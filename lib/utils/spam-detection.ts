/**
 * Advanced spam detection utilities
 */

export interface SpamCheckResult {
  isSpam: boolean
  confidence: number
  reasons: string[]
}

export function checkForSpam(content: string): SpamCheckResult {
  const reasons: string[] = []
  let spamScore = 0

  // 1. Repeated characters (e.g., "aaaaaaaaaa")
  if (/(.)\1{10,}/.test(content)) {
    reasons.push("Excessive repeated characters")
    spamScore += 0.4
  }

  // 2. Multiple URLs
  const urlMatches = content.match(/https?:\/\//gi)
  if (urlMatches && urlMatches.length > 2) {
    reasons.push("Multiple URLs detected")
    spamScore += 0.3
  }

  // 3. Common spam keywords
  const spamKeywords = /\b(viagra|cialis|casino|lottery|prize|winner|claim|click here|buy now)\b/gi
  const keywordMatches = content.match(spamKeywords)
  if (keywordMatches && keywordMatches.length > 0) {
    reasons.push("Spam keywords detected")
    spamScore += 0.5
  }

  // 4. Excessive capitalization
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.7 && content.length > 20) {
    reasons.push("Excessive capitalization")
    spamScore += 0.3
  }

  // 5. Too short or too generic
  if (content.trim().length < 10) {
    reasons.push("Content too short")
    spamScore += 0.2
  }

  // 6. Excessive special characters
  const specialCharRatio = (content.match(/[^a-zA-Z0-9\s]/g) || []).length / content.length
  if (specialCharRatio > 0.4) {
    reasons.push("Excessive special characters")
    spamScore += 0.3
  }

  return {
    isSpam: spamScore >= 0.5,
    confidence: Math.min(spamScore, 1),
    reasons,
  }
}
