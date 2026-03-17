'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Check, X, Wallet, ExternalLink } from 'lucide-react'

const MOONSTERS_LOGO    = 'https://moonsters.io/wp-content/uploads/2023/01/moonsters-logo-1.png'
const MOONSTER_PORTRAIT = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'
const CHAR_1 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-1.png'
const CHAR_2 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-2.png'
const CHAR_4 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-4.png'

const TIERS = [
  {
    icon: '🌑',
    label: 'Trial',
    sub: 'Any wallet',
    color: '#71717a',
    border: 'rgba(63,63,70,0.5)',
    bg: 'rgba(9,9,11,0.8)',
    badgeBg: 'rgba(63,63,70,0.3)',
    badgeBorder: 'rgba(63,63,70,0.5)',
    requirement: 'No NFT required — just keep making new wallets like a gremlin every 10 minutes. We see you. 👀',
    requirementNote: 'Enjoy the grind fren',
    cta: null,
    character: null,
  },
  {
    icon: '🌙',
    label: 'Astronaut',
    sub: 'Any Moonster NFT',
    color: '#34d399',
    border: 'rgba(16,185,129,0.35)',
    bg: 'rgba(16,185,129,0.04)',
    badgeBg: 'rgba(16,185,129,0.1)',
    badgeBorder: 'rgba(16,185,129,0.3)',
    requirement: 'Hold any Moonster',
    requirementNote: 'Permanent access',
    cta: { label: 'Get a Moonster', href: 'https://www.tensor.trade/trade/moonsters', external: true },
    character: CHAR_4,
  },
  {
    icon: '☄️',
    label: 'Moon Walker',
    sub: 'Special traits',
    color: '#a78bfa',
    border: 'rgba(139,92,246,0.4)',
    bg: 'rgba(139,92,246,0.05)',
    badgeBg: 'rgba(139,92,246,0.12)',
    badgeBorder: 'rgba(139,92,246,0.35)',
    requirement: 'Coin Gecko Comet, Dark Orc Red Beard, Green Tri Eyes Bulging, or Blue Bug Tri Eyes',
    requirementNote: 'Trait-gated',
    cta: { label: 'Browse Moon Walkers', href: 'https://www.tensor.trade/trade/moonsters', external: true },
    character: CHAR_2,
  },
  {
    icon: '⛓️',
    label: 'MOONSTER',
    sub: 'Blue Chain trait',
    color: '#fbbf24',
    border: 'rgba(245,158,11,0.45)',
    bg: 'rgba(245,158,11,0.05)',
    badgeBg: 'rgba(245,158,11,0.12)',
    badgeBorder: 'rgba(245,158,11,0.4)',
    requirement: 'Blue Chain accessory trait',
    requirementNote: 'Rarest tier',
    cta: { label: 'Browse MOONSTERs', href: 'https://www.tensor.trade/trade/moonsters', external: true },
    character: CHAR_1,
  },
]

const FEATURES = [
  { label: 'Live token prices', trial: true,  tier1: true,  tier2: true,  tier3: true  },
  { label: 'News feed',         trial: true,  tier1: true,  tier2: true,  tier3: true  },
  { label: 'Watchlist tokens',  trial: '5',   tier1: '10',  tier2: '50',  tier3: '50'  },
  { label: 'News articles',     trial: '5',   tier1: '20',  tier2: '100', tier3: '∞'   },
  { label: 'News filters',      trial: false, tier1: false, tier2: true,  tier3: true  },
  { label: 'Full sentiment',    trial: false, tier1: false, tier2: true,  tier3: true  },
  { label: 'Governance alerts', trial: false, tier1: false, tier2: false, tier3: true  },
  { label: 'Treasury analytics',trial: false, tier1: false, tier2: false, tier3: true  },
  { label: 'Developer metrics', trial: false, tier1: false, tier2: false, tier3: true  },
]

function Cell({ value, color }: { value: boolean | string; color: string }) {
  if (value === true)  return <Check size={15} style={{ color, margin: '0 auto' }} />
  if (value === false) return <X size={13} style={{ color: 'rgba(63,63,70,0.5)', margin: '0 auto' }} />
  return <span className="text-xs font-mono font-bold" style={{ color }}>{value}</span>
}

