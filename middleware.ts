// middleware.ts
// CIPHER: route protection middleware — enforces authentication on dashboard and data API routes
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(_req) {
    // Token is verified by withAuth before this runs — nothing extra needed here.
    return NextResponse.next()
  },
  {
    callbacks: {
      // Return true only if a valid JWT token exists; otherwise redirect to /login
      authorized: ({ token }) => !!token,
    },
  }
)

// Apply middleware to dashboard pages and all data API routes.
// Auth routes (/api/auth/*) are intentionally excluded so NextAuth can handle them.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/data/:path*',
    '/api/gallery',
  ],
}
