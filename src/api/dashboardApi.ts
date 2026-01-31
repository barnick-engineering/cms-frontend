import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"

export interface DashboardResponse {
    data: {
        worked: number
        paid: number
        total_pending: number
        total_customer: number
        total_product: number
        total_workorder: number
        total_vendor: number
        total_regular_expense: number
        total_net_profit: number
        monthly_sales: number[]
        recent_workorders: Array<{
            no: string
            customer: string
            amount: number
            paid: number
            is_delivered: boolean
        }>
    }
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