// middleware.ts
// NOTE: withAuth middleware requires NEXTAUTH_SECRET to be set in Vercel environment variables.
// Once NEXTAUTH_SECRET is configured in the Vercel dashboard, restore the withAuth block below.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

// Intentionally empty matcher — re-enable after setting NEXTAUTH_SECRET in Vercel env vars:
// matcher: ['/dashboard/:path*', '/api/data/:path*', '/api/gallery']
export const config = { matcher: [] }
