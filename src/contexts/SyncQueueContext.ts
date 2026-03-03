import { createContext, useContext } from 'react'
import { SyncQueue } from '../project/SyncQueue'

export const SyncQueueContext = createContext<SyncQueue | null>(null)

export const useSyncQueue = (): SyncQueue | null => {
    return useContext(SyncQueueContext)
}

