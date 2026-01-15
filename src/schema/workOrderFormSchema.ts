import z from "zod"

export const workOrderFormSchema = z.object({
  customer: z.number().optional(),
  items: z
    .array(
      z.object({
        item: z.string().min(1, "Item name is required"),
        total_order: z.number().min(1, "Quantity must be at least 1"),
        unit_price: z.number().min(0, "Unit price must be positive"),
      })
    )
    .min(1, "At least one item is required"),
  date: z.string().optional(),
  total_paid: z.number().min(0).optional(),
  remarks: z.string().optional().nullable(),
})

export type WorkOrderFormSchema = z.infer<typeof workOrderFormSchema>
