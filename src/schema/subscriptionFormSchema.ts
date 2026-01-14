import z from "zod";

export const subscriptionFormSchema = z.object({
    name: z.string().min(1, "Plan name is required"),
    description: z.string().min(1, "Description name is required"),
    price: z.number().min(0, { message: 'Price must be at least 0' }),
    totalTransactions: z.number().min(0, { message: 'Total transactions must be at least 0' }),
    dashboardAccess: z.boolean(),
})