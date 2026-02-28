import { createContext } from 'react'
import { ConfirmationContextType } from './ConfirmationModalProvider.tsx'

export const ConfirmationContext = createContext<ConfirmationContextType | null>(null)
