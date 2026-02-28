import { useContext } from 'react'
import { ConfirmationContextType } from './ConfirmationModalProvider.tsx'
import { ConfirmationContext } from './ConfirmationContext.tsx'

export const useConfirmationModal = (): ConfirmationContextType => {
    const ctx = useContext(ConfirmationContext)
    if (!ctx) {
        throw new Error('useConfirmation must be used inside ConfirmationModalProvider')
    }
    return ctx
}