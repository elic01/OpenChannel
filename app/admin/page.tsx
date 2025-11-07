import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Redirect based on role
  if (profile?.role === "system_admin") {
    redirect("/admin/users")
  } else {
    // P&C admin and others go to feedback
    redirect("/admin/feedback")
  }
}
