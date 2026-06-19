import {
  createBillingDocument,
  deleteBillingDocument,
  finalizeBillingDocument,
  getBillingDocumentById,
  listBillingDocuments,
  prefillBillingDocument,
  updateBillingDocument,
} from '@/api/billingApi'
import type {
  BillingDocumentFormPayload,
  BillingDocumentListParams,
  BillingDocumentType,
  BillingPrefillPayload,
} from '@/interface/billingInterface'
import { messageFromAxiosError } from '@/lib/barnickApiError'
import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'

export const BILLING_KEYS = {
  all: ['billing'] as const,
  list: (params: BillingDocumentListParams) =>
    [...BILLING_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...BILLING_KEYS.all, id] as const,
}

export const useBillingDocumentList = (
  params: BillingDocumentListParams = {},
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: BILLING_KEYS.list(params),
    queryFn: () => listBillingDocuments(params),
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
  })

const BILLING_TYPES: BillingDocumentType[] = [
  'invoice',
  'quotation',
  'delivery_challan',
]

/** Per-type totals for the current date/filter window (uses list API `total`). */
export function useBillingOverview(
  params: Omit<BillingDocumentListParams, 'document_type' | 'limit' | 'offset'>
) {
  const baseParams = {
    start_date: params.start_date,
    end_date: params.end_date,
    search: params.search,
    status: params.status,
    customer_id: params.customer_id,
    work_order_id: params.work_order_id,
  }

  const queries = useQueries({
    queries: BILLING_TYPES.map((document_type) => ({
      queryKey: [...BILLING_KEYS.all, 'overview', document_type, baseParams] as const,
      queryFn: () =>
        listBillingDocuments({ ...baseParams, document_type, limit: 1, offset: 0 }),
      select: (data: Awaited<ReturnType<typeof listBillingDocuments>>) =>
        data.total,
    })),
  })

  const isLoading = queries.some((q) => q.isLoading)
  const invoice_count = queries[0].data ?? 0
  const quotation_count = queries[1].data ?? 0
  const delivery_challan_count = queries[2].data ?? 0

  return {
    isLoading,
    invoice_count,
    quotation_count,
    delivery_challan_count,
    total_documents: invoice_count + quotation_count + delivery_challan_count,
  }
}

export const useBillingDocumentById = (
  id: string | number,
  options?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getBillingDocumentById>>, Error>>
): UseQueryResult<Awaited<ReturnType<typeof getBillingDocumentById>>, Error> =>
  useQuery({
    queryKey: BILLING_KEYS.detail(Number(id)),
    queryFn: () => getBillingDocumentById(id),
    enabled: !!id && (options?.enabled ?? true),
    ...options,
  })

export const useCreateBillingDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BillingDocumentFormPayload) => createBillingDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.all })
      toast.success('Document saved as draft')
    },
    onError: (error) => {
      toast.error('Failed to save document', {
        description: messageFromAxiosError(error),
      })
    },
  })
}

export const useUpdateBillingDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number
      data: BillingDocumentFormPayload
    }) => updateBillingDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.all })
      queryClient.invalidateQueries({
        queryKey: BILLING_KEYS.detail(Number(variables.id)),
      })
      toast.success('Document updated')
    },
    onError: (error) => {
      toast.error('Failed to update document', {
        description: messageFromAxiosError(error),
      })
    },
  })
}

export const useDeleteBillingDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => deleteBillingDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.all })
      toast.success('Document deleted')
    },
    onError: (error) => {
      toast.error('Failed to delete document', {
        description: messageFromAxiosError(error),
      })
    },
  })
}

export const useFinalizeBillingDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => finalizeBillingDocument(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.all })
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.detail(Number(id)) })
      toast.success('Document finalized')
    },
    onError: (error) => {
      toast.error('Failed to finalize document', {
        description: messageFromAxiosError(error),
      })
    },
  })
}

export const usePrefillBillingDocument = () =>
  useMutation({
    mutationFn: (payload: BillingPrefillPayload) => prefillBillingDocument(payload),
    onError: (error) => {
      toast.error('Failed to prefill document', {
        description: messageFromAxiosError(error),
      })
    },
  })
