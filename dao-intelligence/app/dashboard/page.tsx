// app/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { getTierFeatures } from '@/lib/tiers'
import { getTopDAOs, getDAONews, calculateSentiment } from '@/lib/api'
import { db } from '@/lib/db'
import { DAO_COINS } from '@/types'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const revalidate = 60

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!
  const tier = session!.user!.tier || 'free'
  const features = getTierFeatures(tier)

  const watchlist = await db.watchlistItem.findMany({
    where: { userId },
    select: { coinId: true },
  })

  const coinIds =
    watchlist.length > 0
      ? watchlist.map((w) => w.coinId)
      : [...DAO_COINS].slice(0, features.watchlistLimit)

  const [tokens, news] = await Promise.all([
    getTopDAOs(20),
    getDAONews(undefined, 'hot'),
  ])

  const sentiment = calculateSentiment(news)
  const watchlistTokens = tokens.filter((t) => coinIds.includes(t.id))
  const displayTokens = tokens.slice(0, features.watchlistLimit)

  return (
    <DashboardClient
      tokens={displayTokens}
      watchlistTokens={watchlistTokens}
      news={features.newsFilters ? news : news.slice(0, features.newsLimit)}
      sentiment={sentiment}
      subscription={{ tier: tier as any, status: 'active' }}
      justUpgraded={false}
      trialExpiresAt={session!.user!.trialExpiresAt ?? null}
    />
  )
}
