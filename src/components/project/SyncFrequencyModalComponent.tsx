import { ReactElement, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { DEFAULT_SYNC_FREQUENCY_MS } from '../../domain-models/models'
import './SyncFrequencyModalComponent.scss'

export type SyncFrequencyOption = { label: string; value: number }

export const SYNC_FREQUENCY_OPTIONS: SyncFrequencyOption[] = [
    { label: '30 seconds', value: 30_000 },
    { label: '1 minute', value: 60_000 },
    { label: '2 minutes', value: 2 * 60_000 },
    { label: '5 minutes', value: 5 * 60_000 },
    { label: '10 minutes', value: 10 * 60_000 },
]

type Props = {
    show: boolean
    currentFrequency: number
    projectLabel: string
    onSave: (frequency: number) => void
    onCancel: () => void
}

export const SyncFrequencyModalComponent = (props: Props): ReactElement => {
    const initial = props.currentFrequency ?? DEFAULT_SYNC_FREQUENCY_MS
    const [selected, setSelected] = useState<number>(initial)

    const handleSave = (): void => {
        props.onSave(selected)
    }

    return (
        <Modal show={props.show} onHide={props.onCancel} centered size="sm">
            <Modal.Header closeButton>
                <Modal.Title className="fs-6">Sync frequency</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted sync-frequency-modal__label mb-2">
                    {props.projectLabel}
                </p>
                <Form.Select
                    value={selected}
                    onChange={(e) => setSelected(Number(e.target.value))}
                    size="sm"
                >
                    {SYNC_FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </Form.Select>
            </Modal.Body>
            <Modal.Footer>
                <Button size="sm" variant="outline-secondary" onClick={props.onCancel}>
                    Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleSave}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

