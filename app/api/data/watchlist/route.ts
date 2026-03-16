import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTierFeatures } from '@/lib/tiers'

async function getDb() {
  try {
    const { db } = await import('@/lib/db')
    // Test connection
    await db.$queryRaw`SELECT 1`
    return db
  } catch {
    return null
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  if (!db) return NextResponse.json({ items: [] })
  const items = await db.watchlistItem.findMany({ where: { userId: session.user.id }, orderBy: { addedAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { coinId, coinName, coinSymbol } = await req.json()
  const db = await getDb()
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  const tier = (session.user as any).tier || 'free'
  const features = getTierFeatures(tier)
  const count = await db.watchlistItem.count({ where: { userId: session.user.id } })
  if (count >= features.watchlistLimit) {
    return NextResponse.json({ error: `Watchlist limit reached (${features.watchlistLimit} tokens for your tier).` }, { status: 403 })
  }
  const item = await db.watchlistItem.upsert({
    where: { userId_coinId: { userId: session.user.id, coinId } },
    create: { userId: session.user.id, coinId, coinName, coinSymbol },
    update: {},
  })
  return NextResponse.json({ item }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { coinId } = await req.json()
  const db = await getDb()
  if (!db) return NextResponse.json({ success: true })
  await db.watchlistItem.deleteMany({ where: { userId: session.user.id, coinId } })
  return NextResponse.json({ success: true })
}
