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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { WorkOrder } from "@/interface/workOrderInterface"
import { useUpdateWorkOrder } from "@/hooks/useWorkOrder"

const updateWorkOrderSchema = z.object({
  total_paid: z.number().min(0, "Amount must be 0 or more"),
  paid: z.boolean().optional(),
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

  const currentTotalPaid = currentRow?.total_paid || 0
  const currentAmount = currentRow?.amount || 0
  const pendingAmount = currentAmount - currentTotalPaid

  const form = useForm<UpdateWorkOrderSchema>({
    resolver: zodResolver(updateWorkOrderSchema),
    defaultValues: {
      total_paid: 0,
      paid: false,
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset({ total_paid: 0, paid: false })
    }
  }, [open, form])

  const onSubmit: SubmitHandler<UpdateWorkOrderSchema> = (data) => {
    if (!currentRow) return
    // When Paid is checked: mark order fully paid (send remainder so total_paid = amount, status Paid, pending 0).
    // Amount received (data.total_paid) is not sent in that case—e.g. receive 70000, waive 500, mark paid.
    const additionalAmount = data.paid ? pendingAmount : data.total_paid

    updateMutation.mutate(
      { id: currentRow.id, data: { total_paid: additionalAmount } },
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

            {pendingAmount > 0 && (
              <FormField
                control={form.control}
                name="paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer font-medium">Paid</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Mark this work order as fully paid (status Paid, pending ৳0). You can receive less than the full amount and still mark it paid—e.g. receive ৳70,000, waive ৳500, tick Paid.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="total_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount received (optional when marking as paid)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      max={pendingAmount}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    {form.watch("paid")
                      ? "When Paid is checked, the order will be marked fully paid regardless of this amount."
                      : `Maximum: ৳${pendingAmount.toLocaleString('en-IN')}`}
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
