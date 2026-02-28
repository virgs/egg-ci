import Modal from 'react-bootstrap/Modal'
import { ReactElement, useState } from 'react'
import DOMPurify from 'dompurify'
import './ConfirmationModalComponent.scss'
import { Button } from 'react-bootstrap'

type Props = {
    message: string
    onConfirm: () => void | Promise<void>
    onCancel?: () => void | Promise<void>
}

const ConfirmationModalComponent = ({ message, onConfirm, onCancel = () => {} }: Props): ReactElement => {
    const [show, setShow] = useState(true)

    const sanitizedHTML = DOMPurify.sanitize(message)

    const createMarkup = () => {
        return { __html: sanitizedHTML }
    }

    const onCancelButton = () => {
        setShow(false)
        onCancel()
    }

    const onConfirmButton = () => {
        setShow(false)
        onConfirm()
    }
    return (
        <Modal
            backdrop={'static'}
            keyboard={true}
            onExit={onCancelButton}
            onEscapeKeyDown={onCancelButton}
            show={show}
            onHide={onCancelButton}
        >
            <Modal.Header closeButton>
                <Modal.Title>Confirm operation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p dangerouslySetInnerHTML={createMarkup()}></p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onCancelButton} variant="outline-secondary">
                    Cancel
                </Button>
                <Button onClick={onConfirmButton} variant="primary">
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
export default ConfirmationModalComponent
