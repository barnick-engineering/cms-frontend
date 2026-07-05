import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Project } from '@/interface/projectInterface'

type ProjectDialogType = 'create' | 'edit' | 'delete'

type ProjectContextType = {
  open: ProjectDialogType | null
  setOpen: (str: ProjectDialogType | null) => void
  currentRow: Project | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Project | null>>
}

const ProjectContext = React.createContext<ProjectContextType | null>(null)

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ProjectDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Project | null>(null)

  return (
    <ProjectContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProjectContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProjects = () => {
  const ctx = React.useContext(ProjectContext)
  if (!ctx) throw new Error('useProjects has to be used within <ProjectsProvider>')
  return ctx
}
