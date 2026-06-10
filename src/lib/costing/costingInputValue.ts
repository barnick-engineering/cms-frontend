import type { CostingInputs } from '@/interface/costingInterface'

/** Safe value for NumberInput from costing inputs record. */
export function costingNumberValue(
  inputs: CostingInputs,
  key: string
): number | string | undefined {
  const value = inputs[key]
  if (typeof value === 'boolean') return undefined
  return value as number | string | undefined
}
