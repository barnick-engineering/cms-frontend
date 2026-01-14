import { z } from "zod"

export const expenseTypesArray = [
    "DAILY_EXPENSE",
    "MONTHLY_SALARY",
    "MONTHLY_RENT",
    "MONTHLY_UTILITIES",
    "MONTHLY_OTHER",
    "OTHER",
] as const

// Define the schema without the final z.ZodType<ExpenseFormInterface> cast
export const expenseFormSchema = z.object({
    // Keep id optional here as it's needed for form reset/default values
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    type: z.enum(expenseTypesArray),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    remarks: z.string().min(1, "Remarks is required"),
    shopId: z.string().min(1, "Shop ID is required"),
})

// Type inferred from Zod (now correctly compatible with useForm)
export type ExpenseFormType = z.infer<typeof expenseFormSchema>