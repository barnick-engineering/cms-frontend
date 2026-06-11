import { useState } from 'react'
import { Receipt } from 'lucide-react'
import type { CostingItem, CostingQuoteSnapshot } from '@/interface/costingInterface'
import { useCostingCalculator } from '@/hooks/useCostingCalculator'
import { costingNumberValue } from '@/lib/costing/costingInputValue'
import type { CostingCustomerSlipData } from '@/lib/costing/customerSlipPrint'
import { coerceNumber } from '@/lib/numberInput'
import { NumberInput } from '@/components/ui/number-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CostingBreakdownCard,
  type CostingBreakdownData,
} from './CostingBreakdownCard'
import { CostingFormField } from './CostingFormField'
import { CostingQuickActions } from './CostingQuickActions'
import { CostingWizardShell } from './CostingWizardShell'

const STEPS = [
  { id: 'order', title: 'Order details', shortTitle: 'Order' },
  { id: 'paper', title: 'Paper specs', shortTitle: 'Paper' },
  { id: 'binding', title: 'Binding', shortTitle: 'Bind' },
  { id: 'quote', title: 'Quote', shortTitle: 'Quote' },
]

const STEP_META = [
  {
    title: 'Order details',
    description: 'Design charge, quantity, and print colors.',
  },
  {
    title: 'Paper specifications',
    description: 'Memo size and per-sheet paper cost.',
  },
  {
    title: 'Binding options',
    description: 'Pad or memo binding rates.',
  },
  {
    title: 'Profit & final quote',
    description: 'Set margin and export your quote.',
  },
]

