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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({
            name,
            value,
            ...options,
          }))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedPath = 
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/modules") ||
    request.nextUrl.pathname.startsWith("/billing") ||
    request.nextUrl.pathname.startsWith("/team") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/onboarding")

  const isAuthPath = 
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register")

  // Case 1: No user
  if (!user) {
    if (isProtectedPath) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Case 2: User exists, check for Org status
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Middleware Profile Error:', error)
  }

  // Dual-Check: Use database record but fallback to Auth Metadata (faster/more reliable for redirects)
  const dbOrgId = profile?.org_id
  const metaOrgId = user.user_metadata?.org_id
  const hasOrg = !!(dbOrgId || metaOrgId)

  const isOnboardingPath = request.nextUrl.pathname.startsWith("/onboarding")

  console.log('Middleware Check:', {
    userId: user.id,
    hasOrg,
    dbOrgId,
    metaOrgId,
    path: request.nextUrl.pathname
  })

  // Force onboarding if logged in but no org
  if (!hasOrg && !isOnboardingPath && isProtectedPath) {
    console.log('Redirecting to onboarding...')
    const url = request.nextUrl.clone()
    url.pathname = "/onboarding"
    return NextResponse.redirect(url)
  }

  // Auto-redirect from Auth pages if already set up
  if (hasOrg && isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
