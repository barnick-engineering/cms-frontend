import { FileText, Receipt, Truck } from 'lucide-react'

type BillingOverviewCardsProps = {
  invoiceCount: number
  quotationCount: number
  deliveryChallanCount: number
  totalDocuments: number
  isLoading?: boolean
}

export function BillingOverviewCards({
  invoiceCount,
  quotationCount,
  deliveryChallanCount,
  totalDocuments,
  isLoading,
}: BillingOverviewCardsProps) {
  const items = [
    { label: 'Total documents', value: totalDocuments, icon: FileText },
    { label: 'Invoices', value: invoiceCount, icon: Receipt },
    { label: 'Quotations', value: quotationCount, icon: FileText },
    { label: 'Delivery challans', value: deliveryChallanCount, icon: Truck },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border bg-card px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <item.icon className="h-4 w-4" />
            <span className="text-xs font-medium">{item.label}</span>
          </div>
          {isLoading ? (
            <div className="mt-2 h-7 w-12 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
