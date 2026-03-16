// app/pricing/page.tsx
'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Check, Crown, Zap, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { PLANS } from '@/lib/stripe'

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (!session) {
      router.push('/login?mode=signup')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })
      const { url, error } = await res.json()
      if (error) { alert(error); return }
      window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  const price = interval === 'yearly' ? PLANS.pro.yearlyPrice : PLANS.pro.monthlyPrice
  const perMonth = interval === 'yearly' ? Math.round(PLANS.pro.yearlyPrice / 12) : PLANS.pro.monthlyPrice

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">DAOScope</span>
          </Link>
          {session ? (
            <Link href="/dashboard" className="btn-secondary text-sm">Dashboard</Link>
          ) : (
            <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100">Sign in</Link>
          )}
        </div>
      </nav>

      <div className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple pricing</h1>
            <p className="text-zinc-400 text-lg">Start free. Upgrade when you need more.</p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-2 mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              <button
                onClick={() => setInterval('monthly')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${interval === 'monthly' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval('yearly')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${interval === 'yearly' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Yearly
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Save 33%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-1">Free</h2>
              <div className="text-4xl font-bold mb-1">$0</div>
              <p className="text-zinc-400 text-sm mb-6">Forever free, no card needed</p>
              <ul className="space-y-3 mb-8">
                {PLANS.free.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
                {PLANS.free.limitations.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-500">
                    <span className="mt-0.5 flex-shrink-0 text-xs">✕</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={session ? '/dashboard' : '/login?mode=signup'}
                className="btn-secondary w-full text-center text-sm block py-2.5"
              >
                {session ? 'Go to dashboard' : 'Get started free'}
              </Link>
            </div>

            {/* Pro */}
            <div className="card p-6 border-violet-600/50 bg-violet-600/5 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="text-xs bg-violet-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                  <Zap size={10} /> 7-day trial
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <Crown size={15} className="text-violet-400" />
                <h2 className="text-lg font-semibold">Pro</h2>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold">
                  ${interval === 'yearly' ? perMonth : price}
                </span>
                <span className="text-zinc-400 text-sm">/ mo</span>
              </div>
              {interval === 'yearly' && (
                <p className="text-xs text-zinc-400 mb-1">
                  Billed ${PLANS.pro.yearlyPrice}/yr · saves ${PLANS.pro.monthlyPrice * 12 - PLANS.pro.yearlyPrice}/yr
                </p>
              )}
              <p className="text-zinc-400 text-sm mb-6">Everything in Free, plus:</p>
              <ul className="space-y-3 mb-8">
                {PLANS.pro.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-200">
                    <Check size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full btn-primary py-2.5 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Crown size={14} />
                {loading ? 'Redirecting…' : 'Start free trial'}
              </button>
              <p className="text-center text-xs text-zinc-500 mt-2">
                No charge for 7 days · Cancel anytime
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-center mb-8">Common questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'What happens after the free trial?',
                  a: "After 7 days your card is charged automatically. You can cancel any time before then and you won't be charged."
                },
                {
                  q: 'Can I cancel at any time?',
                  a: "Yes — cancel from the Settings page and your Pro access continues until the end of your billing period."
                },
                {
                  q: 'What data sources do you use?',
                  a: 'We pull live prices from CoinGecko and news/sentiment from CryptoPanic, which aggregates 180+ crypto news outlets.'
                },
                {
                  q: 'Is this financial advice?',
                  a: 'No. DAOScope provides data and analytics tools. All investment decisions are your own.'
                },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-zinc-800 pb-6">
                  <h3 className="text-sm font-medium mb-2">{q}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
