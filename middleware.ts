// EventSync/middleware.ts (Reinforced Logging & Logic)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)?.value
          // console.log(`[Middleware] Getting cookie '${name}': ${cookie ? 'Found' : 'Not Found'}`);
          return cookie;
        },
        set(name: string, value: string, options: CookieOptions) {
          // console.log(`[Middleware] Attempting to set cookie '${name}'`);
          // Cloning is crucial for setting cookies in middleware
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
          // console.log(`[Middleware] Cookie '${name}' set on response`);
        },
        remove(name: string, options: CookieOptions) {
          // console.log(`[Middleware] Attempting to remove cookie '${name}'`);
          // Cloning is crucial
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
          // console.log(`[Middleware] Cookie '${name}' removed via set empty`);
        },
      },
    }
  )

  // Crucial: Refresh session and get user based *only* on cookies
  // console.log('[Middleware] Attempting supabase.auth.getUser()');
  const { data: { user }, error: getUserError } = await supabase.auth.getUser()
  // console.log(`[Middleware] supabase.auth.getUser() result: User ${user ? user.id : 'null'}, Error: ${getUserError?.message}`);

  const url = new URL(request.url)
  const origin = url.origin
  const pathname = url.pathname

  // --- Redirect logic ---

  // 1. Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/register']
  if (user && authRoutes.includes(pathname)) {
    const userType = user.user_metadata?.userType
    let redirectPath = '/dashboard' // Default dashboard
    if (userType === 'organizer') redirectPath = '/organizer/dashboard'
    else if (userType === 'participant') redirectPath = '/participant/dashboard'
    console.log(`[Middleware] User authenticated on auth route '${pathname}'. Redirecting to ${redirectPath}`);
    return NextResponse.redirect(new URL(redirectPath, origin))
  }

  // 2. Redirect unauthenticated users away from protected pages
  // Define protected routes more explicitly
  const protectedRoutes = [
    '/dashboard',
    '/participant',
    '/organizer',
    '/profile',
    '/settings'
    // Add specific protected pages if needed, e.g., '/hackathons/[id]/team'
  ];
  // Check if the current path *starts with* any of the protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!user && isProtectedRoute) {
    // Redirect to login, preserve intended destination
    const redirectUrl = new URL('/login', origin)
    redirectUrl.searchParams.set('next', pathname)
    console.log(`[Middleware] User not authenticated for protected route '${pathname}'. Redirecting to login.`);
    return NextResponse.redirect(redirectUrl)
  }

  // 3. Role-specific route protection (Server-Side)
  if (user) {
      const userType = user.user_metadata?.userType;
      if (pathname.startsWith('/organizer') && userType !== 'organizer') {
          console.log(`[Middleware] User type '${userType}' unauthorized for '/organizer'. Redirecting.`);
          return NextResponse.redirect(new URL('/dashboard', origin)); // Or an unauthorized page
      }
      if (pathname.startsWith('/participant') && userType !== 'participant') {
          console.log(`[Middleware] User type '${userType}' unauthorized for '/participant'. Redirecting.`);
          return NextResponse.redirect(new URL('/dashboard', origin)); // Or an unauthorized page
      }
  }

  // If no redirects needed, allow request and potential cookie updates
  // console.log(`[Middleware] No redirection needed for '${pathname}'. Proceeding.`);
  return response
}

// Matcher remains the same
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|auth/callback|.*\\.).*)',
  ],
}