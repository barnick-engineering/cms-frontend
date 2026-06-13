import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import {
  REPORT_DEFINITIONS,
  type ReportSlug,
} from '@/utils/enums/reportType'
import { buildReportHref } from '@/lib/reports/reportLinks'

type ReportSwitcherProps = {
  currentSlug: ReportSlug
}

export function ReportSwitcher({ currentSlug }: ReportSwitcherProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const options = useMemo(
    () =>
      REPORT_DEFINITIONS.map((r) => ({
        value: r.slug,
        label: r.name,
      })),
    []
  )

  const currentLabel =
    REPORT_DEFINITIONS.find((r) => r.slug === currentSlug)?.name ?? 'Select report'

  const handleSelect = (value: string) => {
    if (!value || value === currentSlug) return
    const from = searchParams.get('from') ?? undefined
    const to = searchParams.get('to') ?? undefined
    navigate(buildReportHref(value as ReportSlug, from, to))
  }

  const hubHref = (() => {
    const q = searchParams.toString()
    return `/reports${q ? `?${q}` : ''}`
  })()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
        <Link to={hubHref}>
          <LayoutGrid className="h-4 w-4" />
          All reports
        </Link>
      </Button>
      <div className="min-w-[200px] sm:min-w-[280px]">
        <Combobox
          options={options}
          value={currentSlug}
          placeholder="Switch report…"
          emptyMessage="No reports found"
          onSelect={handleSelect}
          className="w-full"
        />
      </div>
      <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[200px]">
        {currentLabel}
      </span>
    </div>
  )
}
