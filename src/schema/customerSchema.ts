import { z } from "zod";

export const customerSchema = z.object({
  id: z.number(),
  created: z.string(),
  status: z.boolean(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  contact_person_name: z.string(),
  remarks: z.string().nullable(),
  is_company: z.boolean().optional(),
  contact_person_phone: z.string().nullable().optional(),
});

export type Customer = z.infer<typeof customerSchema>