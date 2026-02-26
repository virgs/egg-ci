import { createContext } from 'react'
import { ProjectData } from '../domain-models/models'

export const ProjectContext = createContext<ProjectData | undefined>(undefined)
