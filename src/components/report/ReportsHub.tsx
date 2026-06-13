import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ReportCategory,
  REPORT_CATEGORY_LABELS,
  REPORT_DEFINITIONS,
  getReportsByCategory,
} from '@/utils/enums/reportType'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportCardGridItem } from '@/components/report/ReportsLayout'

const CATEGORY_ORDER: ReportCategory[] = [
  ReportCategory.OVERVIEW,
  ReportCategory.REVENUE,
  ReportCategory.COSTS,
  ReportCategory.OPERATIONS,
]

export function ReportsHub() {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  const suffix = query ? `?${query}` : ''

  const [category, setCategory] = useState<ReportCategory>(ReportCategory.OVERVIEW)

  const reportsInCategory = useMemo(
    () => getReportsByCategory(category),
    [category]
  )

  return (
    <div className="space-y-4">
      <Tabs
        value={category}
        onValueChange={(v) => setCategory(v as ReportCategory)}
      >
        <TabsList className="flex flex-wrap h-auto gap-1">
          {CATEGORY_ORDER.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
              {REPORT_CATEGORY_LABELS[cat]}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORY_ORDER.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {getReportsByCategory(cat).map((report) => (
                <ReportCardGridItem
                  key={report.slug}
                  name={report.name}
                  description={report.description}
                  audience={report.audience}
                  href={`/reports/${report.slug}${suffix}`}
                  icon={report.icon}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {reportsInCategory.length === 0 && (
        <p className="text-sm text-muted-foreground">No reports in this category.</p>
      )}

      <p className="text-xs text-muted-foreground">
        {REPORT_DEFINITIONS.length} reports · profit uses collected amounts (pending
        excluded)
      </p>
    </div>
  )
}
