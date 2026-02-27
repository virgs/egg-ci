import { createContext } from 'react'
import { Config } from '../config'

export const ConfigContext = createContext<Config | undefined>(undefined)
