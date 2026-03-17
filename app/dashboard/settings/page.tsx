import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'
import SettingsClient from '@/components/dashboard/SettingsClient'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id!
  const subscription = await getUserSubscription(userId)
  return <SettingsClient user={session!.user! as any} subscription={subscription} />
}
