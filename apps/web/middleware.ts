import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Next.js Middleware for route protection
 *
 * Protects routes that require authentication and handles redirects.
 * Runs before every request to check auth status.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Define auth routes (login, register, etc.)
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !token) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
