import { useState } from 'react'
import type { Resolver } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionFormSchema } from '@/schema/transactionFormSchema'
import { DEFAULT_VALUES } from '@/constance/transactionConstances'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import type { BusinessEntityType } from '@/constance/transactionConstances'
import type { ComboboxOptionInterface } from '@/interface/transactionInterface'

export const useTransactionForm = () => {
    const [selectedBusinessEntity, setSelectedBusinessEntity] =
        useState<BusinessEntityType | null>(null)
    const [entitySearchQuery, setEntitySearchQuery] = useState('')
    const [inventorySearchQuery, setInventorySearchQuery] = useState('')
    const [inventoryInputValues, setInventoryInputValues] = useState<
        Record<number, string>
    >({})
    const [inventoryDisplayData, setInventoryDisplayData] = useState<
        Record<number, { lastPrice: number | null; stockQuantity: number | null; description: string | null }>
    >({})
    // Cache of selected inventory options (ID -> option) to ensure they display correctly
    // even when not in search results
    const [selectedInventoryOptionsCache, setSelectedInventoryOptionsCache] = useState<
        Record<string, ComboboxOptionInterface>
    >({})



    const resolver = zodResolver(
        transactionFormSchema
    ) as Resolver<TransactionFormValues>

    const form = useForm<TransactionFormValues>({
        resolver,
        defaultValues: DEFAULT_VALUES as TransactionFormValues,
    })

    const resetFormStates = () => {
        form.reset(DEFAULT_VALUES)
        setSelectedBusinessEntity(null)
        setEntitySearchQuery('')
        setInventorySearchQuery('')
        setInventoryInputValues({})
        setInventoryDisplayData({})
        setSelectedInventoryOptionsCache({})
    }

    return {
        form,
        selectedBusinessEntity,
        setSelectedBusinessEntity,
        entitySearchQuery,
        setEntitySearchQuery,
        inventorySearchQuery,
        setInventorySearchQuery,
        inventoryInputValues,
        setInventoryInputValues,
        inventoryDisplayData,
        setInventoryDisplayData,
        selectedInventoryOptionsCache,
        setSelectedInventoryOptionsCache,
        resetFormStates,
    }
}