import z from "zod";

export const customerFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z
        .union([z.string().email(), z.string().length(0)])
        .optional()
        .nullable(),
    address: z.string().min(1, "Address is required"),
    contact_person_name: z.string().optional().nullable(),
    contact_person_phone: z.string().optional().nullable(),
    is_company: z.boolean().optional(),
    remarks: z.string().optional().nullable(),
})