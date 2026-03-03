export type SyncFrequencyOption = { label: string; value: number }

export const SYNC_FREQUENCY_OPTIONS: SyncFrequencyOption[] = [
    { label: '30 seconds', value: 30_000 },
    { label: '1 minute', value: 60_000 },
    { label: '2 minutes', value: 2 * 60_000 },
    { label: '5 minutes', value: 5 * 60_000 },
    { label: '10 minutes', value: 10 * 60_000 },
]

