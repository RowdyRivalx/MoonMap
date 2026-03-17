import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTierFeatures } from '@/lib/tiers'

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
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as any
  if (!sessionUser?.wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { coinId, coinName, coinSymbol } = await req.json()
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
    create: { userId, coinId, coinName, coinSymbol },
    update: {},
  })
  return NextResponse.json({ item }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as any
  if (!sessionUser?.wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { coinId } = await req.json()
  const db = await getDb()
  if (!db) return NextResponse.json({ success: true })
  const userId = await resolveUserId(sessionUser, db)
  if (!userId) return NextResponse.json({ success: true })
  await db.watchlistItem.deleteMany({ where: { userId, coinId } })
  return NextResponse.json({ success: true })
}
