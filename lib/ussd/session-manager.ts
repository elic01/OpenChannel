/**
 * USSD Session Manager
 * Manages temporary session state for USSD interactions
 */

interface USSDSession {
  phoneNumber: string
  step: string
  data: Record<string, unknown>
  lastActivity: Date
}

// In-memory session store (in production, use Redis or similar)
const sessions = new Map<string, USSDSession>()

// Session timeout: 5 minutes
const SESSION_TIMEOUT = 5 * 60 * 1000

export function getSession(phoneNumber: string): USSDSession | null {
  const session = sessions.get(phoneNumber)

  if (!session) return null

  // Check if session has expired
  if (Date.now() - session.lastActivity.getTime() > SESSION_TIMEOUT) {
    sessions.delete(phoneNumber)
    return null
  }

  return session
}

export function createSession(phoneNumber: string): USSDSession {
  const session: USSDSession = {
    phoneNumber,
    step: "welcome",
    data: {},
    lastActivity: new Date(),
  }

  sessions.set(phoneNumber, session)
  return session
}

export function updateSession(phoneNumber: string, step: string, data?: Record<string, unknown>): USSDSession {
  const session = getSession(phoneNumber) || createSession(phoneNumber)

  session.step = step
  session.lastActivity = new Date()

  if (data) {
    session.data = { ...session.data, ...data }
  }

  sessions.set(phoneNumber, session)
  return session
}

export function clearSession(phoneNumber: string): void {
  sessions.delete(phoneNumber)
}

// Cleanup expired sessions periodically
setInterval(() => {
  const now = Date.now()
  for (const [phoneNumber, session] of sessions.entries()) {
    if (now - session.lastActivity.getTime() > SESSION_TIMEOUT) {
      sessions.delete(phoneNumber)
    }
  }
}, 60000) // Run every minute
