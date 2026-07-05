export interface Project {
  id: number
  name: string
  description: string | null
  created: string
  status: boolean
  total_orders?: number
  total_amount?: number
  total_paid?: number
  total_pending?: number
  total_expense?: number
}

export interface ProjectWorkOrderItem {
  id: number
  no: string
  customer_id: number
  customer: string
  project_id: number
  project: string
  amount: number
  total_paid: number
  is_paid: boolean
  is_delivered: boolean
  date: string | null
  delivery_charge: number
  remarks: string | null
  total_items: number
  total_expense: number
}

export interface ProjectDetail extends Project {
  work_orders: ProjectWorkOrderItem[]
}

export interface ProjectListResponse {
  data: Project[]
  total: number
  response_message: string
  response_code: number
}

export interface ProjectDetailResponse {
  data: ProjectDetail
  response_message: string
  response_code: number
}

export interface ProjectFormInterface {
  name: string
  description?: string | null
}

export interface ProjectCreateResponse {
  data: Project
  response_message: string
  response_code: number
}
