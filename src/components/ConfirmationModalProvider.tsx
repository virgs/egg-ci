import { ReactNode, useCallback, useRef, useState } from 'react'
import ConfirmationModalComponent from './ConfirmationModalComponent'
import { ConfirmationContext as ConfirmationContext1 } from './ConfirmationContext.tsx'

type ConfirmOptions = {
    message: string
}

export type ConfirmationContextType = (options: ConfirmOptions) => Promise<boolean>

export const ConfirmationModalProvider = ({ children }: { children: ReactNode }) => {
    const [show, setShow] = useState(false)
    const [message, setMessage] = useState('')
    const resolver = useRef<((value: boolean) => void) | undefined>(undefined)

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        setMessage(options.message)
        setShow(true)

        return new Promise<boolean>((resolve) => {
            resolver.current = resolve
        })
    }, [])

    const handleConfirm = () => {
        setShow(false)
        resolver.current?.(true)
    }

    const handleCancel = () => {
        setShow(false)
        resolver.current?.(false)
    }

    return (
        <ConfirmationContext1 value={confirm}>
            {children}

            <ConfirmationModalComponent
                show={show}
                message={message}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmationContext1>
    )
}

