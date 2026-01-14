import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type {
  ExpenseFormInterface,
  ExpenseListResponse,
  Expense,
} from "@/interface/expenseInterface"

// expense list with search params
export const expenseList = async (
  search?: string,
  limit?: number,
  offset?: number
): Promise<ExpenseListResponse> => {
  const params = new URLSearchParams()

  if (search) params.append("search", search)
  if (limit) params.append("limit", String(limit))
  if (offset) params.append("offset", String(offset))

  const queryString = params.toString()
  const url = queryString
    ? `${apiEndpoints.expense.expenseList}?${queryString}`
    : apiEndpoints.expense.expenseList

  const res = await axiosInstance.get<ExpenseListResponse>(url)
  return res.data
}

// create expense
export const createExpense = async (data: ExpenseFormInterface) => {
  const res = await axiosInstance.post<Expense>(
    apiEndpoints.expense.createExpense,
    data
  )
  return res.data
}

// delete expense
export const deleteExpense = async (id: string | number) => {
  if (!id) throw new Error("Expense ID is required")

  const res = await axiosInstance.delete(
    `${apiEndpoints.expense.deleteExpense}${id}/`
  )

  return res.data
}
