// app/api/data/daos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDAOTokens, getDAONews, calculateSentiment } from '@/lib/api'
import { getUserSubscription } from '@/lib/subscription'
import { db } from '@/lib/db'
import { DAO_COINS, FREE_TIER_LIMIT } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const sub = await getUserSubscription(userId)
    const isPro = sub.tier === 'tier2' || sub.tier === 'tier3'

    // Determine which coins to fetch
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode') || 'watchlist'

    let coinIds: string[]

    if (mode === 'all') {
      coinIds = isPro ? [...DAO_COINS] : [...DAO_COINS].slice(0, FREE_TIER_LIMIT)
    } else {
      // watchlist mode
      const watchlist = await db.watchlistItem.findMany({
        where: { userId },
        select: { coinId: true },
      })
      coinIds = watchlist.map((w) => w.coinId)
      if (coinIds.length === 0) {
        coinIds = [...DAO_COINS].slice(0, isPro ? 10 : FREE_TIER_LIMIT)
      }
    }

    const [tokens, news] = await Promise.all([
      getDAOTokens(coinIds),
      getDAONews(undefined, 'hot'),
    ])

    const sentiment = calculateSentiment(news)

    // Strip sparkline data from tokens before sending to client to reduce payload size
    // (sparkline is large and only needed by dashboard pages that fetch directly)
    const slimTokens = tokens.map(({ sparkline_in_7d: _sparkline, ...rest }) => rest)

    const limitedNews = isPro ? news : news.slice(0, 5)

    return NextResponse.json(
      {
        tokens: slimTokens,
        news: limitedNews,
        sentiment,
        tier: sub.tier,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
        },
      }
    )
  } catch (err) {
    console.error('DAO data error:', err)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
