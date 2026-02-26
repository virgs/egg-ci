import { useEffect, useState } from 'react'
import { formatDuration } from './Time'

export const useRelativeTime = (timestamp?: string): string | undefined => {
    const [relativeTime, setRelativeTime] = useState<string | undefined>()

    useEffect(() => {
        const id = setTimeout(() => {
            if (!timestamp) {
                setRelativeTime(undefined)
                return
            }
            const ms = Date.now() - new Date(timestamp).getTime()
            const formatted = formatDuration(ms, 1)
            setRelativeTime(formatted ? `${formatted} ago` : 'just now')
        }, 0)
        return () => clearTimeout(id)
    }, [timestamp])

    return relativeTime
}
