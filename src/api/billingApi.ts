import { apiEndpoints } from '@/config/api'
import type {
  BillingDocument,
  BillingDocumentEnvelope,
  BillingDocumentFormPayload,
  BillingDocumentListParams,
  BillingDocumentListResponse,
  BillingPrefillPayload,
} from '@/interface/billingInterface'
import { axiosInstance } from './axios'

function appendBillingParams(
  params: URLSearchParams,
  filters: BillingDocumentListParams
) {
  if (filters.document_type) params.append('document_type', filters.document_type)
  if (filters.status) params.append('status', filters.status)
  if (filters.customer_id != null) {
    params.append('customer_id', String(filters.customer_id))
  }
  if (filters.work_order_id != null) {
    params.append('work_order_id', String(filters.work_order_id))
  }
  if (filters.search) params.append('search', filters.search)
  if (filters.start_date) params.append('start_date', filters.start_date)
  if (filters.end_date) params.append('end_date', filters.end_date)
  if (filters.limit != null) params.append('limit', String(filters.limit))
  if (filters.offset != null) params.append('offset', String(filters.offset))
}

export const listBillingDocuments = async (
  filters: BillingDocumentListParams = {}
): Promise<BillingDocumentListResponse> => {
  const searchParams = new URLSearchParams()
  appendBillingParams(searchParams, filters)
  const queryString = searchParams.toString()
  const url = queryString
    ? `${apiEndpoints.billing.documents}?${queryString}`
    : apiEndpoints.billing.documents
  const res = await axiosInstance.get<BillingDocumentListResponse>(url)
  return res.data
}

export const getBillingDocumentById = async (
  id: string | number
): Promise<BillingDocument> => {
  if (!id) throw new Error('Document ID is required')
  const res = await axiosInstance.get<BillingDocumentEnvelope>(
    `${apiEndpoints.billing.getDocumentById}${id}/`
  )
  return res.data.data
}

export const createBillingDocument = async (
  data: BillingDocumentFormPayload
): Promise<BillingDocument> => {
  const res = await axiosInstance.post<BillingDocumentEnvelope>(
    apiEndpoints.billing.documents,
    data
  )
  return res.data.data
}

export const updateBillingDocument = async (
  id: string | number,
  data: BillingDocumentFormPayload
): Promise<BillingDocument> => {
  if (!id) throw new Error('Document ID is required')
  const res = await axiosInstance.put<BillingDocumentEnvelope>(
    `${apiEndpoints.billing.updateDocument}${id}/`,
    data
  )
  return res.data.data
}

export const deleteBillingDocument = async (id: string | number) => {
  if (!id) throw new Error('Document ID is required')
  const res = await axiosInstance.delete(
    `${apiEndpoints.billing.deleteDocument}${id}/`
  )
  return res.data
}

export const finalizeBillingDocument = async (
  id: string | number
): Promise<BillingDocument> => {
  if (!id) throw new Error('Document ID is required')
  const res = await axiosInstance.patch<BillingDocumentEnvelope>(
    `${apiEndpoints.billing.finalizeDocument}${id}/finalize/`
  )
  return res.data.data
}

export const prefillBillingDocument = async (
  payload: BillingPrefillPayload
): Promise<BillingDocumentFormPayload> => {
  const res = await axiosInstance.post<BillingDocumentEnvelope>(
    apiEndpoints.billing.prefill,
    payload
  )
  return res.data.data as unknown as BillingDocumentFormPayload
}
