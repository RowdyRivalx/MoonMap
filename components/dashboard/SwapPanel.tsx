'use client'
import { useEffect, useState, useRef } from 'react'
import { X, ExternalLink, Loader2, AlertTriangle } from 'lucide-react'

const MROCKS_MINT = 'HQtEXUxNh3Hb3BgQpqW4XCq3fcHr5JYiGABu61Fg82No'
const SOL_MINT    = 'So11111111111111111111111111111111111111112'
const USDC_MINT   = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const MOONSTER_IMG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'

const TOKEN_MINTS: Record<string, string> = {
  uniswap: '8FU95xFJhUUkyyCLU13HSzDLs7oC4QZdXQHL6SCeab36',
  aave: '3vAs4D1WE6Na4tCgt4BApgFfENDCect3y9PX2fMqDLp',
  'lido-dao': 'HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332d',
  decentraland: 'EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv',
  'the-sandbox': 'FnKE9n6aGjQoNWRBZXy4RW6LZVao7qwBonUbiD7edUmZ',
  'axie-infinity': 'HNpdP2rL6FR3gHdoTSBLBEUPrCCTDdVEsMjRMpAGnJzF',
  apecoin: '4vMsoUT2BWatFweudnQM1xedRLfJgJ7hswhcpz4xgBTy',
  sushi: 'SUSHiMMjX1argfn7WB2bXcKGiMMPTmM9RFVcPHc9FFNA',
}

function getOutputMint(tokenId: string): string {
  if (!tokenId) return MROCKS_MINT
  if (tokenId.length > 30) return tokenId  // already a mint address
  return TOKEN_MINTS[tokenId] || USDC_MINT
}

interface Props {
  token: any | null
  onClose: () => void
}

export default function SwapPanel({ token, onClose }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const activeTokenId = useRef<string | null>(null)
  const containerId = 'jup-swap-container'

  useEffect(() => {
    if (!token) return

    // Token changed — need full reinit
    const outputMint = getOutputMint(token.id)
    activeTokenId.current = token.id
    setStatus('loading')
    setErrorMsg('')

    const rpc = process.env.NEXT_PUBLIC_HELIUS_API_KEY
      ? `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
      : 'https://api.mainnet-beta.solana.com'

    function doInit() {
      // Verify token hasn't changed while we were waiting
      if (activeTokenId.current !== token.id) return

      try {
        const jup = (window as any).Jupiter
        if (!jup?.init) throw new Error('Jupiter not available')

        // Always close previous instance first
        try { jup._close?.() } catch {}
        try { jup.close?.() } catch {}

        // Clear the container DOM completely
        const container = document.getElementById(containerId)
        if (container) container.innerHTML = ''

        // Small delay to let DOM clear
        setTimeout(() => {
          if (activeTokenId.current !== token.id) return
          try {
            ;(window as any).Jupiter.init({
              displayMode: 'integrated',
              integratedTargetId: containerId,
              endpoint: rpc,
              formProps: {
                initialInputMint: SOL_MINT,
                initialOutputMint: outputMint,
                fixedInputMint: false,
                fixedOutputMint: false,
              },
              onSuccess: ({ txid }: any) => console.log('Swap success:', txid),
              onSwapError: ({ error }: any) => console.error('Swap error:', error),
            })
            setStatus('ready')
          } catch (e: any) {
            setErrorMsg(e?.message || 'Failed to initialize')
            setStatus('error')
          }
        }, 100)
      } catch (e: any) {
        setErrorMsg(e?.message || 'Jupiter not loaded')
        setStatus('error')
      }
    }

    const SCRIPT_ID = 'jupiter-terminal-script'
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    if (existing && (window as any).Jupiter?.init) {
      doInit()
    } else if (existing) {
      // Script tag exists but not loaded yet
      const onLoad = () => { existing.removeEventListener('load', onLoad); setTimeout(doInit, 100) }
      existing.addEventListener('load', onLoad)
    } else {
      // Load fresh
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://terminal.jup.ag/main-v3.js'
      script.crossOrigin = 'anonymous'
      script.onload = () => setTimeout(doInit, 200)
      script.onerror = () => {
        setErrorMsg('Could not load Jupiter. Check your connection.')
        setStatus('error')
      }
      document.head.appendChild(script)
    }

    return () => {
      // Mark this effect as stale so pending inits don't proceed
      activeTokenId.current = null
    }
  }, [token?.id])

  // Close Jupiter when panel closes
  useEffect(() => {
    if (!token) {
      try { (window as any).Jupiter?._close?.() } catch {}
      try { (window as any).Jupiter?.close?.() } catch {}
      const container = document.getElementById(containerId)
      if (container) container.innerHTML = ''
    }
  }, [token])

  if (!token) return null

  const outputMint = getOutputMint(token.id)
  const jupUrl = `https://jup.ag/swap/SOL-${outputMint}`
  const tokenImg = token.image || MOONSTER_IMG

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 cursor-pointer backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.75)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col"
        style={{
          background: 'rgba(7,3,18,0.98)',
          borderLeft: '1px solid rgba(139,92,246,0.25)',
          boxShadow: '-20px 0 60px rgba(124,58,237,0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(139,92,246,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-md" style={{ background: 'rgba(124,58,237,0.3)' }} />
              <img
                src={tokenImg} alt={token.name}
                className="relative w-9 h-9 rounded-full object-cover"
                style={{ border: '1.5px solid rgba(139,92,246,0.35)' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG }}
              />
            </div>
            <div>
              <p className="font-bold text-sm text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                {token.name || 'Swap'}
              </p>
              <p className="text-xs" style={{ color: 'rgba(139,92,246,0.7)', fontFamily: 'Space Mono, monospace' }}>
                {token.symbol?.toUpperCase()} · Jupiter DEX
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={jupUrl} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'rgba(113,113,122,0.7)' }}
              title="Open in Jupiter"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'rgba(113,113,122,0.7)' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Jupiter container */}
        <div className="flex-1 relative overflow-hidden">
          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
              style={{ background: 'rgba(7,3,18,0.98)' }}>
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: 'rgba(124,58,237,0.2)' }} />
                <img src={tokenImg} alt=""
                  className="relative w-16 h-16 rounded-full object-cover"
                  style={{ border: '2px solid rgba(139,92,246,0.3)', opacity: 0.8 }}
                  onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG }}
                />
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1" style={{ color: '#a78bfa' }}>
                  <Loader2 size={15} className="animate-spin" />
                  <span className="text-sm">Loading {token.symbol?.toUpperCase()} swap…</span>
                </div>
                <p className="text-xs" style={{ color: 'rgba(113,113,122,0.5)' }}>
                  Connecting to Jupiter DEX
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 p-6 text-center"
              style={{ background: 'rgba(7,3,18,0.98)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertTriangle size={20} style={{ color: '#f87171' }} />
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">Swap terminal unavailable</p>
                <p className="text-xs mb-4" style={{ color: 'rgba(113,113,122,0.7)' }}>
                  {errorMsg || 'Could not load Jupiter'}
                </p>
              </div>
              <a
                href={jupUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary text-sm flex items-center gap-2 px-5 py-2.5"
              >
                Open in Jupiter <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Jupiter mounts here */}
          <div id={containerId} className="w-full h-full" style={{ minHeight: '500px' }} />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(139,92,246,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(113,113,122,0.5)' }}>
            Powered by{' '}
            <a href="https://jup.ag" target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(139,92,246,0.6)' }}>
              Jupiter
            </a>
          </p>
          <a href={jupUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs flex items-center gap-1"
            style={{ color: 'rgba(139,92,246,0.6)' }}>
            Open full app <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </>
  )
}
