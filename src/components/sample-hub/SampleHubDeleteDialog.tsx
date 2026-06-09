import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteSample } from '@/hooks/useSampleHub'
import type { SampleHubItem } from '@/interface/sampleHubInterface'
import { messageFromAxiosError } from '@/lib/barnickApiError'

type SampleHubDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: SampleHubItem | null
  customerId: number
  workOrderId?: number
}

export function SampleHubDeleteDialog({
  open,
  onOpenChange,
  item,
  customerId,
  workOrderId,
}: SampleHubDeleteDialogProps) {
  const deleteMutation = useDeleteSample()

  const handleConfirm = () => {
    if (!item) return

    deleteMutation.mutate(
      { id: item.id, customerId, workOrderId },
      {
        onSuccess: () => {
          toast.success('Sample deleted')
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(messageFromAxiosError(error))
        },
      }
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete sample"
      desc={
        item
          ? `Are you sure you want to delete "${item.file_name}"? This cannot be undone.`
          : ''
      }
      destructive
      confirmText="Delete"
      isLoading={deleteMutation.isPending}
      disabled={!item}
      handleConfirm={handleConfirm}
    />
  )
}
