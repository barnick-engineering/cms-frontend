import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ExpenseFormInterface, ExpenseListResponse } from "@/interface/expenseInterface"
import { createExpense, deleteExpense, expenseList } from "@/api/expenseApi"

// query keys
const EXPENSE_KEYS = {
  all: ["expenses"] as const,
}

// expense list hook
export const useExpenseList = (
  search?: string,
  limit?: number,
  offset?: number,
  options?: { enabled?: boolean }
) =>
  useQuery<ExpenseListResponse>({
    queryKey: [...EXPENSE_KEYS.all, search, limit, offset],
    queryFn: () => expenseList(search, limit, offset),
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
  })

// create expense
export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ExpenseFormInterface) => createExpense(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EXPENSE_KEYS.all,
        exact: false,
      })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

// delete expense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => deleteExpense(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EXPENSE_KEYS.all,
        exact: false,
      })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
