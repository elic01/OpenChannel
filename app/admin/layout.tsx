import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { MessageSquare, LogOut } from "lucide-react"
import { signOut } from "@/lib/actions/auth"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - OpenChannel",
  description: "P&C Admin Dashboard",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile and check if admin
  console.log(`[Admin Layout] Checking admin access for user: ${user.email}`)
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError) {
    console.error("[Admin Layout] Profile fetch error:", profileError)
    redirect("/dashboard")
  }

  if (!profile) {
    console.log("[Admin Layout] No profile found")
    redirect("/dashboard")
  }

  console.log(`[Admin Layout] User role: ${profile.role}`)
  if (!["pc_admin", "system_admin"].includes(profile.role)) {
    console.log(`[Admin Layout] Access denied, redirecting to dashboard`)
    redirect("/dashboard")
  }
  console.log(`[Admin Layout] Access granted`)

  // Get organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single()

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">OpenChannel Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {profile.role === "system_admin" ? "System Admin" : "P&C Admin"} • {organization?.name}
              </p>
            </div>
            <form action={signOut}>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-muted/10 lg:block">
          <div className="sticky top-16 p-4">
            <DashboardNav isAdmin={true} isSystemAdmin={profile.role === "system_admin"} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-b from-background to-muted/20">{children}</main>
      </div>
    </div>
  )
}
