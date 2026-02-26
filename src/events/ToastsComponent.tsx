import * as bootstrap from 'bootstrap'
import { ReactElement, useEffect, useState } from 'react'
import { useNewNotificationListener } from './Events'

type ToastData = {
    shown: boolean
    makkedToRemoval: boolean
    element: ReactElement
}
let toastsCounter = 0

export const ToastsComponent = (): ReactElement => {
    const [toasts, setToasts] = useState<ToastData[]>([])

    useNewNotificationListener((payload) => {
        const key = `toast-id-${toastsCounter++}`
        const newToast = (
            <div className="toast" key={key} id={key} role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                    <strong className="me-auto">Message</strong>
                    <small className="text-body-secondary">just now</small>
                    <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div className="toast-body">{payload.message}</div>
            </div>
        )

        setToasts(toasts.concat({ shown: false, element: newToast, makkedToRemoval: false }))
    })

    const removeToast = (toast: ToastData) => {
        setToasts((toasts) =>
            toasts.map((item) => {
                if (item.element.key === toast.element.key) {
                    item.makkedToRemoval = true
                }
                return item
            })
        )
    }

    useEffect(() => {
        const newToasts = toasts
            .filter((toast) => !toast.makkedToRemoval)
            .map((toast) => {
                if (!toast.shown) {
                    const toastElement = document.getElementById(toast.element.key!)!
                    bootstrap.Toast.getOrCreateInstance(toastElement).show()
                    toastElement.addEventListener('hidden.bs.toast', () => {
                        removeToast(toast)
                    })
                }
                toast.shown = true
                return toast
            })
        if (newToasts.length !== toasts.length) {
            setToasts(newToasts)
        }
    }, [toasts])

    return (
        <div aria-live="polite" aria-atomic="true" className="position-relative">
            {/* <!-- Position it: -->
        <!-- - `.toast-container` for spacing between toasts -->
        <!-- - `top-0` & `end-0` to position the toasts in the upper right corner -->
        <!-- - `.p-3` to prevent the toasts from sticking to the edge of the container  --> */}
            <div className="toast-container top-0 end-0 p-2">{toasts.map((toast) => toast.element)}</div>
        </div>
    )
}
