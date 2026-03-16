import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getDAOTokens } from '@/lib/api'
import PortfolioClient from '@/components/dashboard/PortfolioClient'

export const revalidate = 60

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  let watchlist: any[] = []
  try {
    const { db } = await import('@/lib/db')
    watchlist = await db.watchlistItem.findMany({ where: { userId: session.user.id }, orderBy: { addedAt: 'desc' } })
  } catch {}

  const tokens = watchlist.length > 0
    ? await getDAOTokens(watchlist.map((w: any) => w.coinId)).catch(() => [])
    : []

  return (
    <PortfolioClient
      tokens={tokens}
      watchlistItems={watchlist.map((w: any) => ({ ...w, addedAt: w.addedAt?.toISOString?.() || new Date().toISOString() }))}
      wallet={(session.user as any).wallet || ''}
      tier={(session.user as any).tier || 'free'}
    />
  )
}
