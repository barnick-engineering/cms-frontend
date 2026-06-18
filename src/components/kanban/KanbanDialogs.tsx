import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteKanbanTask } from '@/hooks/useKanban'
import KanbanMutateDrawer from './KanbanMutateDrawer'
import KanbanTaskViewDrawer from './KanbanTaskViewDrawer'
import { useKanbanContext } from './kanban-provider'

const KanbanDialogs = () => {
  const { open, setOpen, currentTask, setCurrentTask } = useKanbanContext()
  const deleteMutation = useDeleteKanbanTask()

  return (
    <>
      <KanbanMutateDrawer
        key="kanban-create"
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {currentTask && (
        <>
          <KanbanTaskViewDrawer
            key={`kanban-view-${currentTask.id}`}
            open={open === 'view'}
            onOpenChange={(val) => setOpen(val ? 'view' : null)}
            currentTask={currentTask}
            onEdit={() => setOpen('edit')}
            onDelete={() => setOpen('delete')}
          />

          <KanbanMutateDrawer
            key={`kanban-edit-${currentTask.id}`}
            open={open === 'edit'}
            onOpenChange={(val) => setOpen(val ? 'edit' : null)}
            currentTask={currentTask}
            onSave={() => setOpen(null)}
          />

          <ConfirmDialog
            key="kanban-delete"
            destructive
            open={open === 'delete'}
            onOpenChange={(val) => setOpen(val ? 'delete' : null)}
            handleConfirm={() => {
              if (!currentTask) return
              deleteMutation.mutate(currentTask.id, {
                onSuccess: () => {
                  setOpen(null)
                  setCurrentTask(null)
                },
              })
            }}
            className="max-w-md"
            title={`Delete task: ${currentTask.title}?`}
            desc={
              <>
                You are about to delete <strong>{currentTask.title}</strong>.
                <br />
                This action cannot be undone.
              </>
            }
            confirmText="Delete"
          />
        </>
      )}
    </>
  )
}

export default KanbanDialogs
