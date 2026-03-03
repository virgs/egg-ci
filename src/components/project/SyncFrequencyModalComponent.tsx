import { ReactElement, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { DEFAULT_SYNC_FREQUENCY_MS } from '../../domain-models/models'
import { SYNC_FREQUENCY_OPTIONS } from './syncFrequencyOptions'
import './SyncFrequencyModalComponent.scss'

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
    const currentLabel = SYNC_FREQUENCY_OPTIONS.find((o) => o.value === props.currentFrequency)?.label ?? 'unknown'

    const handleSave = (): void => {
        props.onSave(selected)
    }

    return (
        <Modal show={props.show} onHide={props.onCancel} centered size="sm">
            <Modal.Header closeButton>
                <Modal.Title className="fs-6">Sync frequency</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted sync-frequency-modal__label mb-1">
                    {props.projectLabel}
                </p>
                <p className="text-muted sync-frequency-modal__current mb-2">
                    Current: <strong>{currentLabel}</strong>
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

