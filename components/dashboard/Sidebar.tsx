'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Star, Newspaper, Settings, LogOut, TrendingUp, Rocket, Image, BarChart2 } from 'lucide-react'
import type { TierFeatures, TierKey } from '@/lib/tiers'

const MOONSTER_IMG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'
const MOONSTER_JPEG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafkreiafltcgo34ly6up3b2qymc3wie75dsiorcgkiafrpdvsaygoe2cmy'

interface Props {
  user: { wallet?: string }
  features: TierFeatures
  tier: TierKey
}

const NAV = [
  { href: '/dashboard',           label: 'Overview',        icon: LayoutDashboard },
  { href: '/dashboard/mrocks',    label: '$MROCKS',         icon: Rocket },
  { href: '/dashboard/markets',   label: 'Markets',         icon: TrendingUp },
  { href: '/dashboard/portfolio', label: 'Portfolio',       icon: BarChart2 },
  { href: '/dashboard/watchlist', label: 'Watchlist',       icon: Star },
  { href: '/dashboard/gallery',   label: 'Gallery',         icon: Image },
  { href: '/dashboard/news',      label: 'News & Sentiment',icon: Newspaper },
  { href: '/dashboard/settings',  label: 'Settings',        icon: Settings },
]

const TIER_META: Record<TierKey, { label: string; color: string; bg: string; border: string; glow: string; icon: string }> = {
  free:  { label: 'Free',         color: '#71717a', bg: 'rgba(63,63,70,0.15)',    border: 'rgba(63,63,70,0.3)',     glow: '',                                    icon: '🌑' },
  tier1: { label: 'Holder',       color: '#34d399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.22)',  glow: '0 0 12px rgba(16,185,129,0.18)',      icon: '🌙' },
  tier2: { label: 'Space Debris', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.28)',  glow: '0 0 14px rgba(139,92,246,0.22)',      icon: '☄️' },
  tier3: { label: 'Comet',        color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)',   glow: '0 0 18px rgba(245,158,11,0.28)',      icon: '⛓️' },
}

export default function DashboardSidebar({ user, features, tier }: Props) {
  const pathname = usePathname()
  const shortWallet = user.wallet ? `${user.wallet.slice(0, 4)}…${user.wallet.slice(-4)}` : '—'
  const tm = TIER_META[tier]

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full relative z-10"
      style={{ background: 'rgba(5,2,16,0.88)', borderRight: '1px solid rgba(139,92,246,0.1)', backdropFilter: 'blur(24px)' }}>

      {/* Logo */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-xl blur-lg opacity-60 group-hover:opacity-90 transition-opacity"
              style={{ background: 'rgba(124,58,237,0.5)' }} />
            <div className="moonster-ring">
              <img src={MOONSTER_IMG} alt="MoonMap"
                className="relative w-9 h-9 object-cover"
                style={{ borderRadius: '50%' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_JPEG }} />
            </div>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-white leading-none tracking-wide">MoonMap</p>
            <p className="font-mono text-[8px] mt-0.5 tracking-widest" style={{ color: 'rgba(139,92,246,0.55)' }}>DAO INTELLIGENCE</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 border ${active ? 'nav-active font-display' : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'}`}>
              <Icon size={14} className={active ? 'text-violet-400' : ''} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
              {active && <div className="ml-auto w-1 h-1 rounded-full bg-violet-400 opacity-80" />}
            </Link>
          )
        })}
      </nav>

      {/* Tier badge */}
      <div className="mx-2 mb-2 p-3 rounded-xl transition-all"
        style={{ background: tm.bg, border: `1px solid ${tm.border}`, boxShadow: tm.glow }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono" style={{ color: 'rgba(113,113,122,0.7)' }}>ACCESS TIER</span>
          <div className="flex items-center gap-1.5">
            {tier !== 'free' && (
              <div className="relative w-5 h-5 flex-shrink-0">
                <div className="absolute inset-0 rounded-full blur-sm" style={{ background: tm.bg }} />
                <img src={MOONSTER_IMG} alt="" className="relative w-5 h-5 rounded-full object-cover"
                  style={{ border: `1px solid ${tm.border}` }}
                  onError={e => { (e.target as HTMLImageElement).src = MOONSTER_JPEG }} />
              </div>
            )}
            <span className="text-[11px] font-bold font-display" style={{ color: tm.color }}>
              {tm.icon} {tm.label}
            </span>
          </div>
        </div>
        <p className="text-[9px] font-mono" style={{ color: 'rgba(99,85,140,0.8)' }}>
          {features.watchlistLimit} watchlist · {features.sentimentFull ? 'Full' : 'Basic'} sentiment
        </p>
      </div>

      {/* Wallet + disconnect */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(139,92,246,0.07)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }} />
          <p className="text-[10px] font-mono truncate" style={{ color: 'rgba(99,85,140,0.9)' }}>{shortWallet}</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1.5 text-[10px] font-mono px-1 py-0.5 rounded transition-colors"
          style={{ color: 'rgba(99,85,140,0.6)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(99,85,140,0.6)')}>
          <LogOut size={10} /> Disconnect
        </button>
      </div>
    </aside>
  )
}
