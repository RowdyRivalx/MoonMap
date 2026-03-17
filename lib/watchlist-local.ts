// Client-side localStorage watchlist — used as fallback when DB is unavailable.

const KEY = 'moonmap-watchlist'

export interface LocalWatchlistItem {
  coinId: string
  coinName: string
  coinSymbol: string
}

export function localWatchlistGet(): LocalWatchlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function localWatchlistAdd(item: LocalWatchlistItem) {
  const items = localWatchlistGet()
  if (items.some(i => i.coinId === item.coinId)) return
  items.push(item)
  try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
}

export function localWatchlistRemove(coinId: string) {
  const items = localWatchlistGet().filter(i => i.coinId !== coinId)
  try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
}

export function localWatchlistIds(): Set<string> {
  return new Set(localWatchlistGet().map(i => i.coinId))
}
