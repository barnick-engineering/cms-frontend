import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Skeleton } from '@/components/ui/skeleton'
import { useMoveKanbanTask } from '@/hooks/useKanban'
import type {
  KanbanBoardParams,
  KanbanColumn as KanbanColumnType,
  KanbanStage,
  KanbanTask,
} from '@/interface/kanbanInterface'
import { KanbanCard, KanbanCardOverlay } from './KanbanCard'
import { KanbanColumn } from './KanbanColumn'
import { useKanbanContext } from './kanban-provider'

type KanbanBoardProps = {
  columns: KanbanColumnType[]
  boardParams: KanbanBoardParams
  isLoading?: boolean
}

function stageFromOverId(overId: string | number): KanbanStage | null {
  const s = String(overId)
  return s.startsWith('column-') ? (s.replace('column-', '') as KanbanStage) : null
}

function findTaskStage(columns: KanbanColumnType[], taskId: number): KanbanStage | null {
  for (const col of columns) {
    if (col.tasks.some((t) => t.id === taskId)) return col.stage
  }
  return null
}

function applyMoveToColumns(
  cols: KanbanColumnType[],
  taskId: number,
  targetStage: KanbanStage
): KanbanColumnType[] {
  const sourceTask = cols.flatMap((c) => c.tasks).find((t) => t.id === taskId)
  if (!sourceTask) return cols
  const task: KanbanTask = { ...sourceTask, stage: targetStage }
  return cols.map((col) => {
    if (col.stage === sourceTask.stage) {
      return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
    }
    if (col.stage === targetStage) {
      return { ...col, tasks: [...col.tasks, task] }
    }
    return col
  })
}

export function KanbanBoard({ columns, boardParams, isLoading }: KanbanBoardProps) {
  const moveMutation = useMoveKanbanTask()
  const { setOpen, setCurrentTask } = useKanbanContext()
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null)
  const [localColumns, setLocalColumns] = useState<KanbanColumnType[]>(columns)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!isDraggingRef.current) setLocalColumns(columns)
  }, [columns])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const taskMap = useMemo(() => {
    const map = new Map<number, KanbanTask>()
    for (const col of columns) {
      for (const task of col.tasks) map.set(task.id, task)
    }
    return map
  }, [columns])

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true
    const id = Number(event.active.id)
    setActiveTask(taskMap.get(id) ?? null)
  }

  // Moves card into the target column visually as the user hovers over it
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const targetStage = stageFromOverId(over.id)
    if (!targetStage) return
    const activeId = Number(active.id)
    const currentStage = findTaskStage(localColumns, activeId)
    if (!currentStage || currentStage === targetStage) return
    setLocalColumns((prev) => applyMoveToColumns(prev, activeId, targetStage))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    isDraggingRef.current = false
    setActiveTask(null)

    const { active, over } = event
    console.log('[DND] dragEnd active:', active.id, 'over:', over?.id ?? 'NULL')

    if (!over) { setLocalColumns(columns); return }

    const targetStage = stageFromOverId(over.id)
    if (!targetStage) { setLocalColumns(columns); return }

    const activeId = Number(active.id)
    const sourceStage = findTaskStage(columns, activeId)
    if (!sourceStage || sourceStage === targetStage) return

    console.log('[DND] MOVING', activeId, 'from', sourceStage, 'to', targetStage)
    moveMutation.mutate({
      id: activeId,
      payload: { stage: targetStage },
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
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {localColumns.map((column) => (
          <KanbanColumn key={column.stage} column={column} onTaskClick={(task) => {
            setCurrentTask(task); setOpen('view')
          }} />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-[260px] rotate-2 opacity-90">
            <KanbanCardOverlay task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
