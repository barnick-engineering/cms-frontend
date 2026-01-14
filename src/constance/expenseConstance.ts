// expense type enum
export type ExpenseType =
    | "DAILY_EXPENSE"
    | "MONTHLY_SALARY"
    | "MONTHLY_RENT"
    | "MONTHLY_UTILITIES"
    | "MONTHLY_OTHER"
    | "OTHER"

export const expenseTypes: { label: string; value: ExpenseType }[] = [
    { label: "Daily Expense", value: "DAILY_EXPENSE" },
    { label: "Monthly Salary", value: "MONTHLY_SALARY" },
    { label: "Monthly Rent", value: "MONTHLY_RENT" },
    { label: "Monthly Utilities", value: "MONTHLY_UTILITIES" },
    { label: "Monthly Other", value: "MONTHLY_OTHER" },
    { label: "Other", value: "OTHER" },
]