import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getTierFeatures } from '@/lib/tiers'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import type { TierKey } from '@/lib/tiers'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  // Read tier directly from JWT session — no DB needed
  const tier = ((session.user as any).tier || 'free') as TierKey
  const features = getTierFeatures(tier)

  return (
    <div className="flex h-screen overflow-hidden" style={{ position: 'relative', zIndex: 2 }}>
      <DashboardSidebar
        user={{ wallet: (session.user as any).wallet }}
        features={features}
        tier={tier}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
