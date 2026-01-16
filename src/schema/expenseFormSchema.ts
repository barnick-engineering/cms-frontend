import { z } from "zod"

export const expenseFormSchema = z.object({
  work_order: z.union([z.string(), z.number()]).optional(),
  purpose: z.string().min(1, "Purpose is required"),
  customer: z.union([z.string(), z.number()]).optional(),
  paid_by: z.union([z.string(), z.number()]).optional(),
  details: z.string().optional(),
  amount: z.number().min(0).optional(),
  expense_date: z.string().optional(),
  remarks: z.string().optional().nullable(),
})

export type ExpenseFormType = z.infer<typeof expenseFormSchema>
