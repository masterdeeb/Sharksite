import {
  Unsubscribe,
  ensureLocalDbSeeded,
  getKv,
  setKv,
  onCollectionChange,
} from './local-db'

const ANALYTICS_KV_KEY = 'analytics'

export async function getPageViews(): Promise<number> {
  if (typeof window === 'undefined') return 0
  await ensureLocalDbSeeded()
  const stored = await getKv<{ count?: number }>(ANALYTICS_KV_KEY)
  return Number(stored?.count ?? 0)
}

export function subscribeToPageViews(
  onData: (count: number) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  if (typeof window === 'undefined') return () => {}

  let active = true
  const load = async () => {
    try {
      const count = await getPageViews()
      if (active) onData(count)
    } catch (err) {
      if (active && onError) onError(err)
    }
  }

  load()
  const unsub = onCollectionChange('analytics', load)

  return () => {
    active = false
    unsub()
  }
}

export async function incrementPageViews(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const current = await getPageViews()
    await setKv(ANALYTICS_KV_KEY, { count: current + 1 }, 'analytics')
  } catch (err) {
    console.error('Error incrementing local page views:', err)
  }
}
