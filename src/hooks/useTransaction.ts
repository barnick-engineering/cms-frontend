import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTransaction, getTransactionById, getTransactions, transactionLedger } from "@/api/transactionApi"
import type { CreateTransactionDto, TransactionListResponse } from "@/interface/transactionInterface"
import { INVENTORY_KEYS } from "./useInventory"

const TRANSACTIONS_KEYS = {
    all: ["transactions"] as const,
}

// list
export const useTransactionList = (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
    startDate?: string,
    endDate?: string,
    transactionTypes?: string[],
    vendorIds?: string[],
    customerIds?: string[]
) => {
    return useQuery<TransactionListResponse>({
        queryKey: ["transactions", shopId, page, limit, searchBy, startDate, endDate, transactionTypes, vendorIds, customerIds],
        queryFn: () => getTransactions(shopId, page, limit, searchBy, startDate, endDate, transactionTypes, vendorIds, customerIds),
        placeholderData: keepPreviousData,
        enabled: !!shopId,
    })
}

// create
export const useCreateTransaction = (shopId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Omit<CreateTransactionDto, "shopId">) =>
            createTransaction({ ...data, shopId }),
        onSuccess: () => {
            // Invalidate transaction queries
            queryClient.invalidateQueries({ queryKey: [...TRANSACTIONS_KEYS.all, shopId] })
            // Invalidate inventory tracking queries to refresh inventory history
            // This ensures inventory tracking table updates after purchase/sale
            queryClient.invalidateQueries({ 
                queryKey: [INVENTORY_KEYS.all[0], 'tracking'],
                exact: false 
            })
            // Also invalidate inventory list to update stock quantities
            queryClient.invalidateQueries({ 
                queryKey: INVENTORY_KEYS.all,
                exact: false 
            })
        },
    })
}

// transaction detail by id
export const useTransactionById = (shopId: string, id: string) => {
    return useQuery({
        queryKey: ["transactions", shopId, id],
        queryFn: () => getTransactionById(shopId, id),
        enabled: !!shopId && !!id,
    })
}

// transaction ledger hook
export const useTransactionLedger = (
    shopId: string,
    pageSize: number,
    customerOrVendorId: string,
    limit: number = 10,
    searchBy?: string,
    startDate?: string,
    endDate?: string,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: [
            "transactionLedger",
            shopId,
            pageSize,
            customerOrVendorId,
            limit,
            searchBy,
            startDate,
            endDate,
        ],
        queryFn: () =>
            transactionLedger(shopId, pageSize, customerOrVendorId, limit, searchBy, startDate, endDate),
        // only fetch when both IDs exist
        enabled: options?.enabled !== undefined 
            ? options.enabled 
            : (!!shopId && !!customerOrVendorId),
        placeholderData: keepPreviousData,
    })
}