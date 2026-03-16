// app/dashboard/settings/page.tsx
import { auth } from '@/lib/auth'
import { getUserSubscription } from '@/lib/stripe'
import SettingsClient from '@/components/dashboard/SettingsClient'

export default async function SettingsPage() {
  const session = await auth()
  const userId = session!.user!.id!
  const subscription = await getUserSubscription(userId)

  return (
    <SettingsClient
      user={session!.user!}
      subscription={subscription}
    />
  )
}
