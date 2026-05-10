/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Loan } from '@/interface/loanInterface'

type LoanDrawerState = 'view' | 'delete' | 'create' | 'update' | null

interface LoanContextType {
  open: LoanDrawerState
  currentRow: Loan | null
  setOpen: (val: LoanDrawerState) => void
  setCurrentRow: (val: Loan | null) => void
}

const LoanContext = createContext<LoanContextType | undefined>(undefined)

export const LoanProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState<LoanDrawerState>(null)
  const [currentRow, setCurrentRow] = useState<Loan | null>(null)

  return (
    <LoanContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </LoanContext.Provider>
  )
}

export const useLoan = (): LoanContextType => {
  const ctx = useContext(LoanContext)
  if (!ctx) throw new Error('useLoan must be used inside LoanProvider')
  return ctx
}
