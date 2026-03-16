import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'
import { getTopDAOs } from '@/lib/api'
import MarketsClient from '@/components/dashboard/MarketsClient'

export const revalidate = 60

export default async function MarketsPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user!.id!
  const subscription = await getUserSubscription(userId)
  const tokens = await getTopDAOs(20)
  return <MarketsClient tokens={tokens} subscription={subscription} />
}
