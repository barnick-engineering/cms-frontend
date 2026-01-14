import { z } from "zod"

export const expenseSchema = z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum([
        "DAILY_EXPENSE",
        "MONTHLY_SALARY",
        "MONTHLY_RENT",
        "MONTHLY_UTILITIES",
        "MONTHLY_OTHER",
        "OTHER",
    ]),
    amount: z.number().nonnegative(),
    remarks: z.string().optional(),
    shopId: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
})

export type Expense = z.infer<typeof expenseSchema>