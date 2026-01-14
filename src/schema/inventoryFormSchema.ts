import { z } from "zod"

export const inventoryFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, {message:'Description should be at least 1 character'}),
    quantity: z.number().min(0, "Quantity must be at least 0"),
    lastPrice: z.number().min(0, "Last price must be at least 0"),
})