export function OffsetMemoCalculator({ item }: { item: CostingItem }) {
  const [step, setStep] = useState(0)
  const { inputs, updateInput, calculation } = useCostingCalculator(item)

  const setNumberInput = (key: string, value: number | undefined) => {
    updateInput(key, value ?? '')
  }

  if (!calculation || calculation.type !== 'offset-memo') return null

  const calc = calculation.inputs
  const r = calculation.result
  const currency = item.currency

  const snapshot: CostingQuoteSnapshot = {
    itemId: item.id,
    itemTitle: item.title,
    calculatorType: item.calculatorType,
    currency,
    inputs,
    results: r as unknown as Record<string, number>,
    timestamp: new Date().toISOString(),
  }

  const breakdownData: CostingBreakdownData = {
    description: `Live estimate for ${calc.totalOrder} offset memos`,
    currency,
    extraSectionBlocks: [
      {
        title: 'Sheet calculation',
        lines: [
          {
            label: 'Memo size',
            value:
              calc.memoSize === '9x11.5'
                ? '9 × 11.5 inch'
                : '5.75 × 9 inch',
          },
          { label: 'Pieces per sheet', value: String(r.piecesPerSheet) },
          { label: 'Total sheets', value: String(r.totalSheets) },
        ],
      },
    ],
    rows: [
      {
        label: 'Design price',
        value: coerceNumber(calc.designPrice),
        decimals: 0,
      },
      {
        label: `Plate cost (${calc.totalColors} colors)`,
        value: r.plateCost,
        decimals: 0,
      },
      { label: 'Printing cost', value: r.printingCost, decimals: 0 },
      {
        label: `Binding (${calc.bindingType})`,
        value: r.bindingCost,
        decimals: 0,
      },
      { label: 'Packaging', value: r.packagingCost, decimals: 0 },
    ],
    totalLabel: 'Total cost',
    totalValue: r.totalCost,
    profitMargin:
      inputs.profitMargin !== undefined && inputs.profitMargin !== ''
        ? coerceNumber(inputs.profitMargin)
        : undefined,
    finalPrice: r.finalPrice,
    perUnitLabel: item.perUnitLabel ?? 'Price per memo',
    perUnitValue: r.pricePerUnit,
  }

  const qty = coerceNumber(calc.totalOrder)
  const unitPrice = qty > 0 ? r.finalPrice / qty : 0

  const customerSlipData: CostingCustomerSlipData = {
    itemTitle: item.title,
    productDetails: [
      calc.memoSize === '9x11.5'
        ? 'Size: 9 × 11.5 inch'
        : 'Size: 5.75 × 9 inch',
      `Binding: ${calc.bindingType === 'pad' ? 'Pad' : 'Memo'}`,
      `${calc.totalColors} color(s)`,
      'Paper: 80 GSM',
    ],
    quantity: qty,
    quantityLabel: 'Quantity (memos)',
    unitPrice,
    unitPriceLabel: item.perUnitLabel ?? 'Price per memo',
    subtotal: unitPrice * qty,
    total: r.finalPrice,
    currency,
    timestamp: snapshot.timestamp,
  }

  const breakdown = <CostingBreakdownCard {...breakdownData} />

  return (
    <CostingWizardShell
      title="Offset Memo Calculator"
      icon={<Receipt className="h-7 w-7 text-primary" />}
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      stepTitle={STEP_META[step].title}
      stepDescription={STEP_META[step].description}
      isLastStep={step === STEPS.length - 1}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
      summary={
        <>
          {breakdown}
          {step === STEPS.length - 1 && (
            <CostingQuickActions
              snapshot={snapshot}
              breakdown={breakdownData}
              customerSlip={customerSlipData}
              className="costing-no-print"
            />
          )}
        </>
      }
    >
      {step === 0 && (
        <div className="space-y-8">
          <CostingFormField label="Design price" hint="Artwork or setup charge.">
            <div className="flex items-center gap-3">
              <NumberInput
                className="h-10 w-full"
                value={costingNumberValue(inputs, 'designPrice')}
                onChange={(v) => setNumberInput('designPrice', v)}
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">{currency}</span>
            </div>
          </CostingFormField>

          <CostingFormField
            label="Total order"
            hint="How many memo pads or sheets to produce."
          >
            <NumberInput
              className="h-10 w-full"
              value={costingNumberValue(inputs, 'totalOrder')}
              onChange={(v) => setNumberInput('totalOrder', v)}
            />
          </CostingFormField>

          <CostingFormField label="Total colors (1–4)">
            <Select
              value={String(calc.totalColors)}
              onValueChange={(v) => updateInput('totalColors', Number(v))}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 color</SelectItem>
                <SelectItem value="2">2 colors</SelectItem>
                <SelectItem value="3">3 colors</SelectItem>
                <SelectItem value="4">4 colors</SelectItem>
              </SelectContent>
            </Select>
          </CostingFormField>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8">
          <CostingFormField label="Paper GSM">
            <Select
              value={calc.paperGSM}
              onValueChange={(v) => updateInput('paperGSM', v)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80gsm">80 GSM</SelectItem>
              </SelectContent>
            </Select>
          </CostingFormField>

          <CostingFormField label="Sheet size">
            <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
              23 inch × 36 inch (fixed)
            </div>
          </CostingFormField>

          <CostingFormField
            label="Memo size"
            hint="Determines how many pieces fit on each sheet."
          >
            <Select
              value={calc.memoSize}
              onValueChange={(v) =>
                updateInput('memoSize', v as '9x11.5' | '5.75x9')
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9x11.5">
                  9 × 11.5 inch (8 per sheet)
                </SelectItem>
                <SelectItem value="5.75x9">
                  5.75 × 9 inch (16 per sheet)
                </SelectItem>
              </SelectContent>
            </Select>
          </CostingFormField>

          <CostingFormField label="Per sheet price">
            <div className="flex items-center gap-3">
              <NumberInput
                className="h-10 w-full"
                value={costingNumberValue(inputs, 'perSheetPrice')}
                onChange={(v) => setNumberInput('perSheetPrice', v)}
              />
              <span className="text-sm text-muted-foreground">{currency}</span>
            </div>
          </CostingFormField>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <CostingFormField label="Binding type">
            <Select
              value={calc.bindingType}
              onValueChange={(v) =>
                updateInput('bindingType', v as 'pad' | 'memo')
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pad">Pad binding</SelectItem>
                <SelectItem value="memo">Memo binding</SelectItem>
              </SelectContent>
            </Select>
          </CostingFormField>

          <div className="grid gap-8 sm:grid-cols-2 max-w-2xl">
            <CostingFormField label="Pad binding rate (per 100)">
              <div className="flex items-center gap-3">
                <NumberInput
                  className="h-10 w-full"
                  value={costingNumberValue(inputs, 'padBindingRate')}
                  onChange={(v) => setNumberInput('padBindingRate', v)}
                />
                <span className="text-sm text-muted-foreground shrink-0">
                  {currency}
                </span>
              </div>
            </CostingFormField>
            <CostingFormField label="Memo binding rate (per 100)">
              <div className="flex items-center gap-3">
                <NumberInput
                  className="h-10 w-full"
                  value={costingNumberValue(inputs, 'memoBindingRate')}
                  onChange={(v) => setNumberInput('memoBindingRate', v)}
                />
                <span className="text-sm text-muted-foreground shrink-0">
                  {currency}
                </span>
              </div>
            </CostingFormField>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8">
          <CostingFormField
            label="Profit margin"
            hint="Percentage added on total production cost."
          >
            <div className="flex items-center gap-3">
              <NumberInput
                className="h-10 w-full"
                value={costingNumberValue(inputs, 'profitMargin')}
                onChange={(v) => setNumberInput('profitMargin', v)}
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </CostingFormField>
          <p className="text-sm text-muted-foreground max-w-md">
            Review the live breakdown on the right, then download the slip or
            export your quote.
          </p>
        </div>
      )}
    </CostingWizardShell>
  )
}
