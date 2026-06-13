import { useStocksReport } from '@/hooks/useReport'
import { useShopStore } from '@/stores/shopStore'
import { ReportCard } from '@/components/report/ReportCard'
import { formatReportCurrency } from '@/lib/reports/collectedProfit'
import Loader from '@/components/layout/Loader'
import { NoDataFound } from '@/components/NoDataFound'
import type { ReportV1HookParams } from '@/hooks/useReportV1'
import type { StockReportItem } from '@/interface/reportInterface'

type StockReportViewProps = {
  reportParams?: ReportV1HookParams
  enabled: boolean
}

export function StockReportView({ reportParams, enabled }: StockReportViewProps) {
  const shopId = useShopStore((s) => s.currentShopId)

  const { data, isLoading, isError } = useStocksReport(
    {
      page: 1,
      limit: 100,
      shopId: shopId ?? '',
      startDate: reportParams?.startDate ?? '',
      endDate: reportParams?.endDate ?? '',
      ids: [],
    },
    { enabled: enabled && !!shopId && !!reportParams }
  )

  const items: StockReportItem[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.stocks)
        ? data.stocks
        : []

  if (!shopId) {
    return (
      <NoDataFound
        message="Shop not configured"
        details="Inventory stock reports require a shop context. Configure shop in settings."
      />
    )
  }

  if (isLoading) return <Loader />

  if (isError || items.length === 0) {
    return (
      <NoDataFound
        message="No stock data"
        details="Stock report API may be unavailable or no inventory for this period."
      />
    )
  }

  const totalValue = items.reduce(
    (s, i) => s + (i.quantity ?? 0) * (i.lastPrice ?? 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ReportCard label="Stock items" value={items.length} format="number" />
        <ReportCard label="Est. stock value" value={totalValue} />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2 text-right">Quantity</th>
              <th className="px-4 py-2 text-right">Last price</th>
              <th className="px-4 py-2">Unit</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium">{item.name}</td>
                <td className="px-4 py-2 text-right tabular-nums">{item.quantity}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {formatReportCurrency(item.lastPrice ?? 0)}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {item.unitOfMeasurement?.name ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
