import { apiEndpoints } from '@/config/api'
import type {
  SampleHubItem,
  SampleHubListParams,
  SampleHubUploadParams,
} from '@/interface/sampleHubInterface'
import { axiosInstance } from './axios'

export const sampleHubApi = {
  list: async (params: SampleHubListParams): Promise<SampleHubItem[]> => {
    const response = await axiosInstance.get<SampleHubItem[]>(
      apiEndpoints.sampleHub.list,
      { params }
    )
    return response.data
  },

  upload: async (params: SampleHubUploadParams): Promise<SampleHubItem> => {
    const formData = new FormData()
    formData.append('customer_id', String(params.customer_id))
    if (params.work_order_id != null) {
      formData.append('work_order_id', String(params.work_order_id))
    }
    formData.append('file', params.file)

    const response = await axiosInstance.post<SampleHubItem>(
      apiEndpoints.sampleHub.upload,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${apiEndpoints.sampleHub.delete}${id}/`)
  },
}
