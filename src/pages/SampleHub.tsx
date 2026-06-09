import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { SampleHubDeleteDialog } from '@/components/sample-hub/SampleHubDeleteDialog'
import { SampleHubEmptyState } from '@/components/sample-hub/SampleHubEmptyState'
import { SampleHubFilters } from '@/components/sample-hub/SampleHubFilters'
import { SampleHubGallery } from '@/components/sample-hub/SampleHubGallery'
import { SampleHubUploadDrawer } from '@/components/sample-hub/SampleHubUploadDrawer'
import { useSampleHubList } from '@/hooks/useSampleHub'
import type { SampleHubItem } from '@/interface/sampleHubInterface'

const SampleHub = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>()
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<number | undefined>()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<SampleHubItem | null>(null)

  const { data: samples = [], isLoading, isError } = useSampleHubList(
    selectedCustomerId,
    selectedWorkOrderId
  )

  const handleDeleteRequest = (item: SampleHubItem) => {
    setItemToDelete(item)
    setDeleteOpen(true)
  }

  return (
    <Main>
      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sample Hub</h1>
          <p className="text-muted-foreground">
            Browse and manage customer sample images
          </p>
        </div>
        <Button className="space-x-1" onClick={() => setUploadOpen(true)}>
          <span>Create</span>
          <Plus size={18} />
        </Button>
      </div>

      <div className="mb-8">
        <SampleHubFilters
          customerId={selectedCustomerId}
          workOrderId={selectedWorkOrderId}
          onCustomerChange={setSelectedCustomerId}
          onWorkOrderChange={setSelectedWorkOrderId}
        />
      </div>

      {!selectedCustomerId ? (
        <SampleHubEmptyState hasCustomer={false} />
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading samples...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Failed to load samples. Please try again.
        </p>
      ) : samples.length === 0 ? (
        <SampleHubEmptyState hasCustomer={true} />
      ) : (
        <SampleHubGallery items={samples} onDelete={handleDeleteRequest} />
      )}

      <SampleHubUploadDrawer
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        defaultCustomerId={selectedCustomerId}
        defaultWorkOrderId={selectedWorkOrderId}
      />

      {selectedCustomerId && (
        <SampleHubDeleteDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open)
            if (!open) setItemToDelete(null)
          }}
          item={itemToDelete}
          customerId={selectedCustomerId}
          workOrderId={selectedWorkOrderId}
        />
      )}
    </Main>
  )
}

export default SampleHub
