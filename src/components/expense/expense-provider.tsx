/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react"
import type { Expense } from "@/interface/expenseInterface"

// Types
type ExpenseDrawerState = "view" | "delete" | "create" | "update" | null

interface ExpenseContextType {
    open: ExpenseDrawerState
    currentRow: Expense | null
    setOpen: (val: ExpenseDrawerState) => void
    setCurrentRow: (val: Expense | null) => void
}

// Context
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

// Provider
export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState<ExpenseDrawerState>(null)
    const [currentRow, setCurrentRow] = useState<Expense | null>(null)

    return (
        <ExpenseContext.Provider
            value={{ open, currentRow, setOpen, setCurrentRow }}
        >
            {children}
        </ExpenseContext.Provider>
    )
}

// Hook
export const useExpense = (): ExpenseContextType => {
    const ctx = useContext(ExpenseContext)
    if (!ctx) throw new Error("useExpense must be used inside ExpenseProvider")
    return ctx
}
