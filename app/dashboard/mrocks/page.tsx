import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getMROCKSData, getMROCKSHistory, getDAONews } from '@/lib/api'
import MROCKSClient from '@/components/dashboard/MROCKSClient'

export const revalidate = 60

export default async function MROCKSPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const [mrocks, history, news] = await Promise.allSettled([
    getMROCKSData(),
    getMROCKSHistory(24),
    getDAONews(undefined, 'hot'),
  ])

  return (
    <MROCKSClient
      mrocks={mrocks.status === 'fulfilled' ? mrocks.value : null}
      history={history.status === 'fulfilled' ? history.value : []}
      news={(news.status === 'fulfilled' ? news.value : []).slice(0, 8)}
      tier={(session.user as any).tier || 'free'}
    />
  )
}
