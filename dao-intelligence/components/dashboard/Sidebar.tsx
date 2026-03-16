// components/dashboard/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { BarChart3, LayoutDashboard, Star, Newspaper, Settings, LogOut, TrendingUp, Shield, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TierFeatures, TierKey } from '@/lib/tiers'

interface Props {
  user: { wallet?: string }
  features: TierFeatures
  tier: TierKey
}

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/markets', label: 'Markets', icon: TrendingUp },
  { href: '/dashboard/watchlist', label: 'Watchlist', icon: Star },
  { href: '/dashboard/news', label: 'News & Sentiment', icon: Newspaper },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const TIER_COLORS: Record<TierKey, string> = {
  free: 'text-zinc-400 bg-zinc-800',
  tier1: 'text-emerald-400 bg-emerald-400/10',
  tier2: 'text-violet-400 bg-violet-400/10',
  tier3: 'text-amber-400 bg-amber-400/10',
}

const TIER_LABELS: Record<TierKey, string> = {
  free: 'Free',
  tier1: 'Holder',
  tier2: 'Space Debris',
  tier3: 'Comet',
}

export default function DashboardSidebar({ user, features, tier }: Props) {
  const pathname = usePathname()
  const shortWallet = user.wallet
    ? `${user.wallet.slice(0, 4)}…${user.wallet.slice(-4)}`
    : '—'

  return (
    <aside className="w-56 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <BarChart3 size={13} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">DAOScope</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Tier badge */}
      <div className="mx-3 mb-3 p-3 bg-zinc-800/60 rounded-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">Access tier</span>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', TIER_COLORS[tier])}>
            {TIER_LABELS[tier]}
          </span>
        </div>
        <p className="text-xs text-zinc-500">
          {features.watchlistLimit} token watchlist ·{' '}
          {features.sentimentFull ? 'Full sentiment' : 'Basic sentiment'}
        </p>
      </div>

      {/* Wallet */}
      <div className="px-3 py-3 border-t border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-zinc-700 rounded-full flex items-center justify-center">
            <Wallet size={12} className="text-zinc-400" />
          </div>
          <p className="text-xs text-zinc-400 font-mono">{shortWallet}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-1 py-1"
        >
          <LogOut size={12} /> Disconnect
        </button>
      </div>
    </aside>
  )
}
