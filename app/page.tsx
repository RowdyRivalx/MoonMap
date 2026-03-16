'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BarChart3, Shield, Zap, Globe, TrendingUp, Users, Wallet } from 'lucide-react'

const MOONSTER_IMG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={MOONSTER_IMG} alt="MoonMap" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg tracking-tight">MoonMap</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              Access tiers
            </Link>
            <Link href="/login" className="btn-primary text-sm inline-flex items-center gap-2">
              <Wallet size={14} /> Connect Wallet
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-violet-400 bg-violet-400/10 border border-violet-400/20 px-3 py-1 rounded-full mb-6">
              <Zap size={12} />
              Live data · Updated every 60 seconds
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              DAO intelligence,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                built for Moonsters
              </span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
              Track governance tokens, monitor treasury flows, analyze sentiment, and stay ahead
              of proposals — your NFT unlocks your tier automatically.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/login" className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3">
                <Wallet size={16} /> Connect Wallet <ArrowRight size={16} />
              </Link>
              <a
                href="https://www.tensor.trade/trade/moonsters"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2 text-base px-6 py-3"
              >
                Get a Moonster
              </a>
            </div>
            <p className="text-sm text-zinc-500 mt-4">Any wallet gets a free 10-minute trial · NFT holders get permanent access</p>
          </div>

          {/* Moonster hero image */}
          <div className="relative flex justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 bg-violet-600/20 rounded-3xl blur-3xl" />
              <img
                src={MOONSTER_IMG}
                alt="Moonster #7952"
                className="relative w-full h-full object-cover rounded-3xl border border-violet-600/30 shadow-2xl"
              />
              {/* Tier badge overlay */}
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Blue Chain · Tier 3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-y border-zinc-800 py-6 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'DAOs tracked', value: '20+' },
            { label: 'Data points / day', value: '2.4M' },
            { label: 'News sources', value: '180+' },
            { label: 'Active users', value: '1,200+' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-zinc-100">{s.value}</div>
              <div className="text-sm text-zinc-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to govern smarter</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Built specifically for Moonsters holders and DeFi power users.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'Live Price & Volume', desc: 'Real-time market data for all major governance tokens. Sparklines, 24h/7d changes, market cap, and volume in one glance.' },
              { icon: Shield, title: 'Governance Tracker', desc: 'Never miss a proposal. Track active votes, quorum progress, and outcome history across Snapshot, Tally, and on-chain governance.', tier: 'Tier 3' },
              { icon: Globe, title: 'Sentiment Analysis', desc: 'Aggregated sentiment from 180+ crypto news sources and social signals. Know the mood before you vote or trade.', tier: 'Tier 2' },
              { icon: BarChart3, title: 'Treasury Analytics', desc: 'Monitor DAO treasury inflows, outflows, and asset composition. Spot diversification risks and liquidity runway.', tier: 'Tier 3' },
              { icon: Users, title: 'Developer Activity', desc: 'GitHub commit frequency, PR merges, and contributor growth — the on-chain fundamentals of protocol health.', tier: 'Tier 3' },
              { icon: Zap, title: 'Custom Watchlist', desc: 'Build a personal watchlist of the DAOs you care about. Base holders get 10 tokens, Tier 2+ unlocks 50.' },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-violet-600/20 border border-violet-600/30 rounded-lg flex items-center justify-center">
                    <f.icon size={18} className="text-violet-400" />
                  </div>
                  {f.tier && (
                    <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">
                      {f.tier}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="px-6 py-16 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Moonster = your access</h2>
            <p className="text-zinc-400">The rarer the trait, the more powerful your dashboard.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Trial', sub: 'Any wallet', color: 'border-zinc-700', badge: 'bg-zinc-800 text-zinc-400', features: ['10 min free trial', 'Tier 1 access', 'No NFT needed'] },
              { label: 'Tier 1', sub: 'Any Moonster', color: 'border-emerald-600/40', badge: 'bg-emerald-400/10 text-emerald-400', features: ['Live prices', '10 token watchlist', 'News feed'] },
              { label: 'Tier 2', sub: 'Special traits', color: 'border-violet-600/40', badge: 'bg-violet-400/10 text-violet-400', features: ['50 token watchlist', 'Full sentiment', 'News filters'] },
              { label: 'Tier 3', sub: 'Blue Chain', color: 'border-amber-600/40 bg-amber-600/5', badge: 'bg-amber-400/10 text-amber-400', features: ['Governance alerts', 'Treasury analytics', 'Dev metrics'] },
            ].map((t) => (
              <div key={t.label} className={`card p-5 text-left ${t.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.badge}`}>{t.label}</span>
                  {t.label === 'Tier 3' && (
                    <img src={MOONSTER_IMG} alt="Moonster" className="w-6 h-6 rounded-full object-cover border border-amber-400/30" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 mb-3">{t.sub}</p>
                <ul className="space-y-1.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <span className="text-emerald-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/login" className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3">
              <Wallet size={16} /> Connect Wallet to start
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <img src={MOONSTER_IMG} alt="MoonMap" className="w-5 h-5 rounded object-cover" />
            MoonMap · Not financial advice
          </div>
          <div className="flex gap-6">
            <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Get a Moonster</a>
            <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Access tiers</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
