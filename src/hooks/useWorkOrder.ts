import {
  createWorkOrder,
  deleteWorkOrder,
  getWorkOrderById,
  updateWorkOrder,
  workOrderList,
} from "@/api/workOrderApi"
import type {
  WorkOrderFormInterface,
  WorkOrderListResponse,
  WorkOrderDetailData,
  WorkOrderUpdatePayload,
} from "@/interface/workOrderInterface"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

const WORK_ORDER_KEYS = {
  all: ["workOrders"] as const,
  detail: (id: string | number) => [...WORK_ORDER_KEYS.all, id] as const,
}

// work order list
export const useWorkOrderList = (
  search?: string,
  limit?: number,
  offset?: number,
  options?: { enabled?: boolean }
): UseQueryResult<WorkOrderListResponse, Error> =>
  useQuery({
    queryKey: [...WORK_ORDER_KEYS.all, search, limit, offset],
    queryFn: () => workOrderList(search, limit, offset),
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
  })

// get work order by id
export const useWorkOrderById = (
  id: string | number,
  options?: Partial<UseQueryOptions<WorkOrderDetailData, Error>>
): UseQueryResult<WorkOrderDetailData, Error> => {
  return useQuery<WorkOrderDetailData>({
    queryKey: WORK_ORDER_KEYS.detail(id),
    queryFn: () => getWorkOrderById(id),
    enabled: !!id && (options?.enabled ?? true),
    ...options,
  })
}

// create
export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkOrderFormInterface) => createWorkOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORK_ORDER_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

// update
export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number
      data: WorkOrderUpdatePayload
    }) => updateWorkOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: WORK_ORDER_KEYS.all })
      queryClient.invalidateQueries({ queryKey: WORK_ORDER_KEYS.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

// delete
export const useDeleteWorkOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => deleteWorkOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORK_ORDER_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
