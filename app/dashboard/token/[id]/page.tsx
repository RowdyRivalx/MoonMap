import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getDAOTokenDetail, getPriceHistory, getTokenNews } from '@/lib/api'
import TokenDetailClient from '@/components/dashboard/TokenDetailClient'

export default async function TokenPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) redirect('/login')

  // Fetch sequentially to avoid rate limits on free CoinGecko tier
  let token, history1d, history7d, history30d, news
  try {
    token = await getDAOTokenDetail(params.id)
  } catch (e) {
    console.error('Token detail error:', e)
    redirect('/dashboard/markets')
  }

  try {
    history1d = await getPriceHistory(params.id, 1)
  } catch { history1d = [] }

  try {
    history7d = await getPriceHistory(params.id, 7)
  } catch { history7d = [] }

  try {
    history30d = await getPriceHistory(params.id, 30)
  } catch { history30d = [] }

  try {
    news = await getTokenNews(token.id, token.symbol, token.name)
  } catch { news = [] }

  return (
    <TokenDetailClient
      token={token}
      history1d={history1d}
      history7d={history7d}
      history30d={history30d}
      news={(news || []).slice(0, 15)}
      tier={(session.user as any).tier || 'free'}
    />
  )
}
