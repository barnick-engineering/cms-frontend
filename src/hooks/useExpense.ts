import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ExpenseFormInterface, ExpenseItemInterface } from "@/interface/expenseInterface"
import { createExpense, deleteExpense, expenseList, getExpenseById, updateExpense } from "@/api/expenseApi";

// query keys
const EXPENSE_KEYS = {
    all: ["expenses"] as const,
    // Base list key for a specific shop
    list: (shopId: string) => [...EXPENSE_KEYS.all, shopId] as const,
    detail: (id: string) => ["expenses", id] as const,
}

// expense list hook
export const useExpenseList = (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
    startDate?: Date,
    endDate?: Date,
    options?: { enabled?: boolean }
) =>
    useQuery<{ items: ExpenseItemInterface[]; total: number }>({
        queryKey: [
            ...EXPENSE_KEYS.list(shopId),
            page,
            limit,
            searchBy,
            startDate,
            endDate,
        ],
        queryFn: () =>
            expenseList(shopId, page, limit, searchBy, startDate, endDate),
        enabled: options?.enabled !== false && !!shopId,
        placeholderData: keepPreviousData,
    })

// create expense
export const useCreateExpense = (shopId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Omit<ExpenseFormInterface, "shopId">) =>
            createExpense({ ...data, shopId }),

        onSuccess: () => {
            // Invalidate all list queries for the shop ID
            queryClient.invalidateQueries({
                queryKey: EXPENSE_KEYS.list(shopId),
                exact: false,
            })
        },
    })
}

// get expense by id
export const useExpenseById = (id?: string) =>
    useQuery<ExpenseFormInterface>({
        queryKey: EXPENSE_KEYS.detail(id ?? ""),
        queryFn: () => getExpenseById(id as string),
        enabled: !!id,
    })

// update
export const useUpdateExpense = (shopId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: ExpenseFormInterface
        }) => updateExpense({ id, data, shopId }),

        onSuccess: (_data, variables) => {
            // ✅ FIX APPLIED: Invalidate all queries starting with the specific shopId list key
            queryClient.invalidateQueries({
                queryKey: EXPENSE_KEYS.list(shopId),
                exact: false, // Force refetching of all list variations (with page, search, etc.)
            })

            // Invalidate the detail query for the specific updated item
            queryClient.invalidateQueries({
                queryKey: EXPENSE_KEYS.detail(variables.id),
                exact: true,
            })
        },
    })
}

// delete expense
export const useDeleteExpense = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: string }) => deleteExpense({ id }),

        // optimistic update
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: EXPENSE_KEYS.all })

            // snapshot previous state
            const previousQueries =
                queryClient.getQueriesData<{
                    items: ExpenseItemInterface[]
                    total: number
                }>({
                    queryKey: EXPENSE_KEYS.all,
                })

            // optimistically update all expense lists
            previousQueries.forEach(([key, oldData]) => {
                if (!oldData) return

                queryClient.setQueryData(key, {
                    ...oldData,
                    items: oldData.items.filter((item) => item.id !== id),
                    total:
                        typeof oldData.total === "number"
                            ? oldData.total - 1
                            : oldData.total,
                })
            })

            return { previousQueries }
        },

        // rollback on error
        onError: (_err, _vars, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data)
                })
            }
        },

        // always refetch to stay in sync
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: EXPENSE_KEYS.all,
                exact: false,
            })
        },
    })
}