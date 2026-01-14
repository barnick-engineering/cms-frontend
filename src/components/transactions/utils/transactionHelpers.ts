import { BusinessEntityType } from '@/constance/transactionConstances';
import type { ComboboxOptionInterface } from '@/interface/transactionInterface'

export const createEntityOptions = (
    entityList: Array<{ id: string; name: string }>
): ComboboxOptionInterface[] => {
    return entityList.map((entity) => ({
        value: entity.id,
        label: entity.name,
    }))
}

export const createBusinessEntityOptions = (): ComboboxOptionInterface[] => {
    return [
        { value: 'VENDOR', label: 'Vendor' },
        { value: 'CUSTOMER', label: 'Customer' },
    ]
}

export const getEntityLabel = (entityType: BusinessEntityType): string => {
    return entityType === 'VENDOR' ? 'Vendor' : 'Customer'
}

export const getEntityPlaceholder = (entityType: BusinessEntityType): string => {
    return entityType === 'VENDOR' ? 'Select vendor...' : 'Select customer...'
}

export const calculateTotal = (
    inventories: Array<{ quantity: number; price: number }> | undefined
): number => {
    if (!inventories || inventories.length === 0) return 0
    return inventories.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0
        const price = Number(item.price) || 0
        return sum + quantity * price
    }, 0)
}

export const calculatePending = (
    amount: number,
    paid: number
): number => {
    const totalAmount = Number(amount) || 0
    const totalPaid = Number(paid) || 0
    return Math.max(0, totalAmount - totalPaid)
}

// Determine which entity type to show based on transaction type
export const getEntityTypeForTransaction = (transactionType: string): BusinessEntityType | null => {
    switch (transactionType) {
        case 'PURCHASE':
        case 'PAYMENT':
            return BusinessEntityType.VENDOR
        case 'SALE':
        case 'RECEIVABLE':
            return BusinessEntityType.CUSTOMER
        case 'COMMISSION':
            return null // Will show partner type selector
        default:
            return null
    }
}

// Check if transaction type requires inventory fields
export const requiresInventoryFields = (transactionType: string): boolean => {
    return transactionType === 'PURCHASE' || transactionType === 'SALE'
}

// Check if transaction type requires amount field
export const requiresAmountField = (transactionType: string): boolean => {
    return transactionType === 'PAYMENT' || transactionType === 'RECEIVABLE' || transactionType === 'COMMISSION'
}