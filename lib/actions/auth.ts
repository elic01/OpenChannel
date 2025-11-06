"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return { user, profile }
}

export async function signUp(formData: {
  email: string
  password: string
  fullName: string
  organizationName: string
  role: string
  department: string
}) {
  const supabase = await createClient()

  if (formData.role !== "system_admin") {
    return {
      error: "Only system administrators can create accounts. Contact your administrator to create employee accounts.",
    }
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Failed to create user" }
  }

  // Create or get organization
  const orgSlug = formData.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  const { data: existingOrg, error: orgQueryError } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .maybeSingle()

  let organizationId = existingOrg?.id

  if (!organizationId) {
    const { data: newOrg, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: formData.organizationName,
        slug: orgSlug,
        subscription_status: "trialing",
        subscription_plan: "starter",
      })
      .select("id")
      .single()

    if (orgError) {
      console.error("[v0] Organization creation error:", orgError)
      return { error: "Failed to create organization: " + orgError.message }
    }

    if (!newOrg?.id) {
      return { error: "Failed to create organization" }
    }

    organizationId = newOrg.id
  }

  // Create profile using the secure RPC function
  const { data: profileResult, error: profileError } = await supabase.rpc("manage_profile", {
    p_user_id: authData.user.id,
    p_email: formData.email,
    p_full_name: formData.fullName,
    p_role: formData.role,
    p_department: formData.department || null,
    p_organization_id: organizationId,
  })

  if (profileError) {
    console.error("[v0] Profile creation error:", profileError)
    return { error: "Failed to create profile: " + profileError.message }
  }

  return { success: true }
}
