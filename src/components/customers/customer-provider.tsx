import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Customer } from '../../schema/customerSchema'

type CustomerDialogType = 'create' | 'update' | 'delete' | 'import' | 'view'

type CustomerContextType = {
  open: CustomerDialogType | null
  setOpen: (str: CustomerDialogType | null) => void
  currentRow: Customer | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Customer | null>>
}

const CustomerContext = React.createContext<CustomerContextType | null>(null)

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CustomerDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Customer | null>(null)

  return (
    <CustomerContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CustomerContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomers = () => {
  const customersContext = React.useContext(CustomerContext)

  if (!customersContext) {
    throw new Error('useTasks has to be used within <CustomersContext>')
  }

  return customersContext
}