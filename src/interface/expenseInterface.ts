import type { ExpenseType } from "@/constance/expenseConstance"

// main expense item
export interface ExpenseItemInterface {
    id: string
    title: string
    type: ExpenseType
    amount: number
    remarks?: string
    shopId: string
    createdAt: string
}

// form interface (create / update)
export interface ExpenseFormInterface {
    id?: string
    title: string
    description?: string
    type: ExpenseType
    amount: number
    remarks?: string
    shopId: string
}

// list item (table optimized) - should extend or match ExpenseItemInterface
export interface ExpenseListItem {
    id: string
    title: string
    description?: string
    type: ExpenseType
    amount: number
    remarks?: string
    shopId: string  // ✅ Added missing field
    createdAt: string
}

// API response structure (Swagger-aligned)
export interface ExpenseListApiResponseInterface {
    msg: string
    statusCode: number
    data: ExpenseItemInterface[]
    page: number
    limit: number
    total: number
}

// table props (UI layer)
export interface ExpenseTableProps {
    data: ExpenseItemInterface[]
    pageIndex: number
    pageSize: number
    total: number
    onPageChange: (index: number) => void
    onSearchChange: (value: string) => void
    onDateChange?: (from?: Date, to?: Date) => void
}