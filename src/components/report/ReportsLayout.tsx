import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import DateRangeSearch from '@/components/DateRangeSearch'
import { Button } from '@/components/ui/button'
import {
  DATE_PRESETS,
  type DatePresetId,
} from '@/hooks/useReportDateRange'
import { ReportsExecutiveStrip } from '@/components/report/ReportsExecutiveStrip'
import { ReportSwitcher } from '@/components/report/ReportSwitcher'
import type { ReportSlug } from '@/utils/enums/reportType'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'

type ReportsLayoutProps = {
  mode: 'hub' | 'detail'
  reportName?: string
  currentSlug?: ReportSlug
  dateRange?: DateRange
  preset: DatePresetId
  onPresetChange: (id: DatePresetId) => void
  onDateChange: (from?: Date, to?: Date) => void
  executiveStrip?: {
    worked?: number
    paid?: number
    pending?: number
    expenses?: number
    isLoading?: boolean
  }
  children: React.ReactNode
}

export function ReportsLayout({
  mode,
  reportName,
  currentSlug,
  dateRange,
  preset,
  onPresetChange,
  onDateChange,
  executiveStrip,
  children,
}: ReportsLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {mode === 'detail' ? (
            <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <Link to="/reports" className="hover:text-foreground hover:underline">
                Reports
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{reportName}</span>
            </nav>
          ) : null}
          <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'hub'
              ? 'Cross-functional reports for your team'
              : 'Period analytics with export'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        {mode === 'detail' && currentSlug && (
          <ReportSwitcher currentSlug={currentSlug} />
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((p) => (
              <Button
                key={p.id}
                type="button"
                size="sm"
                variant={preset === p.id ? 'default' : 'outline'}
                className="h-8"
                onClick={() => onPresetChange(p.id)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <DateRangeSearch value={dateRange} onDateChange={onDateChange} />
        </div>

        {executiveStrip && (
          <ReportsExecutiveStrip
            worked={executiveStrip.worked}
            paid={executiveStrip.paid}
            pending={executiveStrip.pending}
            expenses={executiveStrip.expenses}
            isLoading={executiveStrip.isLoading}
          />
        )}
      </div>

      {children}
    </div>
  )
}

type ReportCardGridItemProps = {
  name: string
  description: string
  audience: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export function ReportCardGridItem({
  name,
  description,
  audience,
  href,
  icon: Icon,
}: ReportCardGridItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group rounded-lg border bg-card p-4 transition-colors',
        'hover:border-foreground/20 hover:bg-muted/30'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md border bg-muted/50 p-2">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{name}</p>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">{audience}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  )
}
