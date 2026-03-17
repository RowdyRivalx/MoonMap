import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getMROCKSData, getMROCKSHistoryAll, getDAONews } from '@/lib/api'
import MROCKSClient from '@/components/dashboard/MROCKSClient'

export const revalidate = 60

export default async function MROCKSPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const [mrocks, historyAll, news] = await Promise.allSettled([
    getMROCKSData(),
    getMROCKSHistoryAll(),
    getDAONews(undefined, 'hot'),
  ])

  const history = historyAll.status === 'fulfilled' ? historyAll.value : { h1: [], d7: [], m1: [] }

  return (
    <MROCKSClient
      mrocks={mrocks.status === 'fulfilled' ? mrocks.value : null}
      history1h={history.h1}
      history7d={history.d7}
      history1m={history.m1}
      news={(news.status === 'fulfilled' ? news.value : []).slice(0, 8)}
      tier={(session.user as any).tier || 'free'}
    />
  )
}
