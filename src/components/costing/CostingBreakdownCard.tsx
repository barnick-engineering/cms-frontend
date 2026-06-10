import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { CostingCurrency } from '@/interface/costingInterface'

export type BreakdownRow = {
  label: string
  value: number
  decimals?: number
  hidden?: boolean
}

export type CostingBreakdownExtraSection = {
  title?: string
  lines: { label: string; value: string }[]
}

export type CostingBreakdownData = {
  title?: string
  description?: string
  currency: CostingCurrency
  rows: BreakdownRow[]
  totalLabel: string
  totalValue: number
  profitMargin?: number
  finalPrice: number
  perUnitLabel?: string
  perUnitValue?: number
  extraSectionBlocks?: CostingBreakdownExtraSection[]
}

type CostingBreakdownCardProps = CostingBreakdownData

export function CostingBreakdownCard({
  title = 'Cost Breakdown',
  description,
  currency,
  rows,
  totalLabel,
  totalValue,
  profitMargin,
  finalPrice,
  perUnitLabel,
  perUnitValue,
  extraSectionBlocks,
}: CostingBreakdownCardProps) {
  const fmt = (n: number, decimals = 2) =>
    decimals === 0 ? String(n) : n.toFixed(decimals)

  return (
    <Card className="costing-no-print shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {extraSectionBlocks?.map((block, index) => (
          <div
            key={block.title ?? `extra-${index}`}
            className="rounded-md bg-muted/50 p-3 text-sm space-y-2"
          >
            {block.title && <p className="font-medium">{block.title}</p>}
            {block.lines.map((line) => (
              <div key={line.label} className="flex justify-between gap-4">
                <span>{line.label}</span>
                <span className="font-medium">{line.value}</span>
              </div>
            ))}
          </div>
        ))}

        <div className="space-y-2">
          {rows
            .filter((r) => !r.hidden)
            .map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span>{row.label}</span>
                <span className="font-medium">
                  {fmt(row.value, row.decimals)} {currency}
                </span>
              </div>
            ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-lg font-semibold">
            <span>{totalLabel}</span>
            <span>{fmt(totalValue)} {currency}</span>
          </div>
          {profitMargin !== undefined && (
            <div className="flex justify-between text-sm">
              <span>Profit margin</span>
              <span className="font-medium">{profitMargin}%</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-xl font-bold text-primary">
            <span>Final Price</span>
            <span>{fmt(finalPrice)} {currency}</span>
          </div>
        </div>

        {perUnitLabel && perUnitValue !== undefined && (
          <Badge variant="secondary" className="w-full justify-center py-2">
            {perUnitLabel}: {fmt(perUnitValue)} {currency}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
