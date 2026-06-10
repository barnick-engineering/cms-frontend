import type {
  CostingInputs,
  CostingItem,
  CostingResults,
} from '@/interface/costingInterface'
import { evaluateCondition, evaluateExpression } from './evaluateExpression'

export function calculateCustom(
  item: CostingItem,
  inputs: CostingInputs
): CostingResults {
  const steps: CostingResults = {}
  const rates = item.rates ?? {}
  const stepList = item.steps ?? []

  for (const step of stepList) {
    steps[step.key] = evaluateExpression(step.expression, {
      inputs,
      steps,
      rates,
    })
  }

  return steps
}

export function getDefaultInputsFromFields(
  fields: CostingItem['fields']
): CostingInputs {
  const inputs: CostingInputs = {}
  if (!fields) return inputs

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      inputs[field.key] = field.defaultValue
    } else if (field.type === 'checkbox') {
      inputs[field.key] = false
    } else if (field.type === 'select' || field.type === 'radio') {
      inputs[field.key] = field.options?.[0]?.value ?? ''
    }
  }
  return inputs
}

export function filterBreakdownLines(
  item: CostingItem,
  inputs: CostingInputs,
  results: CostingResults
): { key: string; label: string; value: number; decimals?: number }[] {
  const ctx = { inputs, steps: results, rates: item.rates ?? {} }
  const lines = item.breakdown ?? []

  return lines
    .filter((line) => {
      if (!line.showWhen) return true
      return evaluateCondition(line.showWhen, ctx)
    })
    .map((line) => ({
      key: line.key,
      label: line.label,
      value: results[line.key] ?? 0,
      decimals: line.decimals,
    }))
}
