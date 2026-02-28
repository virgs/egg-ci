import Modal from 'react-bootstrap/Modal'
import { ReactElement } from 'react'
import DOMPurify from 'dompurify'
import { Button } from 'react-bootstrap'

type Props = {
    show: boolean
    message: string
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmationModalComponent = ({ show, message, onConfirm, onCancel }: Props): ReactElement => {
    const sanitizedHTML = DOMPurify.sanitize(message)

    return (
        <Modal backdrop="static" keyboard show={show} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm operation</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onConfirm}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ConfirmationModalComponent
