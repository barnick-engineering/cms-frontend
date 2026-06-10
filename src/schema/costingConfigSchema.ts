import { z } from 'zod'

const customFieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

const customFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['number', 'select', 'checkbox', 'radio']),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  placeholder: z.string().optional(),
  options: z.array(customFieldOptionSchema).optional(),
})

const formulaStepSchema = z.object({
  key: z.string().min(1),
  expression: z.string().min(1),
})

const breakdownLineSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  showWhen: z.string().optional(),
  decimals: z.number().optional(),
})

const costingItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  calculatorType: z.enum(['visiting-card', 'offset-memo', 'custom', 'stub']),
  currency: z.enum(['BDT', 'TK']),
  rates: z.record(z.string(), z.number()).optional(),
  fields: z.array(customFieldSchema).optional(),
  steps: z.array(formulaStepSchema).optional(),
  breakdown: z.array(breakdownLineSchema).optional(),
  perUnitLabel: z.string().optional(),
  perUnitMultiplier: z.number().optional(),
})

const costingCategorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  icon: z.string().min(1),
  itemIds: z.array(z.string()),
})

export const costingConfigSchema = z.object({
  version: z.number(),
  categories: z.array(costingCategorySchema),
  items: z.array(costingItemSchema),
})

export type CostingConfigSchema = z.infer<typeof costingConfigSchema>

export function parseCostingConfig(data: unknown) {
  return costingConfigSchema.parse(data)
}
