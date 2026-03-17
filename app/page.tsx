'use client'
import Link from 'next/link'
import { ArrowRight, BarChart3, Shield, Zap, Globe, TrendingUp, Users, Wallet } from 'lucide-react'

const MOONSTER_PORTRAIT  = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'
const MOONSTERS_LOGO     = 'https://moonsters.io/wp-content/uploads/2023/01/moonsters-logo-1.png'
const MOONSTERS_WORDMARK = 'https://moonsters.io/wp-content/uploads/2023/01/Moonsters-With-Eyes-1-300x53.png'
const CHAR_1 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-1.png'
const CHAR_2 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-2.png'
const CHAR_4 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-4.png'
// Swirling neon hero background from moonsters.io
const NEON_BG = 'https://moonsters.io/wp-content/uploads/2023/01/Image-3.jpg'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav style={{ borderBottom: '1px solid rgba(163,255,71,0.1)', background: 'rgba(4,1,14,0.85)', backdropFilter: 'blur(20px)' }}
        className="sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Circular badge seal from moonsters.io */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full blur-md" style={{ background: 'rgba(163,255,71,0.25)' }} />
              <img
                src={MOONSTERS_LOGO}
                alt="MoonMap"
                className="relative w-9 h-9 rounded-full object-cover"
                style={{ border: '1.5px solid rgba(163,255,71,0.4)' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }}
              />
            </div>
            <span className="font-monster text-lg text-white tracking-wide">MOONMAP</span>
            <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(163,255,71,0.08)', border: '1px solid rgba(163,255,71,0.2)', color: '#a3ff47' }}>
              DAO INTEL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm font-mono hidden sm:block"
              style={{ color: 'rgba(163,139,250,0.7)' }}>
              ACCESS TIERS
            </Link>
            <Link href="/login" className="btn-primary text-sm inline-flex items-center gap-2">
              <Wallet size={14} /> Connect Wallet
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-16 pb-20 overflow-hidden">
        {/* Swirling neon hero background */}
        <div className="absolute inset-0 z-0">
          <img src={NEON_BG} alt="" className="w-full h-full object-cover"
            style={{ opacity: 0.08, filter: 'saturate(2) hue-rotate(10deg)' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(4,1,14,0.4) 0%, rgba(4,1,14,0.0) 40%, rgba(4,1,14,0.0) 60%, rgba(4,1,14,0.9) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            {/* Moonsters wordmark badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(163,255,71,0.06)', border: '1px solid rgba(163,255,71,0.2)' }}>
              <img src={MOONSTERS_WORDMARK} alt="Moonsters" className="h-4 object-contain"
                style={{ filter: 'invert(1) brightness(2)' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <span className="text-xs font-mono" style={{ color: '#a3ff47' }}>OFFICIAL INTELLIGENCE HUB</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
              DAO intelligence,{' '}
              <span className="monster-title" style={{ fontFamily: 'Bungee, Syne, sans-serif' }}>
                built for Moonsters
              </span>
            </h1>
            <p className="text-xl mb-10 leading-relaxed" style={{ color: 'rgba(232,228,248,0.7)' }}>
              Track governance tokens, monitor treasury flows, analyze sentiment — your NFT unlocks
              your tier automatically.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/login" className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3">
                <Wallet size={16} /> Connect Wallet <ArrowRight size={16} />
              </Link>
              <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
                className="btn-neon inline-flex items-center gap-2 text-base px-6 py-3">
                Get a Moonster ↗
              </a>
            </div>
            <p className="text-sm mt-4 font-mono" style={{ color: 'rgba(113,113,122,0.6)' }}>
              Any wallet · 10-min free trial · NFT = permanent access
            </p>
          </div>

          {/* Right: three characters showcase */}
          <div className="relative flex justify-center select-none">
            <div className="relative w-80 h-80 md:w-[400px] md:h-[400px]">
              {/* Ambient neon glow behind characters */}
              <div className="absolute inset-0 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(163,255,71,0.10) 0%, rgba(255,45,120,0.08) 45%, rgba(124,58,237,0.06) 70%, transparent 100%)' }} />

              {/* Character 2 — top left, lime glow */}
              <img src={CHAR_2} alt="Moonster"
                className="absolute object-contain animate-rise"
                style={{ width: '55%', top: '0%', left: '-8%',
                  filter: 'drop-shadow(0 0 22px rgba(163,255,71,0.65))',
                  animationDelay: '0.1s' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }} />

              {/* Character 1 — center main, orange glow */}
              <img src={CHAR_1} alt="Moonster"
                className="absolute object-contain animate-rise"
                style={{ width: '70%', top: '15%', left: '15%', zIndex: 2,
                  filter: 'drop-shadow(0 0 32px rgba(255,107,43,0.7))',
                  animationDelay: '0.0s' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }} />

              {/* Character 4 — bottom right, magenta glow */}
              <img src={CHAR_4} alt="Moonster"
                className="absolute object-contain animate-rise-2"
                style={{ width: '48%', bottom: '0%', right: '-6%',
                  filter: 'drop-shadow(0 0 20px rgba(255,45,120,0.65))',
                  animationDelay: '0.2s' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }} />

              {/* Blue Chain badge */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-10
                font-mono text-xs font-bold px-4 py-1.5 rounded-full glow-tier3"
                style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)', color: '#fbbf24' }}>
                ⛓️ Blue Chain · MOONSTER
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <div className="px-6 py-6" style={{ borderTop: '1px solid rgba(163,255,71,0.08)', borderBottom: '1px solid rgba(163,255,71,0.08)', background: 'rgba(8,4,18,0.6)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'DAOs tracked',      value: '20+',    color: '#a3ff47' },
            { label: 'Data points / day', value: '2.4M',   color: '#a78bfa' },
            { label: 'News sources',      value: '180+',   color: '#ff6ea8' },
            { label: 'Active users',      value: '1,200+', color: '#22d3ee' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-monster mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-mono" style={{ color: 'rgba(113,113,122,0.7)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-monster text-3xl md:text-4xl mb-4"
              style={{ color: 'white' }}>
              Everything you need to{' '}
              <span style={{ color: '#a3ff47' }}>govern smarter</span>
            </h2>
            <p className="font-mono text-sm" style={{ color: 'rgba(163,139,250,0.6)' }}>
              Built for Moonsters holders and DeFi power users.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'Live Price & Volume',    desc: 'Real-time market data for governance tokens. Sparklines, 24h/7d changes, market cap, and volume at a glance.', glow: 'rgba(34,211,238,0.15)', border: 'rgba(34,211,238,0.2)', iconCol: '#22d3ee' },
              { icon: Shield,     title: 'Governance Tracker',     desc: 'Never miss a proposal. Active votes, quorum progress, and outcome history across Snapshot, Tally, and on-chain.', tier: 'MOONSTER', glow: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.2)', iconCol: '#fbbf24' },
              { icon: Globe,      title: 'Sentiment Analysis',     desc: 'Aggregated sentiment from 180+ crypto news sources. Know the mood before you vote or trade.', tier: 'Moon Walker', glow: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.2)', iconCol: '#a78bfa' },
              { icon: BarChart3,  title: 'Treasury Analytics',     desc: 'Monitor DAO treasury inflows, outflows, and asset composition. Spot diversification risks and liquidity runway.', tier: 'MOONSTER', glow: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.2)', iconCol: '#fbbf24' },
              { icon: Users,      title: 'Developer Activity',     desc: 'GitHub commits, PR merges, and contributor growth — the on-chain fundamentals of protocol health.', tier: 'MOONSTER', glow: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.2)', iconCol: '#fbbf24' },
              { icon: Zap,        title: 'Custom Watchlist',       desc: 'Build a personal watchlist. Astronauts get 10 tokens, Moon Walker+ unlocks 50.', glow: 'rgba(163,255,71,0.12)', border: 'rgba(163,255,71,0.18)', iconCol: '#a3ff47' },
            ].map((f) => (
              <div key={f.title} className="card p-6 transition-all duration-200 hover:-translate-y-1"
                style={{ borderColor: f.border, boxShadow: `0 0 30px ${f.glow}` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${f.glow}`, border: `1px solid ${f.border}` }}>
                    <f.icon size={18} style={{ color: f.iconCol }} />
                  </div>
                  {f.tier && (
                    <span className={`trait-badge ${f.tier === 'MOONSTER' ? 'trait-badge-gold' : 'trait-badge-violet'}`}>
                      {f.tier}
                    </span>
                  )}
                </div>
                <h3 className="font-bold mb-2 text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(161,161,170,0.8)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tiers ────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16"
        style={{ borderTop: '1px solid rgba(163,255,71,0.08)', background: 'rgba(6,3,16,0.7)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-monster text-3xl md:text-4xl mb-3 text-white">
              Your Moonster = your access
            </h2>
            <p className="font-mono text-sm" style={{ color: 'rgba(163,139,250,0.6)' }}>
              The rarer the trait, the more powerful your dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {[
              {
                label: 'Trial', sub: 'Any wallet',
                border: 'rgba(63,63,70,0.5)', bg: 'rgba(9,9,11,0.8)',
                badge: { bg: 'rgba(63,63,70,0.3)', border: 'rgba(63,63,70,0.5)', color: '#71717a' },
                features: ['10 min free trial', 'Astronaut access', 'No NFT needed'],
                icon: '🌑',
              },
              {
                label: 'Astronaut', sub: 'Any Moonster',
                border: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.04)',
                badge: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#34d399' },
                features: ['Live prices', '10 token watchlist', 'News feed'],
                icon: '🌙',
              },
              {
                label: 'Moon Walker', sub: 'Special traits',
                border: 'rgba(139,92,246,0.35)', bg: 'rgba(139,92,246,0.05)',
                badge: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)', color: '#a78bfa' },
                features: ['50 token watchlist', 'Full sentiment', 'News filters'],
                icon: '☄️',
              },
              {
                label: 'MOONSTER', sub: 'Blue Chain trait',
                border: 'rgba(245,158,11,0.4)', bg: 'rgba(245,158,11,0.05)',
                badge: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', color: '#fbbf24' },
                features: ['Governance alerts', 'Treasury analytics', 'Dev metrics'],
                icon: '⛓️',
                character: CHAR_1,
              },
            ].map((t) => (
              <div key={t.label} className="card p-5 text-left relative overflow-hidden"
                style={{ borderColor: t.border, background: t.bg }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{t.icon}</span>
                  <span className="font-monster text-sm" style={{ color: t.badge.color }}>{t.label}</span>
                </div>
                <p className="text-xs font-mono mb-4" style={{ color: 'rgba(113,113,122,0.6)' }}>{t.sub}</p>
                <ul className="space-y-2">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(212,212,216,0.9)' }}>
                      <span style={{ color: t.badge.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                {/* MOONSTER tier: character art peek */}
                {t.character && (
                  <img src={t.character} alt="Moonster"
                    className="absolute -bottom-4 -right-4 w-24 h-24 object-contain pointer-events-none"
                    style={{ filter: 'drop-shadow(0 0 14px rgba(245,158,11,0.5))', opacity: 0.7 }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/login" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
              <Wallet size={16} /> Connect Wallet to start
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="px-6 py-8 mt-4"
        style={{ borderTop: '1px solid rgba(163,255,71,0.08)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={MOONSTERS_LOGO} alt="MoonMap" className="w-7 h-7 rounded-full object-cover"
              style={{ border: '1px solid rgba(163,255,71,0.3)' }}
              onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }} />
            <span className="font-monster text-sm text-white">MOONMAP</span>
            <span className="text-xs font-mono" style={{ color: 'rgba(113,113,122,0.5)' }}>· Not financial advice</span>
          </div>
          <div className="flex gap-6 text-xs font-mono" style={{ color: 'rgba(113,113,122,0.6)' }}>
            <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors" style={{ color: '#a3ff47' }}>
              Get a Moonster ↗
            </a>
            <a href="https://x.com/MoonstersX" target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors">
              @MoonstersX
            </a>
            <Link href="/pricing" className="hover:text-white transition-colors">Access tiers</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
