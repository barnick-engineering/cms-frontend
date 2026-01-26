import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { WorkOrder } from '@/interface/workOrderInterface'

type WorkOrderDialogType = 'create' | 'update' | 'edit' | 'delete' | 'view'

type WorkOrderContextType = {
  open: WorkOrderDialogType | null
  setOpen: (str: WorkOrderDialogType | null) => void
  currentRow: WorkOrder | null
  setCurrentRow: React.Dispatch<React.SetStateAction<WorkOrder | null>>
}

const WorkOrderContext = React.createContext<WorkOrderContextType | null>(null)

export function WorkOrdersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<WorkOrderDialogType>(null)
  const [currentRow, setCurrentRow] = useState<WorkOrder | null>(null)

  return (
    <WorkOrderContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </WorkOrderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkOrders = () => {
  const workOrdersContext = React.useContext(WorkOrderContext)

  if (!workOrdersContext) {
    throw new Error('useWorkOrders has to be used within <WorkOrdersProvider>')
  }

  return workOrdersContext
}
