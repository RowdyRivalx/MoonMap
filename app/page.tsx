'use client'
import Link from 'next/link'
import {
  ArrowRight, BarChart3, Shield, Zap, Globe, TrendingUp, Users, Wallet,
  CheckCircle2, Star, Activity, Lock, ChevronRight
} from 'lucide-react'

const MOONSTER_PORTRAIT  = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'
const MOONSTERS_LOGO     = 'https://moonsters.io/wp-content/uploads/2023/01/moonsters-logo-1.png'
const MOONSTERS_WORDMARK = 'https://moonsters.io/wp-content/uploads/2023/01/Moonsters-With-Eyes-1-300x53.png'
const CHAR_1 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-1.png'
const CHAR_2 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-2.png'
const CHAR_4 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-4.png'
const NEON_BG = 'https://moonsters.io/wp-content/uploads/2023/01/Image-3.jpg'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav
        style={{
          borderBottom: '1px solid rgba(139,92,246,0.12)',
          background: 'rgba(4,1,14,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
        className="sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full blur-md" style={{ background: 'rgba(163,255,71,0.3)' }} />
              <img
                src={MOONSTERS_LOGO}
                alt="MoonMap"
                className="relative w-9 h-9 rounded-full object-cover"
                style={{ border: '1.5px solid rgba(163,255,71,0.45)' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }}
              />
            </div>
            <span className="font-monster text-lg text-white tracking-wide">MOONMAP</span>
            <span
              className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(163,255,71,0.08)', border: '1px solid rgba(163,255,71,0.22)', color: '#a3ff47' }}>
              DAO INTEL
            </span>
          </div>
          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-mono transition-colors hover:text-white"
              style={{ color: 'rgba(167,139,250,0.6)' }}>Features</a>
            <a href="#tiers" className="text-sm font-mono transition-colors hover:text-white"
              style={{ color: 'rgba(167,139,250,0.6)' }}>Access</a>
            <Link href="/pricing" className="text-sm font-mono transition-colors hover:text-white"
              style={{ color: 'rgba(167,139,250,0.6)' }}>Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden sm:block text-sm font-mono transition-colors"
              style={{ color: 'rgba(163,139,250,0.65)' }}>
              Tiers
            </Link>
            <Link href="/login" className="btn-primary text-sm inline-flex items-center gap-2">
              <Wallet size={14} /> Connect Wallet
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        {/* Hero background layers */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Neon image texture */}
          <img src={NEON_BG} alt="" className="w-full h-full object-cover"
            style={{ opacity: 0.07, filter: 'saturate(2.5) hue-rotate(10deg)' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          {/* Radial glow from top center */}
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 90% 55% at 50% 0%, rgba(124,58,237,0.22) 0%, transparent 65%)' }} />
          {/* Fade to body at bottom */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(4,1,14,0.3) 0%, rgba(4,1,14,0.0) 35%, rgba(4,1,14,0.0) 55%, rgba(4,1,14,0.95) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div className="animate-rise">
            {/* Wordmark eyebrow */}
            <div
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
              style={{ background: 'rgba(163,255,71,0.07)', border: '1px solid rgba(163,255,71,0.22)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#a3ff47] animate-pulse" />
              <img src={MOONSTERS_WORDMARK} alt="Moonsters" className="h-4 object-contain"
                style={{ filter: 'invert(1) brightness(2)' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <span className="text-xs font-mono font-bold" style={{ color: '#a3ff47', letterSpacing: '0.08em' }}>
                OFFICIAL INTEL HUB
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              DAO intelligence{' '}
              <br className="hidden md:block" />
              <span className="monster-title">built for Moonsters</span>
            </h1>

            <p className="text-lg md:text-xl mb-10 leading-relaxed max-w-lg"
              style={{ color: 'rgba(232,228,248,0.65)' }}>
              Track governance tokens, monitor treasury flows, analyze sentiment —
              your NFT unlocks your tier automatically. No setup required.
            </p>

            {/* CTA group */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link href="/login"
                className="btn-primary inline-flex items-center gap-2 text-base px-7 py-3.5 pulse-glow">
                <Wallet size={17} /> Connect Wallet <ArrowRight size={16} />
              </Link>
              <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
                className="btn-neon inline-flex items-center gap-2 text-base px-7 py-3.5">
                Get a Moonster <ChevronRight size={16} />
              </a>
            </div>

            {/* Trust micro-copy */}
            <div className="flex flex-wrap items-center gap-5 text-xs font-mono"
              style={{ color: 'rgba(113,113,122,0.7)' }}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} style={{ color: '#34d399' }} /> Any wallet
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} style={{ color: '#34d399' }} /> 10-min free trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} style={{ color: '#a3ff47' }} /> NFT = permanent access
              </span>
            </div>
          </div>

          {/* Right: character showcase */}
          <div className="relative flex justify-center select-none animate-rise-2">
            <div className="relative w-80 h-80 md:w-[420px] md:h-[420px]">
              {/* Ambient glow halo */}
              <div className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 50% 60%, rgba(163,255,71,0.12) 0%, rgba(255,45,120,0.08) 40%, rgba(124,58,237,0.07) 70%, transparent 100%)',
                  filter: 'blur(20px)',
                  transform: 'scale(1.2)',
                }} />

              {/* Rotating orbit ring */}
              <div className="absolute inset-8 rounded-full border animate-spin-slow pointer-events-none"
                style={{ borderColor: 'rgba(139,92,246,0.15)', borderStyle: 'dashed' }} />

              {/* Character 2 — top left, lime glow */}
              <img src={CHAR_2} alt="Moonster"
                className="absolute object-contain animate-rise"
                style={{
                  width: '52%', top: '0%', left: '-8%',
                  filter: 'drop-shadow(0 0 26px rgba(163,255,71,0.7))',
                  animationDelay: '0.15s',
                }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }} />

              {/* Character 1 — center hero, orange glow */}
              <img src={CHAR_1} alt="Moonster"
                className="absolute object-contain animate-rise"
                style={{
                  width: '68%', top: '12%', left: '16%', zIndex: 2,
                  filter: 'drop-shadow(0 0 36px rgba(255,107,43,0.75))',
                  animationDelay: '0s',
                }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }} />

              {/* Character 4 — bottom right, magenta glow */}
              <img src={CHAR_4} alt="Moonster"
                className="absolute object-contain animate-rise-2"
                style={{
                  width: '46%', bottom: '2%', right: '-8%',
                  filter: 'drop-shadow(0 0 22px rgba(255,45,120,0.70))',
                  animationDelay: '0.25s',
                }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }} />

              {/* Floating data chip — portfolio value */}
              <div
                className="absolute -top-3 right-0 z-10 px-3 py-1.5 rounded-xl font-mono text-xs font-bold animate-float"
                style={{
                  background: 'rgba(10,5,25,0.92)',
                  border: '1px solid rgba(52,211,153,0.4)',
                  color: '#34d399',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 0 16px rgba(52,211,153,0.2)',
                  animationDelay: '0.5s',
                }}>
                <Activity size={10} className="inline mr-1" />Portfolio +18.4%
              </div>

              {/* Floating data chip — governance */}
              <div
                className="absolute -left-6 top-1/2 z-10 px-3 py-1.5 rounded-xl font-mono text-xs font-bold animate-float"
                style={{
                  background: 'rgba(10,5,25,0.92)',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: '#a78bfa',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 0 16px rgba(139,92,246,0.2)',
                  animationDelay: '1.2s',
                }}>
                <Shield size={10} className="inline mr-1" />3 Active Votes
              </div>

              {/* Blue Chain tier badge */}
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-10 font-mono text-xs font-bold px-4 py-2 rounded-full glow-tier3"
                style={{
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.5)',
                  color: '#fbbf24',
                }}>
                ⛓ Blue Chain &middot; MOONSTER
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-8 relative overflow-hidden"
        style={{
          borderTop: '1px solid rgba(139,92,246,0.1)',
          borderBottom: '1px solid rgba(139,92,246,0.1)',
          background: 'rgba(8,4,18,0.7)',
          backdropFilter: 'blur(16px)',
        }}>
        {/* Subtle shimmer strip */}
        <div className="absolute top-0 left-0 right-0 h-px shimmer" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'DAOs tracked',      value: '20+',    color: '#a3ff47',  glow: 'rgba(163,255,71,0.2)' },
            { label: 'Data points / day', value: '2.4M',   color: '#a78bfa',  glow: 'rgba(139,92,246,0.2)' },
            { label: 'News sources',      value: '180+',   color: '#ff6ea8',  glow: 'rgba(255,45,120,0.2)' },
            { label: 'Active users',      value: '1,200+', color: '#22d3ee',  glow: 'rgba(6,182,212,0.2)' },
          ].map((s) => (
            <div key={s.label} className="slide-up">
              <div
                className="text-3xl md:text-4xl font-monster mb-1"
                style={{ color: s.color, textShadow: `0 0 30px ${s.glow}` }}>
                {s.value}
              </div>
              <div className="text-xs font-mono uppercase tracking-widest"
                style={{ color: 'rgba(113,113,122,0.65)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-28">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="section-badge mb-5 mx-auto">
              <Star size={10} /> Platform Features
            </div>
            <h2 className="font-monster text-3xl md:text-5xl mb-5 leading-tight"
              style={{ color: 'white' }}>
              Everything you need to{' '}
              <span className="gradient-text-lime">govern smarter</span>
            </h2>
            <p className="font-mono text-sm max-w-md mx-auto"
              style={{ color: 'rgba(163,139,250,0.6)' }}>
              Built for Moonsters holders and DeFi power users on Solana.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: TrendingUp,
                title: 'Live Price & Volume',
                desc: 'Real-time market data for governance tokens. Sparklines, 24h/7d changes, market cap, and volume at a glance.',
                glow: 'rgba(34,211,238,0.12)',
                border: 'rgba(34,211,238,0.22)',
                iconCol: '#22d3ee',
                accent: 'rgba(34,211,238,0.5)',
              },
              {
                icon: Shield,
                title: 'Governance Tracker',
                desc: 'Never miss a proposal. Active votes, quorum progress, and outcome history across Snapshot, Tally, and on-chain.',
                tier: 'MOONSTER',
                glow: 'rgba(245,158,11,0.12)',
                border: 'rgba(245,158,11,0.22)',
                iconCol: '#fbbf24',
                accent: 'rgba(245,158,11,0.5)',
              },
              {
                icon: Globe,
                title: 'Sentiment Analysis',
                desc: 'Aggregated sentiment from 180+ crypto news sources. Know the mood before you vote or trade.',
                tier: 'Moon Walker',
                glow: 'rgba(139,92,246,0.12)',
                border: 'rgba(139,92,246,0.22)',
                iconCol: '#a78bfa',
                accent: 'rgba(139,92,246,0.5)',
              },
              {
                icon: BarChart3,
                title: 'Treasury Analytics',
                desc: 'Monitor DAO treasury inflows, outflows, and asset composition. Spot diversification risks and liquidity runway.',
                tier: 'MOONSTER',
                glow: 'rgba(245,158,11,0.12)',
                border: 'rgba(245,158,11,0.22)',
                iconCol: '#fbbf24',
                accent: 'rgba(245,158,11,0.5)',
              },
              {
                icon: Users,
                title: 'Developer Activity',
                desc: 'GitHub commits, PR merges, and contributor growth — the on-chain fundamentals of protocol health.',
                tier: 'MOONSTER',
                glow: 'rgba(245,158,11,0.12)',
                border: 'rgba(245,158,11,0.22)',
                iconCol: '#fbbf24',
                accent: 'rgba(245,158,11,0.5)',
              },
              {
                icon: Zap,
                title: 'Custom Watchlist',
                desc: 'Build a personal watchlist. Astronauts get 10 tokens, Moon Walker+ unlocks 50 with full history.',
                glow: 'rgba(163,255,71,0.10)',
                border: 'rgba(163,255,71,0.20)',
                iconCol: '#a3ff47',
                accent: 'rgba(163,255,71,0.5)',
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className={`card p-6 transition-all duration-300 hover:-translate-y-2 slide-up-${(i % 3) + 1}`}
                style={{
                  borderColor: f.border,
                  boxShadow: `0 0 30px ${f.glow}, 0 4px 24px rgba(0,0,0,0.4)`,
                }}>
                {/* Icon + tier row */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${f.glow}`,
                      border: `1px solid ${f.border}`,
                      boxShadow: `0 0 16px ${f.glow}`,
                    }}>
                    <f.icon size={19} style={{ color: f.iconCol }} />
                  </div>
                  {f.tier && (
                    <span className={`trait-badge ${f.tier === 'MOONSTER' ? 'trait-badge-gold' : 'trait-badge-violet'}`}>
                      {f.tier === 'MOONSTER' ? '⛓' : '☄'} {f.tier}
                    </span>
                  )}
                </div>
                {/* Accent line */}
                <div className="mb-4 h-px" style={{ background: `linear-gradient(90deg, ${f.accent}, transparent)` }} />
                <h3 className="font-bold mb-2 text-white text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(161,161,170,0.75)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tiers ────────────────────────────────────────────────────────────── */}
      <section id="tiers" className="px-6 py-24 relative overflow-hidden"
        style={{ borderTop: '1px solid rgba(139,92,246,0.1)', background: 'rgba(6,3,16,0.75)' }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <div className="section-badge mb-5 mx-auto">
              <Lock size={10} /> Access Tiers
            </div>
            <h2 className="font-monster text-3xl md:text-5xl mb-4 text-white leading-tight">
              Your Moonster ={' '}
              <span className="gradient-text">your access</span>
            </h2>
            <p className="font-mono text-sm max-w-sm mx-auto"
              style={{ color: 'rgba(163,139,250,0.6)' }}>
              The rarer the trait, the more powerful your dashboard.
            </p>
          </div>

          {/* Tier cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              {
                label: 'Trial',
                sub: 'Any wallet',
                border: 'rgba(63,63,70,0.5)',
                bg: 'rgba(9,9,11,0.85)',
                headerBg: 'rgba(63,63,70,0.2)',
                color: '#71717a',
                features: ['10 min free trial', 'Astronaut access', 'No NFT needed'],
                icon: '🌑',
                highlight: false,
              },
              {
                label: 'Astronaut',
                sub: 'Any Moonster',
                border: 'rgba(52,211,153,0.3)',
                bg: 'rgba(16,185,129,0.04)',
                headerBg: 'rgba(52,211,153,0.08)',
                color: '#34d399',
                features: ['Live prices', '10 token watchlist', 'News feed'],
                icon: '🌙',
                highlight: false,
              },
              {
                label: 'Moon Walker',
                sub: 'Special traits',
                border: 'rgba(139,92,246,0.38)',
                bg: 'rgba(139,92,246,0.05)',
                headerBg: 'rgba(139,92,246,0.1)',
                color: '#a78bfa',
                features: ['50 token watchlist', 'Full sentiment', 'News filters'],
                icon: '☄️',
                highlight: false,
              },
              {
                label: 'MOONSTER',
                sub: 'Blue Chain trait',
                border: 'rgba(245,158,11,0.45)',
                bg: 'rgba(245,158,11,0.05)',
                headerBg: 'rgba(245,158,11,0.12)',
                color: '#fbbf24',
                features: ['Governance alerts', 'Treasury analytics', 'Dev metrics'],
                icon: '⛓️',
                highlight: true,
                character: CHAR_1,
              },
            ].map((t) => (
              <div
                key={t.label}
                className={`relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${t.highlight ? 'glow-tier3' : ''}`}
                style={{
                  border: `1px solid ${t.border}`,
                  background: t.bg,
                  backdropFilter: 'blur(20px)',
                }}>
                {/* Card top accent bar */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${t.color}, transparent)` }} />

                {/* Header */}
                <div className="px-5 pt-4 pb-3" style={{ background: t.headerBg }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl">{t.icon}</span>
                    <span className="font-monster text-base" style={{ color: t.color }}>{t.label}</span>
                    {t.highlight && (
                      <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '9px' }}>
                        TOP TIER
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono" style={{ color: 'rgba(113,113,122,0.6)' }}>{t.sub}</p>
                </div>

                {/* Features */}
                <div className="px-5 py-4">
                  <ul className="space-y-2.5">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-xs"
                        style={{ color: 'rgba(212,212,216,0.9)' }}>
                        <CheckCircle2 size={13} style={{ color: t.color, flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* MOONSTER character art peek */}
                {t.character && (
                  <img src={t.character} alt="Moonster"
                    className="absolute -bottom-5 -right-5 w-28 h-28 object-contain pointer-events-none"
                    style={{ filter: 'drop-shadow(0 0 16px rgba(245,158,11,0.55))', opacity: 0.65 }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/login"
              className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4 pulse-glow">
              <Wallet size={17} /> Connect Wallet to start <ArrowRight size={16} />
            </Link>
            <p className="text-xs font-mono mt-4" style={{ color: 'rgba(113,113,122,0.5)' }}>
              Tier detected automatically from your wallet — no staking, no forms.
            </p>
          </div>
        </div>
      </section>

      {/* ── Social proof / CTA strip ─────────────────────────────────────────── */}
      <section className="px-6 py-16" style={{ background: 'rgba(8,4,18,0.6)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
            style={{ background: 'rgba(163,255,71,0.06)', border: '1px solid rgba(163,255,71,0.18)' }}>
            <span className="text-xs font-mono font-bold" style={{ color: '#a3ff47' }}>
              LIVE ON SOLANA MAINNET
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#a3ff47] animate-pulse" />
          </div>
          <h2 className="font-monster text-3xl md:text-4xl text-white mb-5 leading-tight">
            Ready to navigate the{' '}
            <span className="monster-title">moon map?</span>
          </h2>
          <p className="text-base mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'rgba(232,228,248,0.6)' }}>
            Connect your Solana wallet — your NFT holdings are detected instantly
            and your tier is unlocked automatically.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login"
              className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
              <Wallet size={17} /> Connect Wallet
            </Link>
            <a href="https://www.tensor.trade/trade/moonsters"
              target="_blank" rel="noopener noreferrer"
              className="btn-neon inline-flex items-center gap-2 text-base px-8 py-3.5">
              Get a Moonster ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="px-6 py-8"
        style={{ borderTop: '1px solid rgba(139,92,246,0.1)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img src={MOONSTERS_LOGO} alt="MoonMap" className="w-7 h-7 rounded-full object-cover"
              style={{ border: '1px solid rgba(163,255,71,0.35)' }}
              onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }} />
            <span className="font-monster text-sm text-white">MOONMAP</span>
            <span className="text-xs font-mono" style={{ color: 'rgba(113,113,122,0.5)' }}>
              Not financial advice
            </span>
            <span className="text-xs font-mono" style={{ color: 'rgba(113,113,122,0.35)' }}>
              · by @ROWDY
            </span>
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
            <Link href="/pricing" className="hover:text-white transition-colors">
              Access tiers
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
