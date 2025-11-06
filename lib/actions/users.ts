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
  organizationId?: string
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

  // Generate a temporary password for the user
  const tempPassword = Math.random().toString(36).slice(-12)

  // Create auth user using Supabase Admin API
  const adminSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const adminSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!adminSupabaseKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured")
  }

  if (!adminSupabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured")
  }

  // Use the Supabase client with service role key
  const { createClient: createAdminClient } = await import("@supabase/supabase-js")
  const adminSupabase = createAdminClient(adminSupabaseUrl, adminSupabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email: userData.email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`)
  }

  if (!authData.user) {
    throw new Error("Failed to create auth user")
  }

  // Use provided organization or default to admin's organization
  const organizationId = userData.organizationId || adminProfile.organization_id

  // Create profile using RPC function
  const { data: profileResult, error: profileError } = await supabase.rpc("manage_profile", {
    p_user_id: authData.user.id,
    p_email: userData.email,
    p_full_name: userData.fullName,
    p_role: userData.role,
    p_department: userData.department || null,
    p_organization_id: organizationId,
  })

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`)
  }

  revalidatePath("/admin/users")
  return { success: true, userId: authData.user.id, tempPassword }
}
