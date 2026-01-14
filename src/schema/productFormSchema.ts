import z from "zod";

export const productFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    details: z.string().min(1, "Details is required"),
    price: z.number().min(0, "Price must be greater than or equal to 0"),
})
