import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"

export interface MonthlySalesEntry {
    month: string
    total_sell: number
    total_paid: number
}

export interface DashboardData {
    worked: number
    paid: number
    total_pending: number
    total_customer: number
    total_product: number
    total_workorder: number
    total_vendor: number
    total_regular_expense: number
    total_net_profit: number
    monthly_sales: MonthlySalesEntry[]
    recent_workorders: Array<{
        no: string
        customer: string
        amount: number
        paid: number
        is_delivered: boolean
    }>
}

export interface DashboardResponse {
    data: DashboardData
    response_message: string
    response_code: number
}

// dashboard api
export interface DashboardParams {
    start_date?: string // YYYY-MM-DD
    end_date?: string // YYYY-MM-DD
}

export const fetchDashboardData = async (params?: DashboardParams) => {
    const res = await axiosInstance.get<DashboardResponse>(apiEndpoints.dashbaord.dashboardReport, {
        params: params,
    })
    return res.data
}