import { useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useMoveKanbanTask } from '@/hooks/useKanban'
import type {
  KanbanBoardParams,
  KanbanColumn as KanbanColumnType,
  KanbanStage,
  KanbanTask,
} from '@/interface/kanbanInterface'
import { KanbanCard } from './KanbanCard'
import { KanbanColumn } from './KanbanColumn'
import { useKanbanContext } from './kanban-provider'

type KanbanBoardProps = {
  columns: KanbanColumnType[]
  boardParams: KanbanBoardParams
  isLoading?: boolean
}

function findTaskLocation(
  columns: KanbanColumnType[],
  taskId: number
): { stage: KanbanStage; index: number } | null {
  for (const col of columns) {
    const index = col.tasks.findIndex((t) => t.id === taskId)
    if (index !== -1) return { stage: col.stage, index }
  }
  return null
}

function resolveDropTarget(
  columns: KanbanColumnType[],
  overId: string | number
): { stage: KanbanStage; position?: number } | null {
  const overStr = String(overId)

  if (overStr.startsWith('column-')) {
    const stage = overStr.replace('column-', '') as KanbanStage
    return { stage }
  }

  const taskId = Number(overStr)
  if (!Number.isNaN(taskId)) {
    const loc = findTaskLocation(columns, taskId)
    if (loc) return { stage: loc.stage, position: loc.index }
  }

  return null
}

export function KanbanBoard({
  columns,
  boardParams,
  isLoading,
}: KanbanBoardProps) {
  const moveMutation = useMoveKanbanTask()
  const { setOpen, setCurrentTask } = useKanbanContext()
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const taskMap = useMemo(() => {
    const map = new Map<number, KanbanTask>()
    for (const col of columns) {
      for (const task of col.tasks) {
        map.set(task.id, task)
      }
    }
    return map
  }, [columns])

  const handleTaskClick = (task: KanbanTask) => {
    setCurrentTask(task)
    setOpen('view')
  }

  const handleDragStart = (event: DragStartEvent) => {
    const id = Number(event.active.id)
    setActiveTask(taskMap.get(id) ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = Number(active.id)
    const source = findTaskLocation(columns, activeId)
    const target = resolveDropTarget(columns, over.id)
    if (!source || !target) return

    const sameColumn = source.stage === target.stage
    const samePosition =
      sameColumn &&
      target.position != null &&
      target.position === source.index

    if (sameColumn && samePosition) return
    if (sameColumn && target.position == null) return

    moveMutation.mutate({
      id: activeId,
      payload: {
        stage: target.stage,
        position: target.position,
      },
      boardParams,
    })
  }

  if (isLoading && columns.length === 0) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[280px] shrink-0 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.stage}
            column={column}
            onTaskClick={handleTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-[260px] rotate-2 opacity-90">
            <KanbanCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
