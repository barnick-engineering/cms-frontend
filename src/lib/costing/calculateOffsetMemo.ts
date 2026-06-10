import { DEFAULT_OFFSET_MEMO_RATES } from '@/config/costing/defaultCostingConfig'
import { coerceNumber } from '@/lib/numberInput'
import type {
  OffsetMemoInputs,
  OffsetMemoRates,
  OffsetMemoResult,
} from '@/interface/costingInterface'

export function mergeOffsetMemoRates(
  rates?: Record<string, number>
): OffsetMemoRates {
  return { ...DEFAULT_OFFSET_MEMO_RATES, ...rates } as OffsetMemoRates
}

export function defaultOffsetMemoInputs(): OffsetMemoInputs {
  return {
    paperGSM: '80gsm',
    memoSize: '9x11.5',
    totalOrder: 1000,
    totalColors: 1,
    perSheetPrice: 7,
    bindingType: 'pad',
    padBindingRate: 15,
    memoBindingRate: 50,
  }
}

export function calculateOffsetMemo(
  calc: OffsetMemoInputs,
  ratesOverride?: Record<string, number>
): OffsetMemoResult {
  const rates = mergeOffsetMemoRates(ratesOverride)

  const piecesPerSheet =
    calc.memoSize === '9x11.5'
      ? rates.piecesPerSheetLarge
      : rates.piecesPerSheetSmall

  const totalOrder = coerceNumber(calc.totalOrder)
  const designPrice = coerceNumber(calc.designPrice)
  const perSheetPrice = coerceNumber(calc.perSheetPrice)
  const totalColors = coerceNumber(calc.totalColors, 1)
  const padBindingRate = coerceNumber(calc.padBindingRate)
  const memoBindingRate = coerceNumber(calc.memoBindingRate)
  const profitMargin = coerceNumber(calc.profitMargin)

  const totalSheets = Math.ceil(totalOrder / piecesPerSheet)
  const sheetCost = totalSheets * perSheetPrice
  const plateCost = totalColors * rates.plateCostPerColor
  const printingCost = totalColors * rates.printingCostPerColor

  const bindingRate =
    calc.bindingType === 'pad' ? padBindingRate : memoBindingRate
  const bindingCost = Math.ceil(totalOrder / 100) * bindingRate
  const packagingCost = rates.packagingCost

  const totalCost =
    designPrice +
    sheetCost +
    plateCost +
    printingCost +
    bindingCost +
    packagingCost

  const finalPrice = totalCost + (totalCost * profitMargin) / 100

  const pricePerUnit =
    totalOrder > 0 ? (finalPrice / totalOrder) * 100 : 0

  return {
    piecesPerSheet,
    totalSheets,
    sheetCost,
    plateCost,
    printingCost,
    bindingCost,
    packagingCost,
    totalCost,
    finalPrice,
    pricePerUnit,
  }
}
