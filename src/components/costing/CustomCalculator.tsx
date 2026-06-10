import { useMemo, useState } from 'react'
import { Calculator } from 'lucide-react'
import type { CostingItem, CostingQuoteSnapshot } from '@/interface/costingInterface'
import { useCostingCalculator } from '@/hooks/useCostingCalculator'
import { filterBreakdownLines } from '@/lib/costing/calculateCustom'
import type { CostingCustomerSlipData } from '@/lib/costing/customerSlipPrint'
import { coerceNumber } from '@/lib/numberInput'
import {
  CostingBreakdownCard,
  type CostingBreakdownData,
} from './CostingBreakdownCard'
import { CostingFieldRenderer } from './CostingFieldRenderer'
import { CostingQuickActions } from './CostingQuickActions'
import { CostingWizardShell } from './CostingWizardShell'

const STEPS = [
  { id: 'inputs', title: 'Enter details', shortTitle: 'Details' },
  { id: 'quote', title: 'Review quote', shortTitle: 'Quote' },
]

export function CustomCalculator({ item }: { item: CostingItem }) {
  const [step, setStep] = useState(0)
  const { inputs, updateInput, calculation, flatResults } =
    useCostingCalculator(item)

  const fields = item.fields ?? []
  const mid = Math.ceil(fields.length / 2)
  const fieldGroups = useMemo(() => {
    if (fields.length <= 4) return [fields]
    return [fields.slice(0, mid), fields.slice(mid)]
  }, [fields, mid])

  if (!calculation || calculation.type !== 'custom') return null

  const currency = item.currency
  const breakdownLines = filterBreakdownLines(item, inputs, flatResults)

  const finalPrice =
    flatResults.finalPrice ??
    flatResults.totalCost ??
    flatResults.totalProductionCost ??
    0
  const totalValue =
    flatResults.totalCost ??
    flatResults.totalProductionCost ??
    finalPrice

  const snapshot: CostingQuoteSnapshot = {
    itemId: item.id,
    itemTitle: item.title,
    calculatorType: item.calculatorType,
    currency,
    inputs,
    results: flatResults,
    timestamp: new Date().toISOString(),
  }

  const perUnitValue =
    item.perUnitLabel
      ? flatResults.pricePerUnit ??
        (flatResults.finalPrice && inputs.quantity
          ? Number(flatResults.finalPrice) / Number(inputs.quantity)
          : undefined)
      : undefined

  const breakdownData: CostingBreakdownData = {
    currency,
    rows: breakdownLines.map((line) => ({
      label: line.label,
      value: line.value,
      decimals: line.decimals,
    })),
    totalLabel: 'Subtotal',
    totalValue: totalValue,
    finalPrice: finalPrice,
    perUnitLabel: item.perUnitLabel,
    perUnitValue: perUnitValue,
  }

  const quantityKey =
    fields.find((f) => f.key === 'quantity')?.key ??
    fields.find((f) => f.type === 'number')?.key
  const qty = quantityKey ? coerceNumber(inputs[quantityKey]) : 0
  const unitPrice =
    perUnitValue ??
    (qty > 0 ? finalPrice / qty : 0)

  const customerProductDetails = fields
    .filter(
      (f) =>
        f.key !== 'profitMargin' &&
        f.key !== quantityKey &&
        inputs[f.key] !== undefined &&
        inputs[f.key] !== ''
    )
    .map((f) => {
      const val = inputs[f.key]
      if (f.type === 'checkbox') {
        return val ? f.label : undefined
      }
      return `${f.label}: ${val}`
    })
    .filter((line): line is string => Boolean(line))

  const customerSlipData: CostingCustomerSlipData = {
    itemTitle: item.title,
    productDetails:
      customerProductDetails.length > 0 ? customerProductDetails : undefined,
    quantity: qty,
    quantityLabel: 'Quantity',
    unitPrice,
    unitPriceLabel: item.perUnitLabel ?? 'Unit price',
    subtotal: unitPrice * qty,
    total: finalPrice,
    currency,
    timestamp: snapshot.timestamp,
  }

  const breakdown = <CostingBreakdownCard {...breakdownData} />

  return (
    <CostingWizardShell
      title={`${item.title} Calculator`}
      icon={<Calculator className="h-7 w-7 text-primary" />}
      steps={
        fieldGroups.length > 1
          ? [
              { id: 'inputs-a', title: 'Details (1)', shortTitle: 'Details' },
              { id: 'inputs-b', title: 'Details (2)', shortTitle: 'More' },
              { id: 'quote', title: 'Review quote', shortTitle: 'Quote' },
            ]
          : STEPS
      }
      currentStep={step}
      onStepChange={setStep}
      stepTitle={
        step === STEPS.length - 1 || (fieldGroups.length > 1 && step === 2)
          ? 'Review your quote'
          : fieldGroups.length > 1 && step === 1
            ? 'Additional details'
            : 'Enter calculation details'
      }
      stepDescription={
        step === 0 || (fieldGroups.length > 1 && step < 2)
          ? 'Fill in each field — estimates update live on the right.'
          : 'Download slip or export when ready.'
      }
      isLastStep={
        fieldGroups.length > 1 ? step === 2 : step === STEPS.length - 1
      }
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() =>
        setStep((s) =>
          Math.min(fieldGroups.length > 1 ? 2 : STEPS.length - 1, s + 1)
        )
      }
      summary={
        <>
          {breakdown}
          {(fieldGroups.length > 1 ? step === 2 : step === 1) && (
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
      {fieldGroups.length <= 1 && step === 0 && (
        <div className="space-y-8">
          {fields.map((field) => (
            <CostingFieldRenderer
              key={field.key}
              field={field}
              value={inputs[field.key] ?? ''}
              currency={field.type === 'number' ? currency : undefined}
              onChange={(v) => updateInput(field.key, v)}
            />
          ))}
        </div>
      )}

      {fieldGroups.length > 1 && step === 0 && (
        <div className="space-y-8">
          {fieldGroups[0].map((field) => (
            <CostingFieldRenderer
              key={field.key}
              field={field}
              value={inputs[field.key] ?? ''}
              currency={field.type === 'number' ? currency : undefined}
              onChange={(v) => updateInput(field.key, v)}
            />
          ))}
        </div>
      )}

      {fieldGroups.length > 1 && step === 1 && (
        <div className="space-y-8">
          {fieldGroups[1].map((field) => (
            <CostingFieldRenderer
              key={field.key}
              field={field}
              value={inputs[field.key] ?? ''}
              currency={field.type === 'number' ? currency : undefined}
              onChange={(v) => updateInput(field.key, v)}
            />
          ))}
        </div>
      )}

      {(fieldGroups.length > 1 ? step === 2 : step === 1) && (
        <p className="text-sm text-muted-foreground max-w-md">
          All inputs are saved. Use the summary panel to download the slip or
          export your quote.
        </p>
      )}
    </CostingWizardShell>
  )
}
