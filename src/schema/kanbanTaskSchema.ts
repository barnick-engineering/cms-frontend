import { z } from 'zod'

export const kanbanTaskSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    deadline: z
      .string()
      .min(1, 'Deadline is required')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid deadline, expected YYYY-MM-DD'),
    customer_id: z.number().optional().nullable(),
    work_order_id: z.number().optional().nullable(),
    stage: z
      .enum([
        'todo',
        'planning',
        'designing',
        'printing',
        'delivery',
        'done',
      ])
      .optional(),
  })
  .refine(
    (data) => data.customer_id != null || data.work_order_id != null,
    {
      message: 'Either customer or work order is required',
      path: ['customer_id'],
    }
  )

export type KanbanTaskFormType = z.infer<typeof kanbanTaskSchema>
