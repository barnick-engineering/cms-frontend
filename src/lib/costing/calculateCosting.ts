import type {
  CostingItem,
  CostingInputs,
  OffsetMemoInputs,
  OffsetMemoResult,
  VisitingCardInputs,
  VisitingCardResult,
} from '@/interface/costingInterface'
import { calculateCustom, getDefaultInputsFromFields } from './calculateCustom'
import {
  calculateOffsetMemo,
  defaultOffsetMemoInputs,
} from './calculateOffsetMemo'
import {
  calculateVisitingCard,
  defaultVisitingCardInputs,
} from './calculateVisitingCard'

export type CostingCalculationResult =
  | { type: 'visiting-card'; inputs: VisitingCardInputs; result: VisitingCardResult }
  | { type: 'offset-memo'; inputs: OffsetMemoInputs; result: OffsetMemoResult }
  | { type: 'custom'; inputs: CostingInputs; result: Record<string, number> }
  | { type: 'stub'; inputs: CostingInputs; result: Record<string, number> }

export function getDefaultInputsForItem(item: CostingItem): CostingInputs {
  switch (item.calculatorType) {
    case 'visiting-card':
      return defaultVisitingCardInputs() as unknown as CostingInputs
    case 'offset-memo':
      return defaultOffsetMemoInputs() as unknown as CostingInputs
    case 'custom':
      return getDefaultInputsFromFields(item.fields)
    default:
      return {}
  }
}

export function calculateForItem(
  item: CostingItem,
  inputs: CostingInputs
): CostingCalculationResult {
  switch (item.calculatorType) {
    case 'visiting-card':
      const vcInputs = inputs as unknown as VisitingCardInputs
      return {
        type: 'visiting-card',
        inputs: vcInputs,
        result: calculateVisitingCard(vcInputs, item.rates),
      }
    case 'offset-memo':
      const omInputs = inputs as unknown as OffsetMemoInputs
      return {
        type: 'offset-memo',
        inputs: omInputs,
        result: calculateOffsetMemo(omInputs, item.rates),
      }
    case 'custom':
      return {
        type: 'custom',
        inputs,
        result: calculateCustom(item, inputs),
      }
    default:
      return { type: 'stub', inputs, result: {} }
  }
}

export function resultsToFlatRecord(
  calculation: CostingCalculationResult
): Record<string, number> {
  if (calculation.type === 'visiting-card') {
    return { ...calculation.result }
  }
  if (calculation.type === 'offset-memo') {
    return { ...calculation.result }
  }
  return calculation.result
}
