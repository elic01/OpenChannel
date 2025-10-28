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

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
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

  const { data: existingOrg } = await supabase.from("organizations").select("id").eq("slug", orgSlug).single()

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
      return { error: "Failed to create organization" }
    }

    organizationId = newOrg.id
  }

  // Create user profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    email: formData.email,
    full_name: formData.fullName,
    role: formData.role,
    department: formData.department || null,
    organization_id: organizationId,
    is_active: true,
  })

  if (profileError) {
    return { error: "Failed to create profile" }
  }

  return { success: true }
}
