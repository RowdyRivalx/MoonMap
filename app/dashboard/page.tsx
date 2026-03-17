import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'
import { getTierFeatures } from '@/lib/tiers'
import { getMROCKSData, getMROCKSHistory, getDAONews, calculateSentiment } from '@/lib/api'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const revalidate = 60

export default async function DashboardPage({ searchParams }: { searchParams: { upgraded?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = (session.user as any).id!
  const subscription = await getUserSubscription(userId)
  const features = getTierFeatures(subscription.tier)

  // Get watchlist count safely
  let watchlistCount = 0
  try {
    const { db } = await import('@/lib/db')
    const items = await db.watchlistItem.findMany({ where: { userId }, select: { coinId: true } })
    watchlistCount = items.length
  } catch {}

  const [mrocks, history, news] = await Promise.allSettled([
    getMROCKSData(),
    getMROCKSHistory(24),
    getDAONews(undefined, 'hot'),
  ])

  const mrocksData = mrocks.status === 'fulfilled' ? mrocks.value : null
  const historyData = history.status === 'fulfilled' ? history.value : []
  const newsItems = news.status === 'fulfilled' ? news.value : []
  const sentiment = calculateSentiment(newsItems)

  return (
    <DashboardClient
      mrocks={mrocksData}
      mrocksHistory={historyData}
      news={newsItems.slice(0, 6)}
      sentiment={sentiment}
      subscription={subscription}
      features={features}
      watchlistCount={watchlistCount}
      justUpgraded={searchParams.upgraded === 'true'}
      trialExpiresAt={(session.user as any).trialExpiresAt ?? null}
    />
  )
}
