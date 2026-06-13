import { Card, CardContent } from '../ui/card'
import { formatReportCurrency } from '@/lib/reports/collectedProfit'

type ReportCardProps = {
  label: string
  value: number | string
  format?: 'currency' | 'number' | 'percent' | 'raw'
}

export function ReportCard({ label, value, format = 'currency' }: ReportCardProps) {
  let display: string
  if (typeof value === 'string') {
    display = value
  } else if (format === 'currency') {
    display = formatReportCurrency(value)
  } else if (format === 'percent') {
    display = `${value.toFixed(1)}%`
  } else if (format === 'number') {
    display = String(value)
  } else {
    display = String(value)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tabular-nums">{display}</p>
      </CardContent>
    </Card>
  )
}
