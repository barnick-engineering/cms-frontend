import { z } from 'zod'

export const loanFormSchema = z.object({
  loan_for: z.string().min(1, 'Loan for is required'),
  loan_from: z.string().optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  paid: z.number().min(0, 'Paid must be non-negative'),
  remarks: z.string().optional().nullable(),
  created: z.string().optional(),
})

export type LoanFormType = z.infer<typeof loanFormSchema>
