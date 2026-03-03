import { useEffect, useState } from 'react'
import { SyncQueue } from '../project/SyncQueue'
import { formatDuration } from './Time'

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
            const remaining = nextSync - Date.now()
            if (remaining <= 0) {
                setLabel('syncing…')
                return
            }
            const formatted = formatDuration(remaining, 1)
            setLabel(formatted ? `in ${formatted}` : 'soon')
        }

        update()
        const intervalId = setInterval(update, 1000)
        const unsubscribe = syncQueue.subscribe(update)

        return () => {
            clearInterval(intervalId)
            unsubscribe()
        }
    }, [syncQueue, projectId])

    return label
}

