import { createCustomer, customerList, deleteCustomer, getCustomerById, updateCustomer } from "@/api/customerApi"
import type { CustomerFormInterface, Customer, CustomerListResponse } from "@/interface/customerInterface"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

const CUSTOMER_KEYS = {
    all: ['customers'] as const,
    detail: (id: string | number) => [...CUSTOMER_KEYS.all, id] as const,
}

// customer list
export const useCustomerList = (
    search?: string,
    limit?: number,
    offset?: number,
    options?: { enabled?: boolean }
) =>
    useQuery<CustomerListResponse>({
        queryKey: [...CUSTOMER_KEYS.all, search, limit, offset],
        queryFn: () => customerList(search, limit, offset),
        enabled: options?.enabled !== false,
        placeholderData: keepPreviousData,
    })

// get customer by id
export const useCustomerById = (
    id: string | number,
    options?: Partial<UseQueryOptions<Customer, Error>>
): UseQueryResult<Customer, Error> => {
    return useQuery<Customer>({
        queryKey: CUSTOMER_KEYS.detail(id),
        queryFn: () => getCustomerById(id),
        enabled: !!id && (options?.enabled ?? true),
        ...options,
    })
}

// create
export const useCreateCustomer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CustomerFormInterface) => createCustomer(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all }),
    })
}

// update
export const useUpdateCustomer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: CustomerFormInterface }) =>
            updateCustomer(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all })
            queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.detail(variables.id) })
        },
    })
}

// delete
export const useDeleteCustomer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string | number) => deleteCustomer(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all }),
    })
}
