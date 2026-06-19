import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import DateRangeSearch from '@/components/DateRangeSearch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BillingDocumentPreviewDialog } from '@/components/billing/BillingDocumentPreviewDialog'
import { BillingOverviewCards } from '@/components/billing/BillingOverviewCards'
import { useBillingOverview } from '@/hooks/useBilling'
import type {
  BillingDocument,
  BillingDocumentListParams,
  BillingDocumentStatus,
  BillingDocumentType,
} from '@/interface/billingInterface'
import { BILLING_DOCUMENT_TYPE_LABELS } from '@/interface/billingInterface'
import { formatDateToString, parseDateString } from '@/lib/loanDateUtils'
import { Download, Eye, Plus } from 'lucide-react'

type BillingDocumentListProps = {
  documents: BillingDocument[]
  total: number
  filters: BillingDocumentListParams
  onFiltersChange: (filters: BillingDocumentListParams) => void
  onSelect: (doc: BillingDocument) => void
  onCreate: () => void
  isLoading?: boolean
}

function filtersToDateRange(
  filters: BillingDocumentListParams
): DateRange | undefined {
  if (!filters.start_date || !filters.end_date) return undefined
  return {
    from: parseDateString(filters.start_date),
    to: parseDateString(filters.end_date),
  }
}

function formatDocumentDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try {
    return format(parseDateString(dateStr.split('T')[0]), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function BillingDocumentList({
  documents,
  total,
  filters,
  onFiltersChange,
  onSelect,
  onCreate,
  isLoading,
}: BillingDocumentListProps) {
  const [previewId, setPreviewId] = useState<number | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [downloadPrint, setDownloadPrint] = useState(false)

  const overviewParams = useMemo(
    () => ({
      start_date: filters.start_date,
      end_date: filters.end_date,
      search: filters.search,
      status: filters.status,
      customer_id: filters.customer_id,
      work_order_id: filters.work_order_id,
    }),
    [filters]
  )

  const overview = useBillingOverview(overviewParams)

  const dateRange = filtersToDateRange(filters)

  const openPreview = (doc: BillingDocument, print = false) => {
    setPreviewId(doc.id)
    setDownloadPrint(print)
    setPreviewOpen(true)
  }

  return (
    <div className="space-y-4 billing-no-print">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Saved Documents</h2>
          <p className="text-sm text-muted-foreground">
            {total} document(s) in selected period
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      <BillingOverviewCards
        invoiceCount={overview.invoice_count}
        quotationCount={overview.quotation_count}
        deliveryChallanCount={overview.delivery_challan_count}
        totalDocuments={overview.total_documents}
        isLoading={overview.isLoading}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Input
          className="w-full sm:max-w-xs"
          placeholder="Search recipient, subject, number..."
          value={filters.search ?? ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value, offset: 0 })
          }
        />
        <DateRangeSearch
          value={dateRange}
          onDateChange={(from, to) =>
            onFiltersChange({
              ...filters,
              start_date: from ? formatDateToString(from) : undefined,
              end_date: to ? formatDateToString(to) : undefined,
              offset: 0,
            })
          }
        />
        <Select
          value={filters.document_type ?? 'all'}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              document_type: v === 'all' ? undefined : (v as BillingDocumentType),
              offset: 0,
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(Object.keys(BILLING_DOCUMENT_TYPE_LABELS) as BillingDocumentType[]).map(
              (type) => (
                <SelectItem key={type} value={type}>
                  {BILLING_DOCUMENT_TYPE_LABELS[type]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              status: v === 'all' ? undefined : (v as BillingDocumentStatus),
              offset: 0,
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="finalized">Finalized</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No documents found
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              documents.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelect(doc)}
                >
                  <TableCell>
                    {BILLING_DOCUMENT_TYPE_LABELS[doc.document_type]}
                  </TableCell>
                  <TableCell>{doc.document_number || '—'}</TableCell>
                  <TableCell>{doc.recipient || '—'}</TableCell>
                  <TableCell>{formatDocumentDate(doc.document_date)}</TableCell>
                  <TableCell>{doc.total?.toLocaleString('en-IN') ?? '0'}/-</TableCell>
                  <TableCell>
                    <Badge variant={doc.document_status === 'draft' ? 'secondary' : 'default'}>
                      {doc.document_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="flex justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Preview"
                        onClick={() => openPreview(doc, false)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Download / Print"
                        onClick={() => openPreview(doc, true)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <BillingDocumentPreviewDialog
        documentId={previewId}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        autoPrint={downloadPrint}
      />
    </div>
  )
}