export default function PricingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(163,255,71,0.1)', background: 'rgba(4,1,14,0.85)', backdropFilter: 'blur(20px)' }}
        className="sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full blur-md" style={{ background: 'rgba(163,255,71,0.25)' }} />
              <img src={MOONSTERS_LOGO} alt="MoonMap" className="relative w-9 h-9 rounded-full object-cover"
                style={{ border: '1.5px solid rgba(163,255,71,0.4)' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_PORTRAIT }} />
            </div>
            <span className="font-monster text-lg text-white tracking-wide">MOONMAP</span>
          </Link>
          {session ? (
            <Link href="/dashboard" className="btn-secondary text-sm">Dashboard</Link>
          ) : (
            <Link href="/login" className="btn-primary text-sm inline-flex items-center gap-2">
              <Wallet size={13} /> Connect Wallet
            </Link>
          )}
        </div>
      </nav>

      <div className="px-6 py-16 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(163,255,71,0.06)', border: '1px solid rgba(163,255,71,0.2)' }}>
            <span className="text-xs font-mono" style={{ color: '#a3ff47' }}>ACCESS TIERS</span>
          </div>
          <h1 className="font-monster text-4xl md:text-5xl text-white mb-4">
            Your Moonster =<br />
            <span style={{ color: '#a3ff47' }}>your access level</span>
          </h1>
          <p className="text-lg font-mono max-w-xl mx-auto" style={{ color: 'rgba(163,139,250,0.7)' }}>
            No subscriptions. No payments. Your NFT unlocks your tier automatically — forever.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {TIERS.map((t) => (
            <div key={t.label} className="card p-6 relative overflow-hidden flex flex-col"
              style={{ borderColor: t.border, background: t.bg }}>

              {/* Character art */}
              {t.character && (
                <img src={t.character} alt={t.label}
                  className="absolute -bottom-3 -right-3 w-28 h-28 object-contain pointer-events-none select-none"
                  style={{ filter: `drop-shadow(0 0 16px ${t.border})`, opacity: 0.55 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}

              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{t.icon}</span>
                  <span className="font-monster text-lg" style={{ color: t.color }}>{t.label}</span>
                </div>
                <p className="text-xs font-mono mb-4" style={{ color: 'rgba(113,113,122,0.7)' }}>{t.sub}</p>

                <div className="mt-auto pt-4 space-y-2 border-t" style={{ borderColor: t.badgeBorder }}>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(212,212,216,0.75)' }}>{t.requirement}</p>
                  <span className="inline-block text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{ background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, color: t.color }}>
                    {t.requirementNote}
                  </span>
                </div>

                {t.cta && (
                  <a href={t.cta.href} target={t.cta.external ? '_blank' : undefined}
                    rel={t.cta.external ? 'noopener noreferrer' : undefined}
                    className="mt-4 block text-center py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, color: t.color }}>
                    {t.cta.label} {t.cta.external && <ExternalLink size={10} className="inline ml-1" />}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="card overflow-hidden mb-16">
          <div className="p-6 pb-4" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
            <h2 className="font-monster text-xl text-white">Feature comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
                  <th className="text-left px-6 py-3 text-xs font-mono" style={{ color: 'rgba(113,113,122,0.6)', width: '40%' }}>Feature</th>
                  {TIERS.map(t => (
                    <th key={t.label} className="px-4 py-3 text-center">
                      <span className="text-xs font-mono font-bold" style={{ color: t.color }}>{t.icon} {t.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr key={f.label}
                    style={{ borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(139,92,246,0.06)' : 'none',
                      background: i % 2 === 0 ? 'rgba(139,92,246,0.02)' : 'transparent' }}>
                    <td className="px-6 py-3 text-xs font-mono" style={{ color: 'rgba(212,212,216,0.8)' }}>{f.label}</td>
                    <td className="px-4 py-3 text-center"><Cell value={f.trial}  color={TIERS[0].color} /></td>
                    <td className="px-4 py-3 text-center"><Cell value={f.tier1}  color={TIERS[1].color} /></td>
                    <td className="px-4 py-3 text-center"><Cell value={f.tier2}  color={TIERS[2].color} /></td>
                    <td className="px-4 py-3 text-center"><Cell value={f.tier3}  color={TIERS[3].color} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="font-mono text-sm mb-6" style={{ color: 'rgba(113,113,122,0.6)' }}>
            Already hold a Moonster? Connect your wallet and your tier is detected automatically.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/login" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
              <Wallet size={16} /> Connect Wallet
            </Link>
            <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
              className="btn-neon inline-flex items-center gap-2 text-base px-8 py-3">
              Get a Moonster <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 mt-8" style={{ borderTop: '1px solid rgba(163,255,71,0.08)' }}>
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
              className="hover:text-white transition-colors">@MoonstersX</a>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
