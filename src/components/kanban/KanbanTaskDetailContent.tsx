import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { KanbanTask } from '@/interface/kanbanInterface'
import { KANBAN_STAGES } from '@/interface/kanbanInterface'

type KanbanTaskDetailContentProps = {
  task: KanbanTask
}

function formatDeadline(deadline: string) {
  try {
    return format(parseISO(deadline), 'MMM d, yyyy')
  } catch {
    return deadline
  }
}

function stageLabel(stage: KanbanTask['stage']) {
  return KANBAN_STAGES.find((s) => s.value === stage)?.label ?? stage
}

export function KanbanTaskDetailContent({ task }: KanbanTaskDetailContentProps) {
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{stageLabel(task.stage)}</Badge>
        {task.is_overdue && <Badge variant="destructive">Overdue</Badge>}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {task.description?.trim() || 'No description'}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={
                task.is_overdue ? 'font-semibold text-destructive' : 'font-semibold'
              }
            >
              {formatDeadline(task.deadline)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{task.customer ?? '—'}</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Work Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono font-semibold">
              {task.work_order_no ?? '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="text-xs text-muted-foreground">
        Task #{task.id}
        {task.created && (
          <>
            {' '}
            · Created{' '}
            {format(new Date(task.created), 'MMM d, yyyy')}
          </>
        )}
      </div>
    </div>
  )
}
