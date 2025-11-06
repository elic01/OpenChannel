"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, CheckCircle2, Copy } from "lucide-react"
import { createUser } from "@/lib/actions/users"
import { createClient } from "@/lib/supabase/client"

export default function InviteUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Array<{id: string, name: string}>>([])

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    role: "employee" as "pc_admin" | "employee",
    department: "",
    organizationId: "",
  })

  // Load organizations on component mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const supabase = createClient()
        const { data: orgs, error } = await supabase
          .from("organizations")
          .select("id, name")
          .order("name")

        if (error) {
          console.error("Error loading organizations:", error)
          setError("Failed to load organizations")
        } else if (orgs) {
          console.log("Loaded organizations:", orgs)
          setOrganizations(orgs)
        }
      } catch (err) {
        console.error("Failed to load organizations:", err)
        setError("Failed to load organizations")
      }
    }

    loadOrganizations()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Basic validation
    if (!formData.organizationId) {
      setError("Please select an organization")
      setIsLoading(false)
      return
    }

    try {
      const result = await createUser(formData)
      setSuccess(true)
      setTempPassword(result.tempPassword)
      setUserEmail(formData.email)
      setFormData({ email: "", fullName: "", role: "employee", department: "", organizationId: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (success && tempPassword && userEmail) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 flex items-center gap-2">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <CardTitle className="text-green-900">User Created Successfully</CardTitle>
                <CardDescription className="text-green-700">
                Share these credentials with the new employee
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-green-300 bg-white">
            <AlertDescription>
              <p className="mb-4 font-medium text-sm">Share the following login credentials with {userEmail}:</p>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-600">Email</Label>
                  <div className="flex gap-2 mt-1">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                      {userEmail}
                    </code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(userEmail)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Temporary Password</Label>
                  <div className="flex gap-2 mt-1">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                      {tempPassword}
                    </code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(tempPassword)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Login URL</Label>
                  <div className="flex gap-2 mt-1">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                      {typeof window !== "undefined" ? `${window.location.origin}/auth/login` : ""}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(typeof window !== "undefined" ? `${window.location.origin}/auth/login` : "")
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-600">The employee should change their password on first login.</p>
            </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/admin/users">Back to Users</Link>
              </Button>
              <Button
                  variant="outline"
                  onClick={() => {
                    setSuccess(false)
                    setTempPassword(null)
                    setUserEmail(null)
                }}
              >
                Invite Another User
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>Add a new People & Culture officer or employee with login credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jane Smith"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as "pc_admin" | "employee" })}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="pc_admin">People & Culture Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization *</Label>
            <Select
                value={formData.organizationId}
                onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
              disabled={organizations.length === 0}
              >
                <SelectTrigger id="organization">
                  <SelectValue placeholder={organizations.length === 0 ? "Loading organizations..." : "Select organization"} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {organizations.length === 0 && (
                <p className="text-xs text-muted-foreground">No organizations available</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department (Optional)</Label>
              <Input
                id="department"
                type="text"
                placeholder="Human Resources"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
