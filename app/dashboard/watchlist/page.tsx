import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'
import { getTierFeatures } from '@/lib/tiers'
import { getDAOTokens, getTopDAOs, getMROCKSData } from '@/lib/api'
import WatchlistClient from '@/components/dashboard/WatchlistClient'
import type { DAOToken } from '@/types'

export const revalidate = 60

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const [subscription, mrocks] = await Promise.all([
    getUserSubscription(userId),
    getMROCKSData(),
  ])
  const features = getTierFeatures(subscription.tier)

  let watchlistItems: any[] = []
  try {
    const { db } = await import('@/lib/db')
    watchlistItems = await db.watchlistItem.findMany({ where: { userId }, orderBy: { addedAt: 'desc' } })
  } catch {}

  // Filter out 'mrocks' from DB items — we always pin it at #1 from DexScreener
  const dbItems = watchlistItems.filter((w: any) => w.coinId !== 'mrocks')

  let watchedTokens: DAOToken[] = []
  if (dbItems.length > 0) {
    try { watchedTokens = await getDAOTokens(dbItems.map((w: any) => w.coinId)) } catch {}
  }

  // Prepend MROCKS at position #1
  if (mrocks) {
    watchedTokens = [
      {
        id: 'mrocks',
        symbol: mrocks.symbol,
        name: mrocks.name,
        image: mrocks.image,
        current_price: mrocks.price,
        price_change_percentage_24h: mrocks.price_change_pct_24h,
        price_change_percentage_7d_in_currency: 0,
        market_cap: mrocks.market_cap,
        total_volume: mrocks.volume_24h,
        circulating_supply: 0,
        ath: 0,
        ath_change_percentage: 0,
      } as DAOToken,
      ...watchedTokens,
    ]
  }

  const allTopTokens = await getTopDAOs(20).catch(() => [])
  const suggestedTokens = allTopTokens
    .filter((t: any) => !dbItems.some((w: any) => w.coinId === t.id))
    .slice(0, 10)

  return (
    <WatchlistClient
      watchedTokens={watchedTokens}
      watchlistItems={dbItems.map((i: any) => ({ ...i, addedAt: i.addedAt?.toISOString?.() || new Date().toISOString() }))}
      suggestedTokens={suggestedTokens}
      subscription={subscription}
      features={features}
    />
  )
}
