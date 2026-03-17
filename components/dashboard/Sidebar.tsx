'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Star, Newspaper, Settings, LogOut, TrendingUp, Rocket, Image, BarChart2, Menu, X } from 'lucide-react'
import type { TierFeatures, TierKey } from '@/lib/tiers'

const MOONSTER_IMG  = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'
const MOONSTER_JPEG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafkreiafltcgo34ly6up3b2qymc3wie75dsiorcgkiafrpdvsaygoe2cmy'
const MOONSTERS_LOGO = 'https://moonsters.io/wp-content/uploads/2023/01/moonsters-logo-1.png'

interface Props {
  user: { wallet?: string }
  features: TierFeatures
  tier: TierKey
  portfolioValue?: number | null
}

// Keyboard shortcut hints: key sequence to navigate
const NAV = [
  { href: '/dashboard',           label: 'Overview',         icon: LayoutDashboard, shortcut: 'G O' },
  { href: '/dashboard/mrocks',    label: '$MROCKS',          icon: Rocket,          shortcut: 'G R' },
  { href: '/dashboard/markets',   label: 'Markets',          icon: TrendingUp,      shortcut: 'G M' },
  { href: '/dashboard/portfolio', label: 'Portfolio',        icon: BarChart2,       shortcut: 'G P' },
  { href: '/dashboard/watchlist', label: 'Watchlist',        icon: Star,            shortcut: 'G W' },
  { href: '/dashboard/gallery',   label: 'Gallery',          icon: Image,           shortcut: 'G G' },
  { href: '/dashboard/news',      label: 'News & Sentiment', icon: Newspaper,       shortcut: 'G N' },
  { href: '/dashboard/settings',  label: 'Settings',         icon: Settings,        shortcut: 'G S' },
]

const TIER_META: Record<TierKey, { label: string; color: string; bg: string; border: string; glow: string; icon: string }> = {
  free:  { label: 'Free',         color: '#71717a', bg: 'rgba(63,63,70,0.15)',    border: 'rgba(63,63,70,0.3)',     glow: '',                                    icon: '🌑' },
  tier1: { label: 'Astronaut',   color: '#34d399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.22)',  glow: '0 0 12px rgba(16,185,129,0.18)',      icon: '🌙' },
  tier2: { label: 'Moon Walker', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.28)',  glow: '0 0 14px rgba(139,92,246,0.22)',      icon: '☄️' },
  tier3: { label: 'MOONSTER',    color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)',   glow: '0 0 18px rgba(245,158,11,0.28)',      icon: '⛓️' },
}

function SidebarContents({ user, features, tier, portfolioValue, onNavClick }: Props & { onNavClick?: () => void }) {
  const pathname = usePathname()
  const shortWallet = user.wallet ? `${user.wallet.slice(0, 4)}…${user.wallet.slice(-4)}` : '—'
  const tm = TIER_META[tier]

  return (
    <>
      {/* Logo */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onNavClick}>
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(163,255,71,0.3)' }} />
            <div className="moonster-ring">
              <img src={MOONSTERS_LOGO} alt="MoonMap"
                className="relative w-9 h-9 object-cover"
                style={{ borderRadius: '50%' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG }} />
            </div>
          </div>
          <div>
            <p className="font-monster text-sm text-white leading-none" style={{ letterSpacing: '0.08em' }}>MOONMAP</p>
            <p className="font-mono text-[8px] mt-0.5 tracking-widest" style={{ color: 'rgba(163,255,71,0.5)' }}>DAO INTELLIGENCE</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, shortcut }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              onClick={onNavClick}
              className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 border relative ${
                active
                  ? 'nav-active font-display'
                  : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`}>
              {/* Active left bar accent */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: 'linear-gradient(to bottom, #a78bfa, #7c3aed)', boxShadow: '0 0 6px rgba(167,139,250,0.6)' }} />
              )}
              <Icon size={14} className={active ? 'text-violet-400' : ''} strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1">{label}</span>
              {/* Keyboard shortcut hint — only visible on hover or when active */}
              <span
                className={`text-[9px] font-mono px-1 py-0.5 rounded transition-opacity ${active ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`}
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  color: active ? '#a78bfa' : 'rgba(113,113,122,0.8)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  letterSpacing: '0.06em',
                }}>
                {shortcut}
              </span>
              {active && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#a78bfa', boxShadow: '0 0 5px rgba(167,139,250,0.8)' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Portfolio value (shown if holdings exist) */}
      {portfolioValue != null && portfolioValue > 0 && (
        <div className="mx-2 mb-2 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(139,92,246,0.18)' }}>
          <p className="text-[9px] font-mono mb-0.5" style={{ color: 'rgba(113,113,122,0.6)' }}>PORTFOLIO VALUE</p>
          <p className="text-sm font-bold" style={{ color: '#a78bfa' }}>
            ${portfolioValue >= 1_000_000
              ? `${(portfolioValue / 1_000_000).toFixed(2)}M`
              : portfolioValue >= 1_000
              ? `${(portfolioValue / 1_000).toFixed(1)}K`
              : portfolioValue.toFixed(2)}
          </p>
        </div>
      )}

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
    </>
  )
}

export default function DashboardSidebar({ user, features, tier, portfolioValue }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        className="sm:hidden fixed top-3 left-3 z-50 p-2 rounded-lg"
        style={{ background: 'rgba(5,2,16,0.9)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden sm:flex w-56 flex-shrink-0 flex-col h-full relative z-10"
        style={{ background: 'rgba(5,2,16,0.88)', borderRight: '1px solid rgba(139,92,246,0.1)', backdropFilter: 'blur(24px)' }}>
        <SidebarContents user={user} features={features} tier={tier} portfolioValue={portfolioValue} />
      </aside>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-in drawer */}
      <aside
        className={`sm:hidden fixed top-0 left-0 h-full z-50 flex flex-col w-64 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'rgba(5,2,16,0.97)', borderRight: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(24px)' }}
      >
        {/* Close button inside drawer */}
        <button
          className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(113,113,122,0.6)' }}
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          onMouseEnter={e => (e.currentTarget.style.color = '#e4e4e7')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(113,113,122,0.6)')}
        >
          <X size={16} />
        </button>
        <SidebarContents
          user={user}
          features={features}
          tier={tier}
          portfolioValue={portfolioValue}
          onNavClick={() => setMobileOpen(false)}
        />
      </aside>
    </>
  )
}
