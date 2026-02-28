import { ReactElement, useState } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'
import { useNewNotificationListener } from './Events'

type ToastData = {
    id: number
    message: string
}

let toastsCounter = 0

export const ToastsComponent = (): ReactElement => {
    const [toasts, setToasts] = useState<ToastData[]>([])

    useNewNotificationListener((payload) => {
        setToasts((prev) => [...prev, { id: toastsCounter++, message: payload.message }])
    })

    const handleClose = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return (
        <ToastContainer position="top-end" className="p-2">
            {toasts.map((toast) => (
                <Toast key={toast.id} autohide delay={3000} onClose={() => handleClose(toast.id)}>
                    <Toast.Header>
                        <strong className="me-auto">Message</strong>
                        <small className="text-body-secondary">just now</small>
                    </Toast.Header>
                    <Toast.Body>{toast.message}</Toast.Body>
                </Toast>
            ))}
        </ToastContainer>
    )
}
