import { z } from "zod"

export const inventorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  quantity: z.number().int().nonnegative(),
  lastPrice: z.number().nonnegative(),
  shopId: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export type Inventory = z.infer<typeof inventorySchema>