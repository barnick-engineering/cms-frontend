import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { WorkOrder } from "@/interface/workOrderInterface"
import { useUpdateWorkOrder } from "@/hooks/useWorkOrder"

const updateWorkOrderSchema = z.object({
  total_paid: z.number().min(0, "Amount must be positive"),
})

type UpdateWorkOrderSchema = z.infer<typeof updateWorkOrderSchema>

type WorkOrderUpdateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: WorkOrder | null
  onSave?: () => void
}

const WorkOrderUpdateDrawer = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}: WorkOrderUpdateDrawerProps) => {
  const updateMutation = useUpdateWorkOrder()

  const form = useForm<UpdateWorkOrderSchema>({
    resolver: zodResolver(updateWorkOrderSchema),
    defaultValues: {
      total_paid: 0,
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset({ total_paid: 0 })
    }
  }, [open, form])

  const onSubmit: SubmitHandler<UpdateWorkOrderSchema> = (data) => {
    if (!currentRow) return

    updateMutation.mutate(
      { id: currentRow.id, data: { total_paid: data.total_paid } },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSave?.()
          form.reset()
          toast.success("Payment added successfully.")
        },
        onError: (err: unknown) => {
          const error = err as AxiosError<{ message: string }>
          toast.error(error?.response?.data?.message || "Update failed")
        },
      }
    )
  }

  const currentTotalPaid = currentRow?.total_paid || 0
  const currentAmount = currentRow?.amount || 0
  const pendingAmount = currentAmount - currentTotalPaid

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>Add Payment</SheetTitle>
          <SheetDescription>
            Add payment to work order <strong>{currentRow?.no}</strong>
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="work-order-update-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">৳{currentAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Paid:</span>
                <span className="font-semibold">৳{currentTotalPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Pending:</span>
                <span className="font-bold">৳{pendingAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="total_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Payment Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      max={pendingAmount}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Maximum: ৳{pendingAmount.toLocaleString('en-IN')}
                  </p>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button form="work-order-update-form" type="submit">
            Add Payment
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default WorkOrderUpdateDrawer
