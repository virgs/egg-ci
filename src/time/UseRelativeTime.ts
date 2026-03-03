import { useEffect, useState } from 'react'
import { formatDuration } from './Time'

const UPDATE_INTERVAL_MS = 10_000

const computeRelativeTime = (timestamp?: string): string | undefined => {
    if (!timestamp) return undefined
    const ms = Date.now() - new Date(timestamp).getTime()
    const formatted = formatDuration(ms, 1)
    return formatted ? `${formatted} ago` : 'just now'
}

export const useRelativeTime = (timestamp?: string): string | undefined => {
    const [relativeTime, setRelativeTime] = useState<string | undefined>(() => computeRelativeTime(timestamp))

    useEffect(() => {
        if (!timestamp) return

        const immediateId = setTimeout(() => {
            setRelativeTime(computeRelativeTime(timestamp))
        }, 0)
        const intervalId = setInterval(() => {
            setRelativeTime(computeRelativeTime(timestamp))
        }, UPDATE_INTERVAL_MS)
        return () => {
            clearTimeout(immediateId)
            clearInterval(intervalId)
        }
    }, [timestamp])

    return relativeTime
}
