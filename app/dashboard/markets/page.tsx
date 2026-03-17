import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'
import { getTopDAOs, getMROCKSData } from '@/lib/api'
import MarketsClient from '@/components/dashboard/MarketsClient'
import type { DAOToken } from '@/types'

export const revalidate = 60

export default async function MarketsPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user!.id!
  const [subscription, daoTokens, mrocks] = await Promise.all([
    getUserSubscription(userId),
    getTopDAOs(20),
    getMROCKSData(),
  ])

  const tokens: DAOToken[] = [
    ...(mrocks ? [{
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
    } as DAOToken] : []),
    ...daoTokens,
  ]

  return <MarketsClient tokens={tokens} subscription={subscription} />
}
