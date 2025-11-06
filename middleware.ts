import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes and auth callbacks
  if (
    pathname === "/" ||
    pathname === "/submit" ||
    pathname === "/feedback/loop" ||
    pathname === "/auth/login" ||
    pathname === "/auth/sign-up" ||
    pathname === "/auth/sign-up-success" ||
    pathname === "/auth/callback" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/")
  ) {
    return
  }

  // Create supabase client for authenticated routes
  const response = request.clone()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getSetCookie().map((c) => {
            const [name, ...rest] = c.split("=")
            return { name, value: rest.join("=") }
          })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect unauthenticated users trying to access protected routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      return Response.redirect(new URL("/auth/login", request.url))
    }
    return
  }

  // For authenticated routes, check user role
  if (pathname.startsWith("/admin")) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    // Only allow pc_admin and system_admin to access admin routes
    if (!profile || !["pc_admin", "system_admin"].includes(profile.role)) {
      return Response.redirect(new URL("/dashboard", request.url))
    }
  }

  if (pathname.startsWith("/dashboard")) {
    // Allow all authenticated users to access dashboard
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile) {
      return Response.redirect(new URL("/auth/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
