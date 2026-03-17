import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTierFeatures } from '@/lib/tiers'

// CIPHER: simple in-memory rate limiter for watchlist mutations
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 30 // max 30 mutations per minute per user

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

// CIPHER: input validation helpers
const COIN_ID_RE = /^[a-z0-9-]{1,100}$/
const COIN_NAME_RE = /^[\w\s\-\.]{1,100}$/
const COIN_SYMBOL_RE = /^[A-Z0-9]{1,20}$/i

function isValidCoinId(id: string): boolean { return COIN_ID_RE.test(id) }
function isValidCoinName(name: string): boolean { return COIN_NAME_RE.test(name) }
function isValidCoinSymbol(sym: string): boolean { return COIN_SYMBOL_RE.test(sym) }

async function getDb() {
  try {
    const { db } = await import('@/lib/db')
    await db.$queryRaw`SELECT 1`
    return db
  } catch {
    return null
  }
}

// Resolve the real DB user id from the session, creating the user record if needed.
// Handles the case where the DB was down at login time and session.user.id is the
// wallet address fallback instead of a proper CUID.
async function resolveUserId(sessionUser: any, db: NonNullable<Awaited<ReturnType<typeof getDb>>>): Promise<string | null> {
  const wallet = sessionUser?.wallet
  if (!wallet) return null
  const tier = sessionUser?.tier || 'free'
  try {
    const user = await db.user.upsert({
      where: { walletAddress: wallet },
      create: { walletAddress: wallet, tier },
      update: { lastSeen: new Date() },
    })
    return user.id
  } catch {
    return null
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as any
  if (!sessionUser?.wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  if (!db) return NextResponse.json({ items: [] })
  const userId = await resolveUserId(sessionUser, db)
  if (!userId) return NextResponse.json({ items: [] })
  const items = await db.watchlistItem.findMany({ where: { userId }, orderBy: { addedAt: 'desc' } })
  // CIPHER: strip internal userId from response — clients don't need it
  const safeItems = items.map(({ userId: _uid, ...rest }) => rest)
  return NextResponse.json({ items: safeItems })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as any
  if (!sessionUser?.wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // CIPHER: rate limit mutations
  if (!checkRateLimit(`watchlist:${sessionUser.wallet}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { coinId, coinName, coinSymbol } = body as any

  // CIPHER: validate and sanitize inputs
  if (!coinId || !isValidCoinId(String(coinId))) {
    return NextResponse.json({ error: 'Invalid coinId' }, { status: 400 })
  }
  if (!coinName || !isValidCoinName(String(coinName))) {
    return NextResponse.json({ error: 'Invalid coinName' }, { status: 400 })
  }
  if (!coinSymbol || !isValidCoinSymbol(String(coinSymbol))) {
    return NextResponse.json({ error: 'Invalid coinSymbol' }, { status: 400 })
  }

  const db = await getDb()
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  const userId = await resolveUserId(sessionUser, db)
  if (!userId) return NextResponse.json({ error: 'Could not resolve user' }, { status: 500 })
  const tier = sessionUser.tier || 'free'
  const features = getTierFeatures(tier)
  const count = await db.watchlistItem.count({ where: { userId } })
  if (count >= features.watchlistLimit) {
    return NextResponse.json({ error: `Watchlist limit reached (${features.watchlistLimit} tokens for your tier).` }, { status: 403 })
  }
  const item = await db.watchlistItem.upsert({
    where: { userId_coinId: { userId, coinId } },
    create: { userId, coinId: String(coinId), coinName: String(coinName), coinSymbol: String(coinSymbol) },
    update: {},
  })
  // CIPHER: strip internal userId from response
  const { userId: _uid, ...safeItem } = item
  return NextResponse.json({ item: safeItem }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as any
  if (!sessionUser?.wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // CIPHER: rate limit mutations
  if (!checkRateLimit(`watchlist:${sessionUser.wallet}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { coinId } = body as any

  // CIPHER: validate coinId before using in DB query
  if (!coinId || !isValidCoinId(String(coinId))) {
    return NextResponse.json({ error: 'Invalid coinId' }, { status: 400 })
  }

  const db = await getDb()
  if (!db) return NextResponse.json({ success: true })
  const userId = await resolveUserId(sessionUser, db)
  if (!userId) return NextResponse.json({ success: true })
  await db.watchlistItem.deleteMany({ where: { userId, coinId } })
  return NextResponse.json({ success: true })
}
