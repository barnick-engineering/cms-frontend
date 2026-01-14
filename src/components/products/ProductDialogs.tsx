import { ConfirmDialog } from '@/components/confirm-dialog'
import { useProducts } from './product-provider'
import { useDeleteProduct } from '@/hooks/useProduct'
import ProductMutateDrawer from "./ProductMutateDrawer"
import ProductViewDrawer from './ProductViewDrawer'
import { useDrawerStore } from '@/stores/drawerStore'

const ProductDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts()
  const deleteMutation = useDeleteProduct()

  const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

  return (
    <>
      <ProductMutateDrawer
        key='product-create'
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <ProductViewDrawer
            key={`product-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(val: boolean) => {
              setOpen(val ? 'view' : null)
              setDrawerOpen(val)
            }}
            currentRow={currentRow}
          />

          <ProductMutateDrawer
            key={`product-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={() => setOpen(null)}
          />

          <ConfirmDialog
            key='product-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(val: boolean) => setOpen(val ? 'delete' : null)}
            handleConfirm={() => {
              if (!currentRow) return
              deleteMutation.mutate(
                currentRow.id,
                {
                  onSuccess: () => {
                    setOpen(null)
                    setCurrentRow(null)
                  },
                }
              )
            }}
            className='max-w-md'
            title={`Delete this product: ${currentRow.name} ?`}
            desc={
              <>
                You are about to delete a product with the name{' '}
                <strong>{currentRow.name}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}

export default ProductDialogs
