import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Calendar, Users, TrendingUp, CheckCircle2 } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/products"
import { formatDistanceToNow } from "date-fns"

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "system_admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Access denied. System admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get organization with billing info
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single()

  if (!organization) return null

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === organization.subscription_plan)
  const isTrialing = organization.subscription_status === "trialing"
  const isActive = organization.subscription_status === "active"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold tracking-tight">Billing & Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPlan?.name || "Unknown"}</div>
            <p className="text-xs text-muted-foreground">
              {isTrialing ? "Trial" : isActive ? "Active" : organization.subscription_status}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.employee_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {currentPlan?.maxEmployees ? `of ${currentPlan.maxEmployees} max` : "Unlimited"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isTrialing ? "Trial Ends" : "Next Billing"}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.trial_ends_at
                ? formatDistanceToNow(new Date(organization.trial_ends_at), { addSuffix: true })
                : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trial Banner */}
      {isTrialing && (
        <Card className="mb-6 border-primary">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">You're on a free trial</p>
              <p className="text-sm text-muted-foreground">
                Your trial ends{" "}
                {organization.trial_ends_at &&
                  formatDistanceToNow(new Date(organization.trial_ends_at), { addSuffix: true })}
                . Upgrade to continue using OpenChannel.
              </p>
            </div>
            <Button>Upgrade Now</Button>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={
                  plan.id === organization.subscription_plan
                    ? "border-primary shadow-md"
                    : plan.popular
                      ? "border-primary/50"
                      : ""
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.id === organization.subscription_plan && <Badge variant="default">Current</Badge>}
                    {plan.popular && plan.id !== organization.subscription_plan && (
                      <Badge variant="secondary">Popular</Badge>
                    )}
                  </div>
                  <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">${plan.priceMonthly}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      or ${plan.priceAnnual}/year (save ${plan.priceMonthly * 12 - plan.priceAnnual})
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.id === organization.subscription_plan ? (
                    <Button className="w-full bg-transparent" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.id === "starter" && organization.subscription_plan !== "starter" ? "Downgrade" : "Upgrade"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No billing history yet</p>
            <p className="text-sm">Your invoices will appear here once you subscribe</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
