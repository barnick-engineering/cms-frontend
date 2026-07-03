import { format, parseISO } from 'date-fns'
import { useDraggable } from '@dnd-kit/core'
import { Calendar, Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMinuteTicker } from '@/hooks/useMinuteTicker'
import type { KanbanTask } from '@/interface/kanbanInterface'
import { getDeadlineStatus } from '@/lib/kanbanDeadline'
import { cn } from '@/lib/utils'

type KanbanCardProps = {
  task: KanbanTask
  onClick: (task: KanbanTask) => void
}

// Pure visual card — no DND hooks. Safe inside DragOverlay.
export function KanbanCardOverlay({ task }: { task: KanbanTask }) {
  const now = useMinuteTicker()

  let deadlineLabel = task.deadline
  try {
    deadlineLabel = format(parseISO(task.deadline), 'MMM d, yyyy')
  } catch { /* keep raw */ }

  const { isMissed, countdown } = getDeadlineStatus(task.deadline, {
    isOverdue: task.is_overdue,
    stage: task.stage,
    now,
  })

  return (
    <Card className={cn('cursor-grabbing shadow-lg', isMissed && 'border-destructive')}>
      <CardHeader className="p-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">{task.title}</CardTitle>
          {isMissed && (
            <Badge variant="destructive" className="shrink-0 h-5 px-1.5 text-[10px] font-medium">
              Deadline missed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-3 pt-1 text-xs text-muted-foreground">
        {task.description?.trim() && (
          <p className="line-clamp-2 text-foreground/80">{task.description}</p>
        )}
        {task.customer && (
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{task.customer}</span>
          </div>
        )}
        {task.work_order_no && (
          <div className="truncate font-mono text-[11px]">{task.work_order_no}</div>
        )}
        <div className={cn('flex items-center gap-1.5', isMissed && 'text-destructive font-medium')}>
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{deadlineLabel}</span>
        </div>
        {countdown && (
          <div className="flex items-center gap-1.5 text-foreground/80">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">{countdown}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Draggable card — uses useDraggable (draggable only, NOT droppable).
// This prevents @dnd-kit from treating the card as a drop target, which
// would shadow the column droppables and make over.id === active.id.
export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const now = useMinuteTicker()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(task.id),
  })

  let deadlineLabel = task.deadline
  try {
    deadlineLabel = format(parseISO(task.deadline), 'MMM d, yyyy')
  } catch { /* keep raw */ }

  const { isMissed, countdown } = getDeadlineStatus(task.deadline, {
    isOverdue: task.is_overdue,
    stage: task.stage,
    now,
  })

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'cursor-grab active:cursor-grabbing shadow-sm',
        isDragging && 'opacity-30',
        isMissed && 'border-destructive'
      )}
      {...attributes}
      {...listeners}
      onClick={() => { if (!isDragging) onClick(task) }}
    >
      <CardHeader className="p-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">{task.title}</CardTitle>
          {isMissed && (
            <Badge variant="destructive" className="shrink-0 h-5 px-1.5 text-[10px] font-medium">
              Deadline missed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-3 pt-1 text-xs text-muted-foreground">
        {task.description?.trim() && (
          <p className="line-clamp-2 text-foreground/80">{task.description}</p>
        )}
        {task.customer && (
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{task.customer}</span>
          </div>
        )}
        {task.work_order_no && (
          <div className="truncate font-mono text-[11px]">{task.work_order_no}</div>
        )}
        <div className={cn('flex items-center gap-1.5', isMissed && 'text-destructive font-medium')}>
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{deadlineLabel}</span>
        </div>
        {countdown && (
          <div className="flex items-center gap-1.5 text-foreground/80">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">{countdown}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
