"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, MessageSquare, Users, RefreshCw } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  // Load user and profile
  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profile)
      }
      setLoading(false)
    }

    loadUserData()
  }, [])

  // Load analytics
  const loadAnalytics = async () => {
    if (!profile) return

    const supabase = createClient()

    const { data: analytics } = await supabase
      .from("feedback_analytics")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .order("period_start", { ascending: false })
      .limit(1)
      .single()

    setAnalytics(analytics || null)
  }

  useEffect(() => {
    if (profile) {
      loadAnalytics()
    }
  }, [profile])

  // Generate analytics
  const handleGenerateAnalytics = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/analytics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        await loadAnalytics() // Reload analytics after generation
      }
    } catch (error) {
      console.error("Failed to generate analytics:", error)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Access denied</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Insights and trends from employee feedback</p>
        </div>
        <Button onClick={handleGenerateAnalytics} disabled={generating}>
          {generating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Analytics
            </>
          )}
        </Button>
      </div>

      {analytics ? (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_submissions}</div>
                <p className="text-xs text-muted-foreground">
                  {new Date(analytics.period_start).toLocaleDateString()} -{" "}
                  {new Date(analytics.period_end).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.sentiment_breakdown?.positive || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.total_submissions > 0
                    ? Math.round(((analytics.sentiment_breakdown?.positive || 0) / analytics.total_submissions) * 100)
                    : 0}
                  % of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Negative Sentiment</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{analytics.sentiment_breakdown?.negative || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.total_submissions > 0
                    ? Math.round(((analytics.sentiment_breakdown?.negative || 0) / analytics.total_submissions) * 100)
                    : 0}
                  % of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Channels</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Web:</span>
                    <span className="font-medium">{analytics.source_breakdown?.web || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">USSD:</span>
                    <span className="font-medium">{analytics.source_breakdown?.ussd || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback by Category</CardTitle>
              <CardDescription>Distribution of feedback across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.category_breakdown &&
                  Object.entries(analytics.category_breakdown)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([category, count]) => {
                      const percentage = Math.round(((count as number) / analytics.total_submissions) * 100)
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{category.replace(/_/g, " ")}</span>
                            <span className="text-muted-foreground">
                              {count as number} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No analytics data available yet</p>
            <p className="text-sm">Analytics will be generated once feedback is submitted</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
