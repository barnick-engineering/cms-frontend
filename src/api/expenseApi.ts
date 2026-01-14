import type { ExpenseFormInterface, ExpenseItemInterface } from "@/interface/expenseInterface"
import { axiosInstance } from "./axios";
import { apiEndpoints } from "@/config/api";

// list
export const expenseList = async (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
    startDate?: Date,
    endDate?: Date
): Promise<{ items: ExpenseItemInterface[]; total: number }> => {
    const params = new URLSearchParams({
        shopId,
        page: String(page),
        limit: String(limit),
    })

    if (searchBy) params.append("searchBy", searchBy)
    if (startDate) params.append("startDate", startDate.toISOString())
    if (endDate) params.append("endDate", endDate.toISOString())

    const res = await axiosInstance.get(
        `${apiEndpoints.expense.expenseList}?${params.toString()}`
    )

    return {
        items: res.data.data ?? [],
        total: res.data.total ?? 0,
    }
}

// create
export const createExpense = async (
    data: ExpenseFormInterface
): Promise<ExpenseItemInterface> => {
    if (!data.shopId) throw new Error("Shop ID is required")

    const res = await axiosInstance.post(
        apiEndpoints.expense.createExpense,
        data
    )

    return res.data.data
}

// get expense by id
export const getExpenseById = async (
    id: string
): Promise<ExpenseFormInterface> => {
    if (!id) throw new Error("Expense ID is required")

    const res = await axiosInstance.get<ExpenseFormInterface>(
        apiEndpoints.expense.getExpenseById.replace("id", id)
    )

    return res.data
}

// update
export const updateExpense = async ({
    id,
    data,
    shopId,
}: {
    id: string
    data: ExpenseFormInterface
    shopId: string
}): Promise<ExpenseItemInterface> => {
    if (!shopId) throw new Error("Shop ID is required")

    // Using replace to substitute the ID placeholder in the endpoint string
    const url = apiEndpoints.expense.updateExpense.replace("{id}", id);

    const res = await axiosInstance.put(url, data)

    return res.data.data
}

// delete
export const deleteExpense = async ({ id }: { id: string }) => {
    if (!id) throw new Error("Expense ID is required")

    // check if the endpoint string contains the placeholder and replace it.
    // this is the robust way to handle endpoints defined with placeholders like "/expense/{id}".
    let url = apiEndpoints.expense.deleteExpense;
    if (url.includes("{id}")) {
        url = url.replace("{id}", id);
    } else {
        // Fallback for clean base endpoint (e.g., if endpoint is "/expense")
        url = `${url}/${id}`
    }

    const res = await axiosInstance.delete(url)

    return res.data
}