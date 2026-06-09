import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sampleHubApi } from '@/api/sampleHubApi'
import type {
  SampleHubItem,
  SampleHubUploadParams,
} from '@/interface/sampleHubInterface'

export const SAMPLE_HUB_KEYS = {
  all: ['sample-hub'] as const,
  list: (customerId: number, workOrderId?: number) =>
    [...SAMPLE_HUB_KEYS.all, customerId, workOrderId] as const,
}

export const useSampleHubList = (
  customerId: number | undefined,
  workOrderId?: number,
  options?: { enabled?: boolean }
) =>
  useQuery<SampleHubItem[]>({
    queryKey: SAMPLE_HUB_KEYS.list(customerId ?? 0, workOrderId),
    queryFn: () =>
      sampleHubApi.list({
        customer_id: customerId!,
        work_order_id: workOrderId,
      }),
    enabled: !!customerId && (options?.enabled ?? true),
  })

export const useUploadSample = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: SampleHubUploadParams) => sampleHubApi.upload(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SAMPLE_HUB_KEYS.list(
          variables.customer_id,
          variables.work_order_id
        ),
      })
      queryClient.invalidateQueries({
        queryKey: SAMPLE_HUB_KEYS.all,
        exact: false,
      })
    },
  })
}

export const useDeleteSample = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: number
      customerId: number
      workOrderId?: number
    }) => sampleHubApi.delete(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SAMPLE_HUB_KEYS.list(
          variables.customerId,
          variables.workOrderId
        ),
      })
      queryClient.invalidateQueries({
        queryKey: SAMPLE_HUB_KEYS.all,
        exact: false,
      })
    },
  })
}
