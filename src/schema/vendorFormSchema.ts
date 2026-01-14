import z from "zod";

export const vendorFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z
        .union([z.string().email(), z.string().length(0)])
        .optional()
        .nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    isB2B: z.boolean().optional(),
    contactPerson: z.string().optional().nullable(),
    contactPersonPhone: z.string().optional().nullable(),
})