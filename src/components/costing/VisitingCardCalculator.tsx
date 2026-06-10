import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import type { CostingItem, CostingQuoteSnapshot } from '@/interface/costingInterface'
import { useCostingCalculator } from '@/hooks/useCostingCalculator'
import { costingNumberValue } from '@/lib/costing/costingInputValue'
import type { CostingCustomerSlipData } from '@/lib/costing/customerSlipPrint'
import { coerceNumber } from '@/lib/numberInput'
import { NumberInput } from '@/components/ui/number-input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
  { id: 'job', title: 'Job details', shortTitle: 'Job' },
  { id: 'paper', title: 'Paper & size', shortTitle: 'Paper' },
  { id: 'finishing', title: 'Finishing', shortTitle: 'Finish' },
  { id: 'quote', title: 'Quote & profit', shortTitle: 'Quote' },
]

const STEP_META = [
  {
    title: 'Job details',
    description: 'How many cards, print sides, and color count.',
  },
  {
    title: 'Paper specifications',
    description: 'Sheet and card dimensions for layout planning.',
  },
  {
    title: 'Finishing options',
    description: 'Lamination, spot UV, and cutting method.',
  },
  {
    title: 'Profit & final quote',
    description: 'Add your margin and download or export the quote.',
  },
]

export function VisitingCardCalculator({ item }: { item: CostingItem }) {
  const [step, setStep] = useState(0)
  const { inputs, updateInput, calculation } = useCostingCalculator(item)

  if (!calculation || calculation.type !== 'visiting-card') return null

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
    description: `Live estimate for ${calc.totalQuantity} visiting cards`,
    currency,
    extraSectionBlocks: [
      {
        title: 'Sheet calculation',
        lines: [
          { label: 'Required sheets', value: String(r.sheetsRequired) },
          {
            label: `Wastage (${calc.colors} colors)`,
            value: `+${r.wastageSheets}`,
          },
          { label: 'Total sheets', value: String(r.totalSheets) },
        ],
      },
    ],
    rows: [
      {
        label: 'Design fee',
        value: coerceNumber(calc.designFee),
        decimals: 0,
      },
      {
        label: `Plate cost (${calc.colors} colors)`,
        value: r.plateCost,
        decimals: 0,
      },
      { label: 'Printing cost', value: r.printingCost, decimals: 0 },
      {
        label: 'Matt lamination',
        value: r.mattCost,
        hidden: !calc.mattLamination,
      },
      { label: 'Spot UV', value: r.spotCost, hidden: !calc.spotUV },
      {
        label: 'Film cost',
        value: r.filmCost,
        hidden: !calc.spotUV,
        decimals: 0,
      },
      {
        label: `Cutting (${calc.cuttingType})`,
        value: r.cuttingCost,
      },
      { label: 'Packaging', value: r.packagingCost },
    ],
    totalLabel: 'Total production cost',
    totalValue: r.totalProductionCost,
    profitMargin:
      inputs.profitMargin !== undefined && inputs.profitMargin !== ''
        ? coerceNumber(inputs.profitMargin)
        : undefined,
    finalPrice: r.finalPrice,
    perUnitLabel: item.perUnitLabel ?? 'Price per card',
    perUnitValue: r.pricePerUnit,
  }

  const qty = coerceNumber(calc.totalQuantity)
  const unitPrice = r.pricePerUnit

  const customerSlipData: CostingCustomerSlipData = {
    itemTitle: item.title,
    productDetails: [
      `Paper: ${calc.paperType}`,
      calc.sideSelection === 'both' ? 'Print: Both sides' : 'Print: Single side',
      `${calc.colors} color(s)`,
      `Card size: ${calc.cardWidth}" × ${calc.cardHeight}"`,
    ],
    quantity: qty,
    quantityLabel: 'Quantity (cards)',
    unitPrice,
    unitPriceLabel: item.perUnitLabel ?? 'Price per card',
    subtotal: unitPrice * qty,
    total: r.finalPrice,
    currency,
    timestamp: snapshot.timestamp,
  }

  const breakdown = <CostingBreakdownCard {...breakdownData} />

  return (
    <CostingWizardShell
      title="Visiting Card Calculator"
      icon={<CreditCard className="h-7 w-7 text-primary" />}
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
          <CostingFormField
            label="Print sides"
            hint="Single side or both sides of the card."
          >
            <Select
              value={calc.sideSelection}
              onValueChange={(v) =>
                updateInput('sideSelection', v as 'single' | 'both')
              }
            >
              <SelectTrigger className="h-10 w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single side</SelectItem>
                <SelectItem value="both">Both sides</SelectItem>
              </SelectContent>
            </Select>
          </CostingFormField>

          <CostingFormField
            label="Design fee"
            hint="Optional design or artwork charge."
          >
            <div className="flex items-center gap-3">
              <NumberInput
                className="h-10 w-full max-w-md"
                value={costingNumberValue(inputs, 'designFee')}
                onChange={(v) => updateInput('designFee', v ?? '')}
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">{currency}</span>
            </div>
          </CostingFormField>

          <CostingFormField
            label="Total quantity"
            hint="Number of visiting cards to produce."
          >
            <NumberInput
              className="h-10 w-full max-w-md"
              value={costingNumberValue(inputs, 'totalQuantity')}
              onChange={(v) => updateInput('totalQuantity', v ?? '')}
            />
          </CostingFormField>

          <CostingFormField
            label="Number of colors"
            hint="Used for plate, printing, and wastage calculations."
          >
            <Select
              value={String(calc.colors)}
              onValueChange={(v) => updateInput('colors', Number(v))}
            >
              <SelectTrigger className="h-10 w-full max-w-md">
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
          <CostingFormField label="Paper type">
            <Select
              value={calc.paperType}
              onValueChange={(v) => updateInput('paperType', v)}
            >
              <SelectTrigger className="h-10 w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Art Card">Art card</SelectItem>
                <SelectItem value="Matt Paper">Matt paper</SelectItem>
                <SelectItem value="Glossy Paper">Glossy paper</SelectItem>
              </SelectContent>
            </Select>
          </CostingFormField>

          <div className="grid gap-8 sm:grid-cols-2 max-w-2xl">
            <CostingFormField label="Sheet width (inch)">
              <NumberInput
                className="h-10 w-full"
                value={costingNumberValue(inputs, 'sheetWidth')}
                onChange={(v) => updateInput('sheetWidth', v ?? '')}
              />
            </CostingFormField>
            <CostingFormField label="Sheet height (inch)">
              <NumberInput
                className="h-10 w-full"
                value={costingNumberValue(inputs, 'sheetHeight')}
                onChange={(v) => updateInput('sheetHeight', v ?? '')}
              />
            </CostingFormField>
            <CostingFormField label="Card width (inch)">
              <NumberInput
                className="h-10 w-full"
                value={costingNumberValue(inputs, 'cardWidth')}
                onChange={(v) => updateInput('cardWidth', v ?? '')}
              />
            </CostingFormField>
            <CostingFormField label="Card height (inch)">
              <NumberInput
                className="h-10 w-full"
                value={costingNumberValue(inputs, 'cardHeight')}
                onChange={(v) => updateInput('cardHeight', v ?? '')}
              />
            </CostingFormField>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div className="space-y-4 max-w-md">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Checkbox
                id="matt"
                checked={calc.mattLamination}
                onCheckedChange={(c) =>
                  updateInput('mattLamination', Boolean(c))
                }
                className="mt-0.5"
              />
              <div>
                <Label htmlFor="matt" className="font-medium">
                  Matt lamination
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Adds lamination cost based on sheet count.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Checkbox
                id="spot"
                checked={calc.spotUV}
                onCheckedChange={(c) => updateInput('spotUV', Boolean(c))}
                className="mt-0.5"
              />
              <div>
                <Label htmlFor="spot" className="font-medium">Spot UV</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Includes film cost when enabled.
                </p>
              </div>
            </div>
          </div>

          <CostingFormField
            label="Cutting type"
            hint="Regular die cut vs dye cutting rate."
          >
            <Select
              value={calc.cuttingType}
              onValueChange={(v) =>
                updateInput('cuttingType', v as 'regular' | 'dye')
              }
            >
              <SelectTrigger className="h-10 w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">
                  Regular cutting (25 {currency}/1000)
                </SelectItem>
                <SelectItem value="dye">
                  Dye cutting (50 {currency}/1000)
                </SelectItem>
              </SelectContent>
            </Select>
          </CostingFormField>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8">
          <CostingFormField
            label="Profit margin"
            hint="Percentage added on top of production cost (same as original calculator)."
          >
            <div className="flex items-center gap-3">
              <NumberInput
                className="h-10 w-full max-w-md"
                value={costingNumberValue(inputs, 'profitMargin')}
                onChange={(v) => updateInput('profitMargin', v ?? '')}
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </CostingFormField>
          <p className="text-sm text-muted-foreground max-w-md">
            Your final price and export options are in the summary panel on the
            right. Download the slip or export when you are ready to share the quote.
          </p>
        </div>
      )}
    </CostingWizardShell>
  )
}
