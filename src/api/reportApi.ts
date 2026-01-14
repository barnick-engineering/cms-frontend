import { apiEndpoints } from "@/config/api";
import { axiosInstance } from "./axios";
import type { BalanceSheetParams, ExpensesReportParams, StocksReportParams, TransactionReportParams } from "@/interface/reportInterface";

export const reportTransactions = async (params: TransactionReportParams) => {
    const res = await axiosInstance.get(
        apiEndpoints.reports.reportTransactions, {
        params: {
            ...params,
            transactionTypes: params.transactionTypes
        }
    }
    )
    return res.data
}

export const reportExpenses = async (params: ExpensesReportParams) => {
    const res = await axiosInstance.get(apiEndpoints.reports.reportExpenses, { params })
    return res.data.data
}

export const reportStocks = async (params: Partial<StocksReportParams>) => {
    const res = await axiosInstance.get(apiEndpoints.reports.reportStocks, { params })
    return res.data
}

export const reportStocksTracking = async (params: Partial<StocksReportParams>) => {
    const res = await axiosInstance.get(apiEndpoints.reports.reportStockTrack, { params })
    return res.data
}

export const reportBalanceSheet = async (params: BalanceSheetParams) => {
    const res = await axiosInstance.get(apiEndpoints.reports.reportBalanceSheet, { params })
    return res.data
}