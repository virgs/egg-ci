import { useEffect, useState } from 'react'
import { SyncQueue } from '../project/SyncQueue'

type CountdownBucket = { threshold: number; label: string }

const BUCKETS: CountdownBucket[] = [
    { threshold: 30_000, label: '< 30s' },
    { threshold: 60_000, label: '< 1m' },
    { threshold: 2 * 60_000, label: '< 2m' },
    { threshold: 5 * 60_000, label: '< 5m' },
    { threshold: 10 * 60_000, label: '< 10m' },
    { threshold: Infinity, label: '> 10m' },
]

const UPDATE_INTERVAL_MS = 5_000

export const formatCountdownLabel = (remainingMs: number): string => {
    if (remainingMs <= 0) return 'syncing…'
    const bucket = BUCKETS.find((b) => remainingMs <= b.threshold)
    return bucket?.label ?? '> 10m'
}

export const useSyncCountdown = (syncQueue: SyncQueue | null, projectId: string): string | undefined => {
    const [label, setLabel] = useState<string | undefined>()

    useEffect(() => {
        if (!syncQueue) return

        const update = (): void => {
            const nextSync = syncQueue.getNextSyncTime(projectId)
            if (nextSync === undefined) {
                setLabel(undefined)
                return
            }
            setLabel(formatCountdownLabel(nextSync - Date.now()))
        }

        update()
        const intervalId = setInterval(update, UPDATE_INTERVAL_MS)
        const unsubscribe = syncQueue.subscribe(update)

        return () => {
            clearInterval(intervalId)
            unsubscribe()
        }
    }, [syncQueue, projectId])

    return label
}

