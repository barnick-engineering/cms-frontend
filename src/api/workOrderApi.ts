import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type {
  WorkOrderFormInterface,
  WorkOrderListParams,
  WorkOrderListResponse,
  WorkOrder,
  WorkOrderDetailResponse,
  WorkOrderDetailData,
  WorkOrderUpdatePayload,
} from "@/interface/workOrderInterface"

function appendWorkOrderListParams(params: URLSearchParams, filters: WorkOrderListParams) {
  if (filters.search) params.append("search", filters.search)
  if (filters.limit != null) params.append("limit", String(filters.limit))
  if (filters.offset != null) params.append("offset", String(filters.offset))
  if (filters.customer_id != null && filters.customer_id !== "") {
    params.append("customer_id", String(filters.customer_id))
  }
  if (filters.start_date) params.append("start_date", filters.start_date)
  if (filters.end_date) params.append("end_date", filters.end_date)
  if (filters.payment_status) params.append("payment_status", filters.payment_status)
  if (filters.work_order_no) params.append("work_order_no", filters.work_order_no)
  if (filters.is_delivered != null) {
    const delivered =
      typeof filters.is_delivered === "boolean"
        ? filters.is_delivered
        : filters.is_delivered === "true"
    params.append("is_delivered", delivered ? "true" : "false")
  }
}

export const workOrderList = async (
  params: WorkOrderListParams = {}
): Promise<WorkOrderListResponse> => {
  const searchParams = new URLSearchParams()
  appendWorkOrderListParams(searchParams, params)

  const queryString = searchParams.toString()
  const url = queryString
    ? `${apiEndpoints.workOrder.workOrderList}?${queryString}`
    : apiEndpoints.workOrder.workOrderList

  const res = await axiosInstance.get<WorkOrderListResponse>(url)
  return res.data
}

// get work order by id
export const getWorkOrderById = async (
  id: string | number
): Promise<WorkOrderDetailData> => {
  if (!id) throw new Error("Work Order ID is required")

  const res = await axiosInstance.get<WorkOrderDetailResponse>(
    `${apiEndpoints.workOrder.getWorkOrderById}${id}/`
  )

  return res.data.data
}

// create work order
export const createWorkOrder = async (data: WorkOrderFormInterface) => {
  const res = await axiosInstance.post<WorkOrder>(
    apiEndpoints.workOrder.createWorkOrder,
    data
  )
  return res.data
}

// update work order (only total_paid)
export const updateWorkOrder = async (
  id: string | number,
  data: WorkOrderUpdatePayload
): Promise<WorkOrder> => {
  if (!id) throw new Error("Work Order ID is required")

  const res = await axiosInstance.put<WorkOrder>(
    `${apiEndpoints.workOrder.updateWorkOrder}${id}/`,
    data
  )

  return res.data
}

// update work order (full update - all fields)
export const updateWorkOrderFull = async (
  id: string | number,
  data: WorkOrderFormInterface
): Promise<WorkOrder> => {
  if (!id) throw new Error("Work Order ID is required")

  const res = await axiosInstance.put<WorkOrder>(
    `${apiEndpoints.workOrder.updateWorkOrder}${id}/`,
    data
  )

  return res.data
}

// delete work order
export const deleteWorkOrder = async (id: string | number) => {
  if (!id) throw new Error("Work Order ID is required")

  const res = await axiosInstance.delete(
    `${apiEndpoints.workOrder.deleteWorkOrder}${id}/`
  )

  return res.data
}
