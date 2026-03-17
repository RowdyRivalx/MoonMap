import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const cgHeaders: HeadersInit = process.env.COINGECKO_API_KEY
  ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
  : {}

// CIPHER: in-memory rate limiter for search endpoint
const searchRateMap = new Map<string, { count: number; resetAt: number }>()
const SEARCH_WINDOW_MS = 60_000
const SEARCH_MAX = 60 // 60 searches per minute per user

function checkSearchRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = searchRateMap.get(key)
  if (!entry || now > entry.resetAt) {
    searchRateMap.set(key, { count: 1, resetAt: now + SEARCH_WINDOW_MS })
    return true
  }
  if (entry.count >= SEARCH_MAX) return false
  entry.count++
  return true
}

// CIPHER: allow only printable non-control characters in search query
const SEARCH_QUERY_RE = /^[\w\s\-\.]{2,100}$/

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as any
  if (!sessionUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // CIPHER: rate limit search
  if (!checkSearchRateLimit(`search:${sessionUser.id}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ coins: [] })

  // CIPHER: validate query — reject suspicious patterns
  if (q.length > 100 || !SEARCH_QUERY_RE.test(q)) {
    return NextResponse.json({ coins: [] })
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`,
      { headers: cgHeaders, next: { revalidate: 60 } }
    )
    if (!res.ok) return NextResponse.json({ coins: [] })
    const data = await res.json()
    // Return top 12 coins with id, name, symbol, rank, thumb icon
    const coins = (data.coins || []).slice(0, 12).map((c: any) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      market_cap_rank: c.market_cap_rank ?? null,
      thumb: c.thumb,
      large: c.large,
    }))
    return NextResponse.json({ coins })
  } catch {
    return NextResponse.json({ coins: [] })
  }
}
