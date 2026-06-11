import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { AlertCircle, ImagePlus, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Combobox } from '@/components/ui/combobox'
import { useCustomerList } from '@/hooks/useCustomer'
import { useWorkOrderList } from '@/hooks/useWorkOrder'
import { useUploadSample } from '@/hooks/useSampleHub'
import {
  fieldErrorsFromAxiosError,
  messageFromAxiosError,
} from '@/lib/barnickApiError'
import {
  isAllowedSampleImageFile,
  isHeicLikeFile,
  SAMPLE_IMAGE_ACCEPT,
} from '@/lib/sampleHubUpload'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

type SampleHubUploadDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCustomerId?: number
  defaultWorkOrderId?: number
}

export function SampleHubUploadDrawer({
  open,
  onOpenChange,
  defaultCustomerId,
  defaultWorkOrderId,
}: SampleHubUploadDrawerProps) {
  const uploadMutation = useUploadSample()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [customerId, setCustomerId] = useState<number | undefined>(
    defaultCustomerId
  )
  const [workOrderId, setWorkOrderId] = useState<number | undefined>(
    defaultWorkOrderId
  )
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewFailed, setPreviewFailed] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [customerSearch, setCustomerSearch] = useState('')
  const [workOrderSearch, setWorkOrderSearch] = useState('')

  const { data: customersData, isLoading: customersLoading } = useCustomerList(
    customerSearch || undefined,
    100,
    0
  )
  const customerOptions = useMemo(
    () =>
      (customersData?.data || []).map((customer) => ({
        value: String(customer.id),
        label: customer.name,
      })),
    [customersData]
  )

  const { data: workOrdersData, isLoading: workOrdersLoading } = useWorkOrderList(
    {
      search: workOrderSearch || undefined,
      limit: 100,
      offset: 0,
      customer_id: customerId,
    },
    { enabled: !!customerId }
  )
  const workOrderOptions = useMemo(
    () =>
      (workOrdersData?.data || []).map((workOrder) => ({
        value: String(workOrder.id),
        label: workOrder.no,
      })),
    [workOrdersData]
  )

  useEffect(() => {
    if (open) {
      setCustomerId(defaultCustomerId)
      setWorkOrderId(defaultWorkOrderId)
      setFile(null)
      setFieldErrors({})
      setUploadError(null)
      setPreviewFailed(false)
    }
  }, [open, defaultCustomerId, defaultWorkOrderId])

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    setUploadError(null)
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.file
      return next
    })

    if (!selected) {
      setFile(null)
      return
    }

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setFile(null)
      e.target.value = ''
      toast.error('File too large. Maximum size is 20 MB.')
      return
    }

    if (!isAllowedSampleImageFile(selected)) {
      setFile(null)
      e.target.value = ''
      toast.error('Please select an image file (JPG, PNG, HEIC, etc.).')
      return
    }

    setPreviewFailed(false)
    setFile(selected)
  }

  const handleSubmit = () => {
    if (!customerId) {
      setFieldErrors({ customer_id: ['Customer is required'] })
      return
    }
    if (!file) {
      setFieldErrors({ file: ['Please select a file'] })
      return
    }

    setUploadError(null)

    uploadMutation.mutate(
      {
        customer_id: customerId,
        work_order_id: workOrderId,
        file,
      },
      {
        onSuccess: () => {
          toast.success('Sample uploaded')
          onOpenChange(false)
        },
        onError: (error) => {
          const message = messageFromAxiosError(error)
          const isGeneric =
            message === 'Request failed.' || message === 'Something went wrong.'

          const displayMessage =
            isGeneric &&
            axios.isAxiosError(error) &&
            error.response?.status === 502
              ? 'Google Drive upload failed. Please try again.'
              : message

          setUploadError(displayMessage)

          const fields = fieldErrorsFromAxiosError(error)
          if (fields) {
            setFieldErrors(fields)
          }

          if (displayMessage.length > 100) {
            toast.error('Upload failed. See the message in the drawer.')
          } else {
            toast.error(displayMessage)
          }
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 pb-4 text-start">
          <SheetTitle>Upload sample</SheetTitle>
          <SheetDescription>
            Attach a sample image to a customer record. Images must be under 20
            MB.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Upload failed</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap break-words">
                {uploadError}
              </AlertDescription>
            </Alert>
          )}

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Sample details</h3>
              <p className="text-sm text-muted-foreground">
                Link this upload to a customer and optional work order.
              </p>
            </div>

            <div className="space-y-5 rounded-lg border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Customer *</Label>
                <Combobox
                  options={customerOptions}
                  placeholder="Select customer..."
                  emptyMessage="No customers found."
                  value={customerId ? String(customerId) : ''}
                  onSelect={(value) => {
                    const parsed = value ? Number(value) : undefined
                    setCustomerId(parsed)
                    setWorkOrderId(undefined)
                    setFieldErrors((prev) => {
                      const next = { ...prev }
                      delete next.customer_id
                      return next
                    })
                  }}
                  onSearch={setCustomerSearch}
                  onSearchClear={() => setCustomerSearch('')}
                  loading={customersLoading}
                  className="h-10 w-full bg-background"
                />
                {fieldErrors.customer_id?.[0] && (
                  <p className="text-sm text-destructive">
                    {fieldErrors.customer_id[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Work order{' '}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Combobox
                  options={workOrderOptions}
                  placeholder={customerId ? 'None' : 'Select customer first'}
                  emptyMessage="No work orders found."
                  value={workOrderId ? String(workOrderId) : ''}
                  onSelect={(value) => {
                    setWorkOrderId(value ? Number(value) : undefined)
                  }}
                  onSearch={setWorkOrderSearch}
                  onSearchClear={() => setWorkOrderSearch('')}
                  loading={workOrdersLoading}
                  disabled={!customerId}
                  className="h-10 w-full bg-background"
                />
                {fieldErrors.work_order_id?.[0] && (
                  <p className="text-sm text-destructive">
                    {fieldErrors.work_order_id[0]}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Image file</h3>
              <p className="text-sm text-muted-foreground">
                JPG, PNG, HEIC (iPhone), WebP, and other image formats.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'relative flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                  'border-muted-foreground/20 bg-muted/20 hover:border-muted-foreground/35 hover:bg-muted/35',
                  fieldErrors.file?.[0] && 'border-destructive/50'
                )}
              >
                {file &&
                previewUrl &&
                !previewFailed &&
                !isHeicLikeFile(file) ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-52 w-full rounded-md object-contain"
                    onError={() => setPreviewFailed(true)}
                  />
                ) : file ? (
                  <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isHeicLikeFile(file)
                        ? 'HEIC selected — preview not shown in browser, upload will still work.'
                        : 'Preview unavailable — file is ready to upload.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm font-medium">
                      Click to choose an image
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      or drag and drop — max 20 MB
                    </p>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                id="sample-file"
                type="file"
                accept={SAMPLE_IMAGE_ACCEPT}
                className="hidden"
                onChange={handleFileChange}
              />

              {file && (
                <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </Button>
                </div>
              )}

              {fieldErrors.file?.[0] && (
                <p className="text-sm text-destructive">{fieldErrors.file[0]}</p>
              )}
            </div>
          </section>
        </div>

        <SheetFooter className="border-t px-6 py-4 sm:flex-row sm:justify-end sm:space-x-0">
          <SheetClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </SheetClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={uploadMutation.isPending}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload sample'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
