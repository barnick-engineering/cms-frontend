import {
  DEFAULT_VISITING_CARD_RATES,
} from '@/config/costing/defaultCostingConfig'
import { coerceNumber } from '@/lib/numberInput'
import type {
  VisitingCardInputs,
  VisitingCardRates,
  VisitingCardResult,
} from '@/interface/costingInterface'

export function mergeVisitingCardRates(
  rates?: Record<string, number>
): VisitingCardRates {
  return { ...DEFAULT_VISITING_CARD_RATES, ...rates } as VisitingCardRates
}

export function defaultVisitingCardInputs(): VisitingCardInputs {
  return {
    sideSelection: 'single',
    paperType: 'Art Card',
    sheetWidth: 28,
    sheetHeight: 22,
    cardWidth: 3.5,
    cardHeight: 2,
    totalQuantity: 1000,
    colors: 1,
    mattLamination: false,
    spotUV: false,
    cuttingType: 'regular',
  }
}

export function calculateVisitingCard(
  calc: VisitingCardInputs,
  ratesOverride?: Record<string, number>
): VisitingCardResult {
  const rates = mergeVisitingCardRates(ratesOverride)

  const totalQuantity = coerceNumber(calc.totalQuantity)
  const designFee = coerceNumber(calc.designFee)
  const profitMargin = coerceNumber(calc.profitMargin)
  const colors = coerceNumber(calc.colors, 1)

  const sheetsRequired = Math.ceil(totalQuantity / rates.cardsPerSheet)

  let wastageRaw = 0
  switch (colors) {
    case 1:
      wastageRaw = rates.wastageColor1
      break
    case 2:
      wastageRaw = rates.wastageColor2
      break
    case 3:
      wastageRaw = rates.wastageColor3
      break
    case 4:
      wastageRaw = rates.wastageColor4
      break
    default:
      wastageRaw = 0
  }
  const wastageSheets = Math.ceil(wastageRaw / 4)

  const totalSheets = sheetsRequired + wastageSheets
  const sheetCost = totalSheets * rates.sheetUnitPrice
  const wastageCost = wastageSheets * rates.sheetUnitPrice

  const plateCost = colors * rates.plateCostPerColor
  const printingCost = colors * rates.printingCostPerColor

  let mattCost = 0
  if (calc.mattLamination) {
    const baseMattCost =
      rates.mattWidth *
      rates.mattHeight *
      rates.mattRate *
      sheetsRequired
    mattCost =
      calc.sideSelection === 'both' ? baseMattCost * 2 : baseMattCost
    mattCost = Math.max(mattCost, rates.mattMinCost)
  }

  let spotCost = 0
  let filmCost = 0
  if (calc.spotUV) {
    const baseSpotCost =
      rates.spotWidth *
      rates.spotHeight *
      rates.spotRate *
      sheetsRequired
    spotCost =
      calc.sideSelection === 'both' ? baseSpotCost * 2 : baseSpotCost
    spotCost = Math.max(spotCost, rates.spotMinCost)
    filmCost = rates.filmCost
  }

  const cuttingRate =
    calc.cuttingType === 'regular'
      ? rates.cuttingRegularRate
      : rates.cuttingDyeRate
  const cuttingCost = (totalQuantity / 1000) * cuttingRate
  const packagingCost = (totalQuantity / 100) * rates.packagingPer100

  const totalProductionCost =
    designFee +
    sheetCost +
    plateCost +
    printingCost +
    mattCost +
    spotCost +
    filmCost +
    cuttingCost +
    packagingCost

  const finalPrice =
    totalProductionCost + (totalProductionCost * profitMargin) / 100

  const pricePerUnit =
    totalQuantity > 0 ? finalPrice / totalQuantity : 0

  return {
    sheetsRequired,
    wastageSheets,
    totalSheets,
    sheetCost,
    wastageCost,
    plateCost,
    printingCost,
    mattCost,
    spotCost,
    filmCost,
    cuttingCost,
    packagingCost,
    totalProductionCost,
    finalPrice,
    pricePerUnit,
  }
}
