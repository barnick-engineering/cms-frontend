import z from "zod"

function toOptionalNumber(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : value
}

function toRequiredNumber(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) return value
  const n = Number(value)
  return Number.isFinite(n) ? n : value
}

function toOptionalString(value: unknown): string | undefined {
  if (value === null || value === undefined || value === "") return undefined
  return String(value)
}

function toNullableString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === "") return null
  return String(value)
}

export const workOrderFormSchema = z.object({
  customer: z.preprocess(
    (value) => (value === "" || value == null ? undefined : Number(value)),
    z.number().optional()
  ),
  items: z
    .array(
      z.object({
        id: z.number().optional(),
        item: z.preprocess(
          (value) => (value == null ? "" : String(value)),
          z.string().min(1, "Item name is required")
        ),
        details: z.preprocess(toNullableString, z.string().nullable().optional()),
        total_order: z.preprocess(
          toRequiredNumber,
          z
            .number({ error: "Quantity is required" })
            .min(1, "Quantity must be at least 1")
        ),
        unit_price: z.preprocess(
          toRequiredNumber,
          z
            .number({ error: "Unit price is required" })
            .min(0, "Unit price must be positive")
        ),
      }),
    )
    .min(1, "At least one item is required"),
  date: z.preprocess(toOptionalString, z.string().optional()),
  total_paid: z.preprocess(
    toOptionalNumber,
    z.number().min(0).optional()
  ),
  delivery_charge: z.preprocess(
    toOptionalNumber,
    z.number().min(0).optional()
  ),
  remarks: z.preprocess(toNullableString, z.string().nullable().optional()),
});

export type WorkOrderFormSchema = z.output<typeof workOrderFormSchema>
