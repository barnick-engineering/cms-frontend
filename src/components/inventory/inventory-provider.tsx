/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { InventoryListItem } from '@/interface/inventoryInterface'

// Types
type InventoryDrawerState = 'view' | 'update' | 'delete' | 'create' | null

interface InventoryContextType {
    open: InventoryDrawerState
    currentRow: InventoryListItem | null
    setOpen: (val: InventoryDrawerState) => void
    setCurrentRow: (val: InventoryListItem | null) => void
}

// Context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

// Provider Component
export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState<InventoryDrawerState>(null)
    const [currentRow, setCurrentRow] = useState<InventoryListItem | null>(null)

    return (
        <InventoryContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
            {children}
        </InventoryContext.Provider>
    )
}

// Custom Hook
export const useInventory = (): InventoryContextType => {
    const ctx = useContext(InventoryContext)
    if (!ctx) throw new Error('useInventory must be used inside InventoryProvider')
    return ctx
}