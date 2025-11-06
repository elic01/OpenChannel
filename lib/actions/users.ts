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

export async function createUser(userData: {
  email: string
  fullName: string
  role: "pc_admin" | "employee"
  department?: string
}) {
  const supabase = await createClient()

  // Verify current user is system admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (!adminProfile || adminProfile.role !== "system_admin") {
    throw new Error("Unauthorized: System admin privileges required")
  }

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-12)

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    throw new Error(`Failed to create auth user: ${authError?.message}`)
  }

  // Create profile using RPC function
  const { data: profileResult, error: profileError } = await supabase.rpc("manage_profile", {
    p_user_id: authData.user.id,
    p_email: userData.email,
    p_full_name: userData.fullName,
    p_role: userData.role,
    p_department: userData.department || null,
    p_organization_id: adminProfile.organization_id,
  })

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`)
  }

  revalidatePath("/admin/users")
  return { success: true, userId: authData.user.id, tempPassword }
}
