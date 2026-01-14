import z from "zod"

export const createShopFormSchema = z.object({
    name: z.string()
        .min(1, "Please enter your shop name")
        .max(50, "Shop name must be less than 50 characters"),
    address: z.string()
        .min(1, "Please enter shop address")
        .optional()
        .or(z.literal("")),
})