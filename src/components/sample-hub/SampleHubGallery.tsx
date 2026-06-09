import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import type { SampleHubItem } from '@/interface/sampleHubInterface'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SampleHubImage } from './SampleHubImage'

type SampleHubGalleryProps = {
  items: SampleHubItem[]
  onDelete: (item: SampleHubItem) => void
}

export function SampleHubGallery({ items, onDelete }: SampleHubGalleryProps) {
  const [lightboxItem, setLightboxItem] = useState<SampleHubItem | null>(null)

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [items]
  )

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-lg border bg-card shadow-sm"
          >
            <button
              type="button"
              className="block w-full aspect-square overflow-hidden bg-muted"
              onClick={() => setLightboxItem(item)}
            >
              <SampleHubImage
                item={item}
                variant="thumb"
                className="h-full w-full"
                imgClassName="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
            <div className="space-y-1 p-3">
              <p className="truncate text-sm font-medium" title={item.file_name}>
                {item.file_name}
              </p>
              {item.work_order_ref && (
                <p className="text-xs text-muted-foreground">
                  WO: {item.work_order_ref}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {format(new Date(item.created_at), 'dd MMM yyyy')}
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item)
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        ))}
      </div>

      <Dialog
        open={lightboxItem != null}
        onOpenChange={(open) => !open && setLightboxItem(null)}
      >
        <DialogContent className="max-w-[min(100vw-2rem,56rem)] gap-4 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">
              {lightboxItem?.file_name}
            </DialogTitle>
          </DialogHeader>
          {lightboxItem && (
            <div className="flex min-h-[200px] max-h-[75vh] items-center justify-center overflow-hidden rounded-md bg-muted/40">
              <SampleHubImage
                item={lightboxItem}
                variant="full"
                className="max-h-[75vh] w-full"
                imgClassName="max-h-[75vh] w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
