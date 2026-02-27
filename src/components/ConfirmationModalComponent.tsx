import { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import './ConfirmationModalComponent.scss'

type Props = {
    message: string
    onConfirm: () => void
    onCancel?: () => void
}

export const ConfirmationModalComponent = ({ message, onConfirm, onCancel = () => {} }: Props): ReactElement => {
    return createPortal(
        <>
            <div className="modal-backdrop fade show" onClick={onCancel} />
            <div className="modal d-block confirmation-modal" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content text-center">
                        <div className="modal-body py-4">
                            <p className="mb-0 fs-3">{message}</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={onCancel}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={onConfirm}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    )
}
