import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useKanbanTaskById } from '@/hooks/useKanban'
import type { KanbanTask } from '@/interface/kanbanInterface'
import { KanbanTaskDetailContent } from './KanbanTaskDetailContent'

type KanbanTaskViewDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTask: KanbanTask | null
  onEdit: () => void
  onDelete: () => void
}

const KanbanTaskViewDrawer = ({
  open,
  onOpenChange,
  currentTask,
  onEdit,
  onDelete,
}: KanbanTaskViewDrawerProps) => {
  const { data: taskDetail, isLoading, isError } = useKanbanTaskById(
    currentTask?.id ?? 0,
    { enabled: !!currentTask?.id && open }
  )

  if (!currentTask) return null

  const task = taskDetail ?? currentTask

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-h-[90vh] max-w-lg min-w-0 space-y-4 overflow-y-auto p-6">
        <DrawerHeader className="text-left">
          <DrawerTitle>{task.title}</DrawerTitle>
          <DrawerDescription>Task details</DrawerDescription>
        </DrawerHeader>

        {isLoading && !taskDetail ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading task details…
          </div>
        ) : isError && !taskDetail ? (
          <div className="py-8 text-center text-sm text-destructive">
            Failed to load task details
          </div>
        ) : (
          <KanbanTaskDetailContent task={task} />
        )}

        <DrawerFooter className="flex-row justify-end gap-2 px-0">
          <Button
            type="button"
            variant="destructive"
            className="mr-auto gap-2"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" className="gap-2" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default KanbanTaskViewDrawer
