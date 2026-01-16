import { createProduct, productList, deleteProduct, getProductById, updateProduct } from "@/api/productApi"
import type { ProductFormInterface, Product, ProductListResponse } from "@/interface/productInterface"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

const PRODUCT_KEYS = {
    all: ['products'] as const,
    detail: (id: string | number) => [...PRODUCT_KEYS.all, id] as const,
}

// product list
export const useProductList = (
    search?: string,
    limit?: number,
    offset?: number,
    options?: { enabled?: boolean }
) =>
    useQuery<ProductListResponse>({
        queryKey: [...PRODUCT_KEYS.all, search, limit, offset],
        queryFn: () => productList(search, limit, offset),
        enabled: options?.enabled !== false,
        placeholderData: keepPreviousData,
    })

// get product by id
export const useProductById = (
    id: string | number,
    options?: Partial<UseQueryOptions<Product, Error>>
): UseQueryResult<Product, Error> => {
    return useQuery<Product>({
        queryKey: PRODUCT_KEYS.detail(id),
        queryFn: () => getProductById(id),
        enabled: !!id && (options?.enabled ?? true),
        ...options,
    })
}

// create
export const useCreateProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: ProductFormInterface) => createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        },
    })
}

// update
export const useUpdateProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: ProductFormInterface }) =>
            updateProduct(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
            queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        },
    })
}

// delete
export const useDeleteProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string | number) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        },
    })
}
