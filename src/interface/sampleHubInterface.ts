export interface SampleHubItem {
  id: number
  customer: number
  work_order: number | null
  drive_file_id: string
  file_path: string
  file_name: string
  mime_type: string
  created_at: string
  updated_at: string
  customer_name: string
  work_order_ref: string | null
}

export interface SampleHubListParams {
  customer_id: number
  work_order_id?: number
}

export interface SampleHubUploadParams {
  customer_id: number
  work_order_id?: number
  file: File
}
