import { ReactElement } from 'react'
import './ConfirmationModalComponent.scss'

type Props = {
    message: string
    onConfirm: () => void
    onCancel?: () => void
}

export const ConfirmationModalComponent = ({ message, onConfirm, onCancel = () => {} }: Props): ReactElement => {
    return (
        <>
            <div className="modal-backdrop fade show" onClick={onCancel} />
            <div className="modal d-block" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body py-4">
                            <p className="mb-0">{message}</p>
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
        </>
    )
}
