// app/api/data/trending/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDAOTokens } from '@/lib/api'
import { DAO_COINS } from '@/types'
import type { DAOToken } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokens = await getDAOTokens([...DAO_COINS])

    // Only include tokens with valid price change data
    const valid = tokens.filter(
      (t: DAOToken) =>
        typeof t.price_change_percentage_24h === 'number' &&
        !isNaN(t.price_change_percentage_24h)
    )

    const sorted = [...valid].sort(
      (a: DAOToken, b: DAOToken) =>
        b.price_change_percentage_24h - a.price_change_percentage_24h
    )

    const gainers = sorted.slice(0, 5)
    const losers = sorted.slice(-5).reverse()

    // Trending: highest 24h volume relative to market cap (activity signal)
    const trending = [...valid]
      .filter((t: DAOToken) => t.market_cap > 0)
      .sort(
        (a: DAOToken, b: DAOToken) =>
          b.total_volume / b.market_cap - a.total_volume / a.market_cap
      )
      .slice(0, 10)

    return NextResponse.json(
      { gainers, losers, trending },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
        },
      }
    )
  } catch (err) {
    console.error('Trending data error:', err)
    return NextResponse.json({ error: 'Failed to fetch trending data' }, { status: 500 })
  }
}
