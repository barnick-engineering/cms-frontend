import { useQuery } from '@tanstack/react-query'
import {
  fetchCustomerWorkOrdersReport,
  fetchBalanceSheetReport,
  fetchWorkOrderDetailsReport,
  fetchExpensesReportV1,
  fetchTrendingReport,
} from '@/api/reportV1Api'
import type { ReportV1Params } from '@/interface/reportV1Interface'

export interface ReportV1HookParams {
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

function toApiParams(params?: ReportV1HookParams): ReportV1Params {
  return {
    ...(params?.startDate && { start_date: params.startDate }),
    ...(params?.endDate && { end_date: params.endDate }),
    ...(params?.limit != null && { limit: params.limit }),
    ...(params?.offset != null && { offset: params.offset }),
  }
}

export function useCustomerWorkOrdersReport(
  params: ReportV1HookParams | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['reportV1', 'customerWorkOrders', params],
    queryFn: () => fetchCustomerWorkOrdersReport(toApiParams(params ?? {})),
    enabled: options?.enabled ?? true,
  })
}

export function useBalanceSheetReportV1(
  params: ReportV1HookParams | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['reportV1', 'balanceSheet', params],
    queryFn: () => fetchBalanceSheetReport(toApiParams(params)),
    enabled: options?.enabled ?? true,
  })
}

export function useWorkOrderDetailsReport(
  params: ReportV1HookParams | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['reportV1', 'workOrderDetails', params],
    queryFn: () => fetchWorkOrderDetailsReport(toApiParams(params ?? {})),
    enabled: options?.enabled ?? true,
  })
}

export function useExpensesReportV1(
  params: ReportV1HookParams | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['reportV1', 'expenses', params],
    queryFn: () => fetchExpensesReportV1(toApiParams(params ?? {})),
    enabled: options?.enabled ?? true,
  })
}

export function useTrendingReport(
  params: ReportV1HookParams | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['reportV1', 'trending', params],
    queryFn: () => fetchTrendingReport(toApiParams(params)),
    enabled: options?.enabled ?? true,
  })
}
