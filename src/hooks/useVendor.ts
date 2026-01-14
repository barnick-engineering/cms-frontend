import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { createVendor, deleteVendor, getVendorById, getVendorTransactions, updateVendor, vendorList } from "@/api/vendorApi"
import type { VendorFormInterface, VendorTransactionApiResponse } from "@/interface/vendorInterface"
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

const VENDOR_KEYS = {
    all: ["vendors"] as const,
    detail: (shopId: string, id: string) => [...VENDOR_KEYS.all, shopId, id] as const,
    transactions: (vendorId: string, page: number, limit: number) => ["vendorTransactions", vendorId, page, limit] as const,
}

// vendor list
export const useVendorList = (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
    startDate?: Date,
    endDate?: Date,
    options?: { enabled?: boolean }
) =>
    useQuery({
        queryKey: ["vendors", shopId, page, limit, searchBy, startDate, endDate],
        queryFn: () => vendorList(shopId, page, limit, searchBy, startDate, endDate),
        enabled: options?.enabled !== false && !!shopId,
        placeholderData: keepPreviousData,
    })

// get vendor by id
export const useVendorById = (
    shopId: string,
    id: string,
    options?: Partial<UseQueryOptions<VendorFormInterface, Error>>
): UseQueryResult<VendorFormInterface, Error> => {
    return useQuery<VendorFormInterface>({
        queryKey: ["vendors", shopId, id],
        queryFn: () => getVendorById(id, shopId),
        enabled: !!shopId && !!id && (options?.enabled ?? true),
        ...options,
    })
}

// create
export const useCreateVendor = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: Omit<VendorFormInterface, 'shopId'>) =>
            createVendor({ ...data, shopId }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [...VENDOR_KEYS.all, shopId] }),
    })
}

// update
export const useUpdateVendor = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: VendorFormInterface }) =>
            updateVendor({ id, data, shopId }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [...VENDOR_KEYS.all, shopId] }),
    })
}

// delete
export const useDeleteVendor = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id }: { id: string }) => deleteVendor({ id, shopId }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [...VENDOR_KEYS.all, shopId] }),
    })
}

// get vendor transactions by vendorId
export const useVendorTransactions = (vendorId: string, pageIndex: number, pageSize: number) => {
    return useQuery<VendorTransactionApiResponse>({
        queryKey: ["vendorTransactions", vendorId, pageIndex, pageSize],
        queryFn: () => getVendorTransactions(vendorId, pageIndex + 1, pageSize), // pageIndex +1 for 1-based API
        enabled: !!vendorId,
        placeholderData: keepPreviousData,
    })
}
