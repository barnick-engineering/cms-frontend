import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type {
  WorkOrderFormInterface,
  WorkOrderListResponse,
  WorkOrder,
  WorkOrderDetailResponse,
  WorkOrderUpdatePayload,
} from "@/interface/workOrderInterface"

// work order list with search params
export const workOrderList = async (
  search?: string,
  limit?: number,
  offset?: number
): Promise<WorkOrderListResponse> => {
  const params = new URLSearchParams()

  if (search) params.append("search", search)
  if (limit) params.append("limit", String(limit))
  if (offset) params.append("offset", String(offset))

  const queryString = params.toString()
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

// delete work order
export const deleteWorkOrder = async (id: string | number) => {
  if (!id) throw new Error("Work Order ID is required")

  const res = await axiosInstance.delete(
    `${apiEndpoints.workOrder.deleteWorkOrder}${id}/`
  )

  return res.data
}
