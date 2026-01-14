import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { NoDataFound } from "@/components/NoDataFound"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import type { BalanceSheetDayItem, BalanceSheetItem } from "@/interface/reportInterface"

interface BalanceSheetTableProps {
  data: BalanceSheetDayItem[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onDownloadPdf: () => void
  onDownloadExcel?: () => void
  title?: string
}

const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case 'PURCHASE':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'SALE':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'PAYMENT':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'RECEIVABLE':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'COMMISSION':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
}

const renderItem = (item: BalanceSheetItem, index: number) => {
  if (item.type === "transaction") {
    return (
      <TableRow key={`${item.id}-${index}`}>
        <TableCell className="text-center">{item.no || "N/A"}</TableCell>
        <TableCell>
          <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(item.transactionType)}`}>
            {item.transactionType}
          </Badge>
        </TableCell>
        <TableCell>{item.customerName || item.vendorName || "N/A"}</TableCell>
        <TableCell className="text-right">{item.totalAmount.toFixed(2)}</TableCell>
        <TableCell className="text-right text-green-600">{item.paid.toFixed(2)}</TableCell>
        <TableCell className={`text-right ${item.pending > 0 ? "text-destructive font-bold" : ""}`}>
          {item.pending.toFixed(2)}
        </TableCell>
        <TableCell>{item.paymentType}</TableCell>
        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
      </TableRow>
    )
  } else {
    return (
      <TableRow key={`${item.id}-${index}`}>
        <TableCell className="text-center">N/A</TableCell>
        <TableCell>
          <Badge variant="secondary" className="font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            EXPENSE
          </Badge>
        </TableCell>
        <TableCell>{item.expenseTitle}</TableCell>
        <TableCell className="text-right">{item.expenseAmount.toFixed(2)}</TableCell>
        <TableCell className="text-right">N/A</TableCell>
        <TableCell className="text-right">N/A</TableCell>
        <TableCell>N/A</TableCell>
        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
      </TableRow>
    )
  }
}

export const BalanceSheetTable = ({
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onDownloadPdf,
  onDownloadExcel,
  title = "Balance Sheet Report",
}: BalanceSheetTableProps) => {
  // Calculate pagination
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, pageIndex, pageSize])

  const pageCount = Math.ceil(total / pageSize)

  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      onPageChange(pageIndex - 1)
    }
  }

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) {
      onPageChange(pageIndex + 1)
    }
  }

  return (
    <div className="space-y-4 mt-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
        <div className="flex flex-col md:items-center gap-2">
          {onDownloadExcel && (
            <Button onClick={onDownloadExcel}>Download as Excel</Button>
          )}
          <Button onClick={onDownloadPdf} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {paginatedData.length === 0 ? (
        <Card className="m-4">
          <CardContent>
            <NoDataFound
              message="No balance sheet data found!"
              details="Try selecting a different date range."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {paginatedData.map((dayItem) => (
            <div key={dayItem.date} className="rounded-md border">
              {/* Date Header */}
              <div className="bg-muted/50 px-4 py-3 border-b">
                <h3 className="text-lg font-semibold">
                  {new Date(dayItem.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
              </div>

              {/* Items Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Ref No</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dayItem.items.length > 0 ? (
                    dayItem.items.map((item, itemIndex) => renderItem(item, itemIndex))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No items for this date
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Closing Balance Summary */}
              <div className="bg-muted/30 px-4 py-3 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Opening Balance:</span>
                    <span className="ml-2 font-semibold">{dayItem.closingBalance.openingBalance.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-green-600">Total In:</span>
                    <span className="ml-2 font-semibold">{dayItem.closingBalance.totalInflow.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-red-600">Total Out:</span>
                    <span className="ml-2 font-semibold">{dayItem.closingBalance.totalOutflow.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Closing Balance:</span>
                    <span className="ml-2 font-semibold">{dayItem.closingBalance.closingBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, total)} of {total} dates
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pageIndex === 0}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {pageIndex + 1} of {pageCount}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pageIndex >= pageCount - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
