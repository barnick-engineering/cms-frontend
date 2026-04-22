import { z } from 'zod'

export const addUserSchema = z
  .object({
    email: z.string().min(1, 'Email is required.').email('Enter a valid email.'),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirm_password: z.string().min(1, 'Confirm your password.'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  })

export type AddUserFormValues = z.infer<typeof addUserSchema>
