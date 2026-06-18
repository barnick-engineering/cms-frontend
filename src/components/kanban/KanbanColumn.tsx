import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Badge } from '@/components/ui/badge'
import type { KanbanColumn as KanbanColumnType, KanbanTask } from '@/interface/kanbanInterface'
import { cn } from '@/lib/utils'
import { KanbanCard } from './KanbanCard'

type KanbanColumnProps = {
  column: KanbanColumnType
  onTaskClick: (task: KanbanTask) => void
}

export function KanbanColumn({ column, onTaskClick }: KanbanColumnProps) {
  const droppableId = `column-${column.stage}`
  const { setNodeRef, isOver } = useDroppable({ id: droppableId })

  const tasks = [...column.tasks].sort((a, b) => a.position - b.position)
  const taskIds = tasks.map((t) => String(t.id))

  return (
    <div className="flex w-[280px] shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h3 className="text-sm font-semibold">{column.label}</h3>
        <Badge variant="secondary" className="tabular-nums">
          {tasks.length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg border bg-muted/30 p-2 transition-colors',
          isOver && 'border-primary bg-primary/5'
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Drop tasks here
          </p>
        )}
      </div>
    </div>
  )
}
