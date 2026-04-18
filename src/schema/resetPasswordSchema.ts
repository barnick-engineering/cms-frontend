import z from 'zod'

export const resetPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),
    confirm_password: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters long'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
