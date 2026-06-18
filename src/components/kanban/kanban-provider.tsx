import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { KanbanTask } from '@/interface/kanbanInterface'

type KanbanDialogType = 'create' | 'view' | 'edit' | 'delete'

type KanbanContextType = {
  open: KanbanDialogType | null
  setOpen: (str: KanbanDialogType | null) => void
  currentTask: KanbanTask | null
  setCurrentTask: React.Dispatch<React.SetStateAction<KanbanTask | null>>
}

const KanbanContext = React.createContext<KanbanContextType | null>(null)

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<KanbanDialogType>(null)
  const [currentTask, setCurrentTask] = useState<KanbanTask | null>(null)

  return (
    <KanbanContext.Provider
      value={{ open, setOpen, currentTask, setCurrentTask }}
    >
      {children}
    </KanbanContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useKanbanContext = () => {
  const context = React.useContext(KanbanContext)
  if (!context) {
    throw new Error('useKanbanContext must be used within <KanbanProvider>')
  }
  return context
}
