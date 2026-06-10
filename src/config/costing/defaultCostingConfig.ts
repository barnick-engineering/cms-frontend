import type { CostingConfig } from '@/interface/costingInterface'

export const DEFAULT_VISITING_CARD_RATES = {
  cardsPerSheet: 80,
  sheetUnitPrice: 12,
  plateCostPerColor: 120,
  printingCostPerColor: 300,
  mattWidth: 11,
  mattHeight: 14,
  mattRate: 0.006,
  mattMinCost: 300,
  spotWidth: 11,
  spotHeight: 14,
  spotRate: 0.007,
  spotMinCost: 300,
  filmCost: 350,
  cuttingRegularRate: 25,
  cuttingDyeRate: 50,
  packagingPer100: 5,
  wastageColor1: 5,
  wastageColor2: 10,
  wastageColor3: 15,
  wastageColor4: 20,
}

export const DEFAULT_OFFSET_MEMO_RATES = {
  plateCostPerColor: 120,
  printingCostPerColor: 300,
  packagingCost: 50,
  piecesPerSheetLarge: 8,
  piecesPerSheetSmall: 16,
}

export const defaultCostingConfig: CostingConfig = {
  version: 1,
  categories: [
    {
      id: 'office-materials',
      title: 'Office Materials',
      icon: 'FileText',
      itemIds: ['visiting-card'],
    },
    {
      id: 'memo',
      title: 'Memo',
      icon: 'Receipt',
      itemIds: ['offset-memo', 'carbon-memo'],
    },
    {
      id: 'packaging',
      title: 'Packaging',
      icon: 'Package',
      itemIds: ['box-packaging', 'bag-packaging'],
    },
  ],
  items: [
    {
      id: 'visiting-card',
      title: 'Visiting Card',
      calculatorType: 'visiting-card',
      currency: 'BDT',
      rates: { ...DEFAULT_VISITING_CARD_RATES },
      perUnitLabel: 'Price per card',
    },
    {
      id: 'offset-memo',
      title: 'Offset Memo',
      calculatorType: 'offset-memo',
      currency: 'TK',
      rates: { ...DEFAULT_OFFSET_MEMO_RATES },
      perUnitLabel: 'Price per memo',
      perUnitMultiplier: 100,
    },
    {
      id: 'carbon-memo',
      title: 'Carbon Memo',
      calculatorType: 'stub',
      currency: 'TK',
    },
    {
      id: 'box-packaging',
      title: 'Box Packaging',
      calculatorType: 'stub',
      currency: 'BDT',
    },
    {
      id: 'bag-packaging',
      title: 'Bag Packaging',
      calculatorType: 'stub',
      currency: 'BDT',
    },
  ],
}
