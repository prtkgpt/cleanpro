import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Allow public routes
    if (path.startsWith('/login') || path.startsWith('/signup')) {
      return NextResponse.next()
    }

    // Require auth for all other routes
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based route protection
    const role = token.role as string

    // Admin/Dispatcher routes
    if (path.startsWith('/calendar') ||
        path.startsWith('/bookings') ||
        path.startsWith('/customers') ||
        path.startsWith('/cleaners') ||
        path.startsWith('/services') ||
        path.startsWith('/reports') ||
        path.startsWith('/automations') ||
        path.startsWith('/settings')) {
      if (role !== 'ADMIN' && role !== 'DISPATCHER') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Customer routes
    if (path.startsWith('/portal')) {
      if (role !== 'CUSTOMER') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Cleaner routes
    if (path.startsWith('/jobs')) {
      if (role !== 'CLEANER') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This allows the middleware function to run
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
