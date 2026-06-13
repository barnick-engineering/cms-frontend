import { ReportSlug } from '@/utils/enums/reportType'

export function buildReportHref(
  slug: ReportSlug,
  from?: string,
  to?: string
) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const q = params.toString()
  return `/reports/${slug}${q ? `?${q}` : ''}`
}
