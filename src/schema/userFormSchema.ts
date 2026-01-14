import { z } from 'zod'

export const userFormSchema = z
    .object({
        username: z.string().min(1, 'Username is required.'),
        phoneNumber: z.string().min(1, 'Phone number is required.'),
        password: z.string().transform((pwd) => pwd.trim()),
        role: z.string().min(1, 'Role is required.'),
        confirmPassword: z.string().transform((pwd) => pwd.trim()),
        isEdit: z.boolean(),
    })
    .refine(
        (data) => {
            if (data.isEdit && !data.password) return true
            return data.password.length > 0
        },
        {
            message: 'Password is required.',
            path: ['password'],
        }
    )
    .refine(
        ({ isEdit, password }) => {
            if (isEdit && !password) return true
            return password.length >= 6
        },
        {
            message: 'Password must be at least 6 characters long.',
            path: ['password'],
        }
    )
    .refine(
        ({ isEdit, password, confirmPassword }) => {
            if (isEdit && !password) return true
            return password === confirmPassword
        },
        {
            message: "Passwords don't match.",
            path: ['confirmPassword'],
        }
    )

export type UserForm = z.infer<typeof userFormSchema>