import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    // Check roles for admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      console.log(`[Middleware] Checking admin access for path: ${request.nextUrl.pathname}`)
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (profileError) {
        console.error("[Middleware] Profile fetch error:", profileError)
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }

      if (!profile || !["pc_admin", "system_admin"].includes(profile.role)) {
        console.log(`[Middleware] Access denied. Role: ${profile?.role}`)
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
      console.log(`[Middleware] Access granted. Role: ${profile.role}`)
    }
  }

  return supabaseResponse
}
