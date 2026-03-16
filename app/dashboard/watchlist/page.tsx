import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'
import { getTierFeatures } from '@/lib/tiers'
import { getDAOTokens, getTopDAOs } from '@/lib/api'
import WatchlistClient from '@/components/dashboard/WatchlistClient'

export const revalidate = 60

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const subscription = await getUserSubscription(userId)
  const features = getTierFeatures(subscription.tier)

  let watchlistItems: any[] = []
  try {
    const { db } = await import('@/lib/db')
    watchlistItems = await db.watchlistItem.findMany({ where: { userId }, orderBy: { addedAt: 'desc' } })
  } catch {}

  let watchedTokens: any[] = []
  if (watchlistItems.length > 0) {
    try { watchedTokens = await getDAOTokens(watchlistItems.map((w: any) => w.coinId)) } catch {}
  }

  const allTopTokens = await getTopDAOs(20).catch(() => [])
  const suggestedTokens = allTopTokens
    .filter((t: any) => !watchlistItems.some((w: any) => w.coinId === t.id))
    .slice(0, 10)

  return (
    <WatchlistClient
      watchedTokens={watchedTokens}
      watchlistItems={watchlistItems.map((i: any) => ({ ...i, addedAt: i.addedAt?.toISOString?.() || new Date().toISOString() }))}
      suggestedTokens={suggestedTokens}
      subscription={subscription}
      features={features}
    />
  )
}
