import { useQuery } from "@tanstack/react-query"
import { reportBalanceSheet, reportExpenses, reportStocks, reportStocksTracking, reportTransactions } from "@/api/reportApi"
import type { BalanceSheetParams, ExpensesReportParams, StocksReportParams, TransactionReportParams } from "@/interface/reportInterface"

export const useTransactionReport = (
  params: Partial<TransactionReportParams>,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["transactionReport", params],
    queryFn: () => reportTransactions(params as TransactionReportParams),
    enabled: !!params.shopId &&
      !!params.transactionTypes &&
      params.transactionTypes.length > 0 &&
      (options?.enabled ?? true),
  })
}

export const useExpensesReport = (
  params: Partial<ExpensesReportParams>,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["expensesReport", params],
    queryFn: () => reportExpenses(params as ExpensesReportParams),
    enabled: !!params.shopId && (options?.enabled ?? true),
  })
}

export const useStocksReport = (
  params: Partial<StocksReportParams>,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["stocksReport", params],
    queryFn: () => reportStocks(params as StocksReportParams),
    enabled: !!params.shopId && (options?.enabled ?? true),
  })
}

export const useStocksReportTracking = (
  params: Partial<StocksReportParams>,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["stocksReportTracking", params],
    queryFn: () => reportStocksTracking(params as StocksReportParams),
    enabled: !!params.shopId && (options?.enabled ?? true),
  })
}

export const useBalanceSheetReport = (
  params: Partial<BalanceSheetParams>,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["balanceSheetReport", params],
    queryFn: () => reportBalanceSheet(params as BalanceSheetParams),
    enabled: !!params.shopId && (options?.enabled ?? true),
  })
}