// app/api/data/watchlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getUserSubscription } from '@/lib/stripe'
import { FREE_TIER_LIMIT, PRO_TIER_LIMIT } from '@/types'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await db.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: 'desc' },
  })

  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { coinId, coinName, coinSymbol } = await req.json()

  const sub = await getUserSubscription(session.user.id)
  const limit = sub.tier === 'pro' ? PRO_TIER_LIMIT : FREE_TIER_LIMIT

  const count = await db.watchlistItem.count({ where: { userId: session.user.id } })
  if (count >= limit) {
    return NextResponse.json(
      { error: `Watchlist limit reached (${limit}). ${sub.tier === 'free' ? 'Upgrade to Pro for up to 50 tokens.' : ''}` },
      { status: 403 }
    )
  }

  const item = await db.watchlistItem.upsert({
    where: { userId_coinId: { userId: session.user.id, coinId } },
    create: { userId: session.user.id, coinId, coinName, coinSymbol },
    update: {},
  })

  return NextResponse.json({ item }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { coinId } = await req.json()

  await db.watchlistItem.deleteMany({
    where: { userId: session.user.id, coinId },
  })

  return NextResponse.json({ success: true })
}
