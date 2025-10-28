"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function terminateUser(userId: string) {
  const supabase = await createClient()

  // Verify current user is system admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "system_admin") {
    throw new Error("Unauthorized: System admin privileges required")
  }

  // Terminate the user
  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: false,
      terminated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    throw new Error("Failed to terminate user")
  }

  revalidatePath("/admin/users")
  return { success: true }
}
