// app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getTierFeatures } from '@/lib/tiers'
import DashboardSidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const features = getTierFeatures(session.user.tier || 'free')

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <DashboardSidebar user={session.user} features={features} tier={session.user.tier || 'free'} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
