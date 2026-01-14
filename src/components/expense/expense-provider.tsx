/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react"
import type { ExpenseListItem } from "@/interface/expenseInterface"

// Types
type ExpenseDrawerState = "view" | "update" | "delete" | "create" | null

interface ExpenseContextType {
    open: ExpenseDrawerState
    currentRow: ExpenseListItem | null
    setOpen: (val: ExpenseDrawerState) => void
    setCurrentRow: (val: ExpenseListItem | null) => void
}

// Context
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

// Provider
export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState<ExpenseDrawerState>(null)
    const [currentRow, setCurrentRow] = useState<ExpenseListItem | null>(null)

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