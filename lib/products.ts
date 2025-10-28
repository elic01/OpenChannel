// Subscription Plans for OpenChannel
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  priceMonthly: number
  priceAnnual: number
  priceInCentsMonthly: number
  priceInCentsAnnual: number
  features: string[]
  maxEmployees: number | null
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small teams getting started with anonymous feedback",
    priceMonthly: 49,
    priceAnnual: 470,
    priceInCentsMonthly: 4900,
    priceInCentsAnnual: 47000,
    maxEmployees: 50,
    features: [
      "Up to 50 employees",
      "Unlimited anonymous feedback",
      "AI sentiment analysis",
      "Basic analytics dashboard",
      "Web & USSD channels",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing organizations that need advanced features",
    priceMonthly: 149,
    priceAnnual: 1430,
    priceInCentsMonthly: 14900,
    priceInCentsAnnual: 143000,
    maxEmployees: 250,
    popular: true,
    features: [
      "Up to 250 employees",
      "Everything in Starter",
      "Advanced analytics & trends",
      "Pulse polls & surveys",
      "Custom categories",
      "Priority support",
      "Data export",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    priceMonthly: 399,
    priceAnnual: 3830,
    priceInCentsMonthly: 39900,
    priceInCentsAnnual: 383000,
    maxEmployees: null,
    features: [
      "Unlimited employees",
      "Everything in Professional",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom branding",
      "Advanced security features",
      "API access",
    ],
  },
]
