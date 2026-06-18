export type KanbanStage =
  | 'todo'
  | 'planning'
  | 'designing'
  | 'printing'
  | 'delivery'
  | 'done'

export const KANBAN_STAGES: { value: KanbanStage; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'planning', label: 'Planning' },
  { value: 'designing', label: 'Designing' },
  { value: 'printing', label: 'Printing' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'done', label: 'Done' },
]

export interface KanbanTask {
  id: number
  title: string
  description: string | null
  stage: KanbanStage
  position: number
  deadline: string
  customer_id: number | null
  customer: string | null
  work_order_id: number | null
  work_order_no: string | null
  is_overdue: boolean
  created: string
  created_by: number | null
  status: boolean
}

export interface KanbanColumn {
  stage: KanbanStage
  label: string
  tasks: KanbanTask[]
}

export interface KanbanSummary {
  total_tasks: number
  overdue_count: number
  due_today_count: number
}

export interface KanbanBoardResponse {
  columns: KanbanColumn[]
  summary: KanbanSummary
  response_message: string
  response_code: number
}

export interface KanbanBoardParams {
  customer_id?: number
  work_order_id?: number
  search?: string
  overdue?: boolean
}

export interface KanbanTaskFormInterface {
  title: string
  description?: string | null
  deadline: string
  customer_id?: number | null
  work_order_id?: number | null
  stage?: KanbanStage
  position?: number
}

export interface KanbanMovePayload {
  stage: KanbanStage
  position?: number
}

export interface KanbanTaskEnvelope {
  data: KanbanTask
  response_message: string
  response_code: number
}

export interface KanbanTaskListResponse {
  data: KanbanTask[]
  total: number
  summary: KanbanSummary
  prev_url: string | null
  next_url: string | null
  page: number
  response_message: string
  response_code: number
}

export type KanbanFilterValues = {
  search?: string
  customerId?: number
  workOrderId?: number
  overdueOnly?: boolean
}

export interface KanbanMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTask?: KanbanTask | null
  onSave?: () => void
}
