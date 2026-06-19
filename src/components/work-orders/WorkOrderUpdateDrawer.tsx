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
import { NumberInput } from "@/components/ui/number-input"
import { coerceNumber } from "@/lib/numberInput"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { WorkOrder } from "@/interface/workOrderInterface"
import { useUpdateWorkOrder } from "@/hooks/useWorkOrder"
import { getPendingAmount } from "@/lib/workOrderPaymentStatus"

const updateWorkOrderSchema = z
  .object({
    total_paid: z
      .number({ error: "Amount is required" })
      .min(0, "Amount must be 0 or more")
      .optional(),
    paid: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.paid && data.total_paid === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter an amount or mark as paid",
        path: ["total_paid"],
      })
    }
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
  const pendingAmount = getPendingAmount(
    currentAmount,
    currentTotalPaid,
    currentRow?.is_paid
  )

  const form = useForm<UpdateWorkOrderSchema>({
    resolver: zodResolver(updateWorkOrderSchema),
    defaultValues: {
      total_paid: undefined,
      paid: false,
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset({ total_paid: undefined, paid: false })
    }
  }, [open, form])

  const onSubmit: SubmitHandler<UpdateWorkOrderSchema> = (data) => {
    if (!currentRow) return
    const additionalAmount = coerceNumber(data.total_paid) ?? 0

    updateMutation.mutate(
      {
        id: currentRow.id,
        data: {
          ...(additionalAmount > 0 || !data.paid ? { total_paid: additionalAmount } : {}),
          ...(data.paid ? { is_paid: true } : {}),
        },
      },
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
                        Records the amount received and marks the order settled. Any remaining balance is waived (e.g. receive ৳4,000 on a ৳5,000 order).
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
                  <FormLabel>
                    Amount received{form.watch("paid") ? " (optional if already partially paid)" : ""}
                  </FormLabel>
                  <FormControl>
                    <NumberInput
                      value={field.value}
                      onChange={field.onChange}
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      max={pendingAmount}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    {form.watch("paid")
                      ? "This amount is added to total paid. The order is marked settled; remaining balance is waived."
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
