import { useLoanList } from '@/hooks/useLoan'
import { ReportCard } from '@/components/report/ReportCard'
import { formatReportCurrency } from '@/lib/reports/collectedProfit'
import Loader from '@/components/layout/Loader'
import { NoDataFound } from '@/components/NoDataFound'
import type { ReportV1HookParams } from '@/hooks/useReportV1'

type LoanSummaryReportProps = {
  reportParams?: ReportV1HookParams
  enabled: boolean
}

export function LoanSummaryReport({
  reportParams,
  enabled,
}: LoanSummaryReportProps) {
  const { data, isLoading } = useLoanList(
    undefined,
    reportParams?.startDate,
    reportParams?.endDate,
    undefined,
    100,
    0,
    { enabled }
  )

  const loans = data?.data ?? []
  const summary = data?.summary

  if (isLoading) return <Loader />

  if (loans.length === 0) {
    return (
      <NoDataFound message="No loans" details="No loan records for this period." />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard label="Total loan" value={summary?.total_loan ?? 0} />
        <ReportCard label="Total paid" value={summary?.total_paid ?? 0} />
        <ReportCard label="Outstanding" value={summary?.total_remaining ?? 0} />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2">Loan for</th>
              <th className="px-4 py-2">From</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-right">Paid</th>
              <th className="px-4 py-2 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium">{loan.loan_for}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {loan.loan_from ?? '—'}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {formatReportCurrency(loan.amount)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {formatReportCurrency(loan.paid)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">
                  {formatReportCurrency(loan.remaining)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
