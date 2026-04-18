import z from 'zod'

export const registerFormSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Please enter your email')
      .email('Please enter a valid email address'),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),
    confirm_password: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters long'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

export type RegisterFormValues = z.infer<typeof registerFormSchema>
