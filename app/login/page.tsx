'use client'
import { useState, useEffect } from 'react'
import { Wallet, Loader2, AlertCircle, Zap } from 'lucide-react'
import bs58 from 'bs58'

const MOONSTER_IMG  = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'
const MOONSTER_JPEG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafkreiafltcgo34ly6up3b2qymc3wie75dsiorcgkiafrpdvsaygoe2cmy'

function buildMsg(wallet: string) {
  return ['MoonMap wants you to sign in with your Solana wallet.','',`Wallet: ${wallet}`,`Timestamp: ${Date.now()}`,'','This request will not trigger any blockchain transaction or cost any fees.'].join('\n')
}
function getProvider() {
  if (typeof window === 'undefined') return null
  const w = window as any
  if (w.phantom?.solana?.isPhantom) return w.phantom.solana
  if (w.solana?.isPhantom) return w.solana
  if (w.backpack) return w.backpack
  if (w.solflare?.isSolflare) return w.solflare
  return null
}

export default function LoginPage() {
  const [status, setStatus] = useState<'idle'|'connecting'|'signing'|'loading'>('idle')
  const [error, setError] = useState('')
  const [hasWallet, setHasWallet] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true); setTimeout(() => setHasWallet(!!getProvider()), 400) }, [])

  async function handleClick() {
    if (status !== 'idle') return
    setError('')
    const provider = getProvider()
    if (!provider) { setError('No Solana wallet found. Please install Phantom.'); return }
    try {
      setStatus('connecting')
      let addr: string
      try {
        const resp = await provider.connect()
        addr = resp?.publicKey?.toString() || provider.publicKey?.toString()
      } catch (e: any) { if (e.code===4001){setError('Connection cancelled.');setStatus('idle');return} throw e }
      if (!addr) { setError('No wallet address.'); setStatus('idle'); return }
      setStatus('signing')
      await new Promise(r => setTimeout(r, 300))
      const message = buildMsg(addr)
      const msgBytes = new TextEncoder().encode(message)
      let sig: string
      try {
        const result = await provider.signMessage(msgBytes, 'utf8')
        const sigBytes = result.signature instanceof Uint8Array ? result.signature : new Uint8Array(Object.values(result.signature as any))
        sig = bs58.encode(sigBytes)
      } catch (e: any) { if (e.code===4001||e.message?.includes('reject')){setError('Signature cancelled.');setStatus('idle');return} throw e }
      setStatus('loading')
      const csrfRes = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfRes.json()
      const body = new URLSearchParams({ wallet: addr, message, signature: sig, csrfToken, callbackUrl: '/dashboard', json: 'true' })
      const res = await fetch('/api/auth/callback/credentials', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
      const data = await res.json()
      if (data.url?.includes('/dashboard')) { window.location.replace('/dashboard') }
      else { setError('Authentication failed. Please try again.'); setStatus('idle') }
    } catch (err: any) { setError(err.message || 'Something went wrong.'); setStatus('idle') }
  }

  const btnLabel = { idle: 'Connect Wallet', connecting: 'Connecting…', signing: 'Sign in Phantom…', loading: 'Entering MoonMap…' }[status]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[580px] h-[580px] rounded-full border animate-spin-slow" style={{ borderColor: 'rgba(124,58,237,0.08)' }} />
        <div className="absolute w-[760px] h-[760px] rounded-full border" style={{ borderColor: 'rgba(6,182,212,0.05)', animation: 'spin-slow 44s linear infinite reverse' }} />
        <div className="absolute w-[420px] h-[420px] rounded-full border border-dashed" style={{ borderColor: 'rgba(245,158,11,0.06)', animation: 'spin-slow 16s linear infinite' }} />
      </div>

      {/* Large ambient Moonster behind card */}
      <div className="absolute pointer-events-none select-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1 }}>
        <div className="w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(124,58,237,0.18)' }} />
        <img src={MOONSTER_IMG} alt="" className="absolute inset-0 w-80 h-80 rounded-full object-cover opacity-[0.07] blur-sm" />
      </div>

      <div className={`w-full max-w-[340px] relative transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ zIndex: 10 }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-rise">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: 'rgba(124,58,237,0.5)' }} />
            <div className="moonster-ring">
              <img src={MOONSTER_IMG} alt="MoonMap"
                className="relative w-12 h-12 object-cover"
                style={{ borderRadius: '50%', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_JPEG }} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-none text-glow-purple font-display">MoonMap</h1>
            <p className="text-[9px] tracking-widest mt-0.5 font-mono" style={{ color: 'rgba(139,92,246,0.55)' }}>DAO INTELLIGENCE</p>
          </div>
        </div>

        {/* Main card */}
        <div className="card p-6 text-center animate-rise-1" style={{ background: 'rgba(6,3,18,0.92)', borderColor: 'rgba(139,92,246,0.18)' }}>
          {/* Moonster with spinning ring */}
          <div className="relative w-24 h-24 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: 'rgba(124,58,237,0.2)', filter: 'blur(16px)' }} />
            <div className="moonster-ring w-24 h-24">
              <img src={MOONSTER_IMG} alt="Moonster #7952"
                className="w-24 h-24 object-cover"
                style={{ borderRadius: '50%', boxShadow: '0 0 40px rgba(124,58,237,0.35)' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_JPEG }} />
            </div>
          </div>

          <h2 className="text-lg font-bold text-white mb-1 font-display">Enter the Moon</h2>
          <p className="text-xs mb-5 leading-relaxed" style={{ color: 'rgba(161,161,170,0.8)' }}>
            Connect your Solana wallet. Moonsters NFT holders get automatic tier access.
          </p>

          {status === 'signing' && (
            <div className="mb-4 px-3 py-2.5 rounded-xl border" style={{ background: 'rgba(124,58,237,0.08)', borderColor: 'rgba(139,92,246,0.28)' }}>
              <p className="text-xs animate-pulse flex items-center gap-1.5 justify-center" style={{ color: '#a78bfa' }}>
                <Zap size={11}/> Open Phantom and approve the signature
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl border flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' }}>
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
              <span className="text-xs text-left">{error}</span>
            </div>
          )}

          <button onClick={handleClick} disabled={status !== 'idle'} className="w-full btn-primary py-3 justify-center gap-2 text-sm">
            {status !== 'idle' ? <><Loader2 size={14} className="animate-spin"/>{btnLabel}</> : <><Wallet size={14}/>{btnLabel}</>}
          </button>

          {!hasWallet && (
            <div className="mt-3 px-3 py-2.5 rounded-xl border" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
              <p className="text-[10px] font-mono mb-1.5" style={{ color: 'rgba(251,191,36,0.8)' }}>NO WALLET DETECTED</p>
              <div className="flex gap-3 justify-center">
                <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: '#a78bfa' }}>Phantom ↗</a>
                <a href="https://backpack.app" target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: '#a78bfa' }}>Backpack ↗</a>
              </div>
            </div>
          )}

          <p className="text-[9px] font-mono mt-4" style={{ color: 'rgba(99,85,140,0.6)' }}>Signing is free — no transaction is sent</p>
        </div>

        {/* Tier info card */}
        <div className="card mt-3 p-4 animate-rise-2" style={{ background: 'rgba(5,2,14,0.75)', borderColor: 'rgba(139,92,246,0.1)' }}>
          <p className="text-[9px] font-bold font-mono mb-3" style={{ color: 'rgba(139,92,246,0.5)' }}>ACCESS TIERS</p>
          <div className="space-y-2.5">
            {[
              { dot: 'bg-zinc-600',  label: 'No NFT',                desc: '10 min free trial — Astronaut access' },
              { dot: 'bg-emerald-500', label: 'Any Moonster',        desc: 'Astronaut — prices, news, 10 slots' },
              { dot: 'bg-violet-500',  label: 'Special traits',      desc: 'Moon Walker — sentiment + 50 slots' },
              { dot: 'bg-amber-400',   label: 'Blue Chain',          desc: 'MOONSTER — governance & treasury' },
            ].map(({ dot, label, desc }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                <span className="text-[10px] font-medium text-zinc-300">{label}</span>
                <span className="text-[10px] font-mono ml-auto" style={{ color: 'rgba(99,85,140,0.8)' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center animate-rise-3">
          <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
            className="text-[10px] font-mono transition-colors" style={{ color: 'rgba(139,92,246,0.45)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(139,92,246,0.45)')}>
            Get a Moonster on Tensor →
          </a>
        </div>
      </div>
    </div>
  )
}
