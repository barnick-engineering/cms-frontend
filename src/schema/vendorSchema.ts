import { z } from "zod";

export const vendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string(),
  address: z.string(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  isB2B: z.boolean().default(false),
  contactPerson: z.string().nullable(),
  contactPersonPhone: z.string().nullable(),
});

export type Vendor = z.infer<typeof vendorSchema>