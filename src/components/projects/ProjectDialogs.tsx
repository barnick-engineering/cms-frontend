import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useProjects } from './project-provider'
import { useDeleteProject } from '@/hooks/useProject'
import ProjectMutateDialog from './ProjectMutateDialog'
import { messageFromAxiosError } from '@/lib/barnickApiError'
import type { AxiosError } from 'axios'

const ProjectDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useProjects()
  const deleteMutation = useDeleteProject()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  return (
    <>
      <ProjectMutateDialog
        key="project-create"
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
      />

      {currentRow && (
        <>
          <ProjectMutateDialog
            key={`project-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(val) => setOpen(val ? 'edit' : null)}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="project-delete"
            destructive
            open={open === 'delete'}
            onOpenChange={(val) => {
              setOpen(val ? 'delete' : null)
              if (!val) setDeleteError(null)
            }}
            handleConfirm={() => {
              if (!currentRow) return
              setDeleteError(null)
              deleteMutation.mutate(currentRow.id, {
                onSuccess: () => {
                  setOpen(null)
                  setCurrentRow(null)
                  toast.success("Project deleted successfully.")
                },
                onError: (err: unknown) => {
                  const msg = messageFromAxiosError(err as AxiosError)
                  setDeleteError(msg)
                },
              })
            }}
            isLoading={deleteMutation.isPending}
            className="max-w-md"
            title={`Delete project: ${currentRow.name}?`}
            desc={
              <div className="space-y-2">
                <span>
                  You are about to delete{' '}
                  <strong>{currentRow.name}</strong>. This action cannot be undone.
                </span>
                {deleteError && (
                  <p className="text-sm text-destructive">{deleteError}</p>
                )}
              </div>
            }
            confirmText="Delete"
          />
        </>
      )}
    </>
  )
}

export default ProjectDialogs
