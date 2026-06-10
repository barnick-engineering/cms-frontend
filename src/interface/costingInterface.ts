export type CostingCurrency = 'BDT' | 'TK'

export type CalculatorType =
  | 'visiting-card'
  | 'offset-memo'
  | 'custom'
  | 'stub'

export type CustomFieldType =
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'

export interface CustomFieldOption {
  value: string
  label: string
}

export interface CustomField {
  key: string
  label: string
  type: CustomFieldType
  defaultValue?: string | number | boolean
  placeholder?: string
  options?: CustomFieldOption[]
}

export interface FormulaStep {
  key: string
  expression: string
}

export interface BreakdownLine {
  key: string
  label: string
  /** Show only when expression is truthy, e.g. "inputs.mattLamination" */
  showWhen?: string
  decimals?: number
}

export interface CostingCategory {
  id: string
  title: string
  icon: string
  itemIds: string[]
}

export interface CostingItem {
  id: string
  title: string
  calculatorType: CalculatorType
  currency: CostingCurrency
  rates?: Record<string, number>
  fields?: CustomField[]
  steps?: FormulaStep[]
  breakdown?: BreakdownLine[]
  perUnitLabel?: string
  /** offset-memo uses * 100 in original repo */
  perUnitMultiplier?: number
}

export interface CostingConfig {
  version: number
  categories: CostingCategory[]
  items: CostingItem[]
}

export interface VisitingCardInputs {
  sideSelection: 'single' | 'both'
  designFee?: number
  paperType: string
  sheetWidth: number
  sheetHeight: number
  cardWidth: number
  cardHeight: number
  totalQuantity: number
  colors: number
  mattLamination: boolean
  spotUV: boolean
  cuttingType: 'regular' | 'dye'
  profitMargin?: number
}

export interface VisitingCardRates {
  cardsPerSheet: number
  sheetUnitPrice: number
  plateCostPerColor: number
  printingCostPerColor: number
  mattWidth: number
  mattHeight: number
  mattRate: number
  mattMinCost: number
  spotWidth: number
  spotHeight: number
  spotRate: number
  spotMinCost: number
  filmCost: number
  cuttingRegularRate: number
  cuttingDyeRate: number
  packagingPer100: number
  wastageColor1: number
  wastageColor2: number
  wastageColor3: number
  wastageColor4: number
}

export interface VisitingCardResult {
  sheetsRequired: number
  wastageSheets: number
  totalSheets: number
  sheetCost: number
  wastageCost: number
  plateCost: number
  printingCost: number
  mattCost: number
  spotCost: number
  filmCost: number
  cuttingCost: number
  packagingCost: number
  totalProductionCost: number
  finalPrice: number
  pricePerUnit: number
}

export interface OffsetMemoInputs {
  designPrice?: number
  paperGSM: string
  memoSize: '9x11.5' | '5.75x9'
  totalOrder: number
  totalColors: number
  perSheetPrice: number
  bindingType: 'pad' | 'memo'
  padBindingRate: number
  memoBindingRate: number
  profitMargin?: number
}

export interface OffsetMemoRates {
  plateCostPerColor: number
  printingCostPerColor: number
  packagingCost: number
  piecesPerSheetLarge: number
  piecesPerSheetSmall: number
}

export interface OffsetMemoResult {
  piecesPerSheet: number
  totalSheets: number
  sheetCost: number
  plateCost: number
  printingCost: number
  bindingCost: number
  packagingCost: number
  totalCost: number
  finalPrice: number
  pricePerUnit: number
}

export type CostingInputs = Record<string, string | number | boolean>

export type CostingResults = Record<string, number>

export interface CostingQuoteSnapshot {
  itemId: string
  itemTitle: string
  calculatorType: CalculatorType
  currency: CostingCurrency
  inputs: CostingInputs
  results: CostingResults
  timestamp: string
}
