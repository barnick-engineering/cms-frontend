import { apiEndpoints } from '@/config/api'
import { axiosInstance } from './axios'
import type { ReportV1Params } from '@/interface/reportV1Interface'
import type {
  CustomerWorkOrderReportResponse,
  BalanceSheetReportResponse,
  WorkOrderDetailsReportPaginatedResponse,
  ExpenseReportV1Response,
  TrendingReportResponse,
} from '@/interface/reportV1Interface'

type BarnickWrapper<T> = { data: T; response_message: string; response_code: number }

function getParams(params?: ReportV1Params): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  if (params?.start_date) out.start_date = params.start_date
  if (params?.end_date) out.end_date = params.end_date
  if (params?.limit != null) out.limit = params.limit
  if (params?.offset != null) out.offset = params.offset
  return out
}

export async function fetchCustomerWorkOrdersReport(
  params?: ReportV1Params
): Promise<CustomerWorkOrderReportResponse> {
  const res = await axiosInstance.get<CustomerWorkOrderReportResponse>(
    apiEndpoints.reports.customerWorkOrders,
    { params: getParams(params) }
  )
  return res.data
}

export async function fetchBalanceSheetReport(
  params?: ReportV1Params
): Promise<BalanceSheetReportResponse> {
  const res = await axiosInstance.get<BarnickWrapper<BalanceSheetReportResponse>>(
    apiEndpoints.reports.balanceSheet,
    { params: getParams(params) }
  )
  return res.data.data
}

export async function fetchWorkOrderDetailsReport(
  params?: ReportV1Params
): Promise<WorkOrderDetailsReportPaginatedResponse> {
  const res = await axiosInstance.get<WorkOrderDetailsReportPaginatedResponse>(
    apiEndpoints.reports.workOrderDetails,
    { params: getParams(params) }
  )
  return res.data
}

export async function fetchExpensesReportV1(
  params?: ReportV1Params
): Promise<ExpenseReportV1Response> {
  const res = await axiosInstance.get<ExpenseReportV1Response>(
    apiEndpoints.reports.expenses,
    { params: getParams(params) }
  )
  return res.data
}

export async function fetchTrendingReport(
  params?: ReportV1Params
): Promise<TrendingReportResponse> {
  const res = await axiosInstance.get<BarnickWrapper<TrendingReportResponse>>(
    apiEndpoints.reports.trending,
    { params: getParams(params) }
  )
  return res.data.data
}
