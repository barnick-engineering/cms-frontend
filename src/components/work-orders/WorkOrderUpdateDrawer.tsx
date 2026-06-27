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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/ui/number-input"
import { coerceNumber } from "@/lib/numberInput"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { WorkOrder, WorkOrderPaymentMethod } from "@/interface/workOrderInterface"
import { useUpdateWorkOrder } from "@/hooks/useWorkOrder"
import { DEFAULT_BKASH_NUMBER } from "@/lib/workOrderPaymentStatus"

const updateWorkOrderSchema = z
  .object({
    amount: z
      .number({ error: "Amount is required" })
      .min(0, "Amount must be 0 or more")
      .optional(),
    method: z.enum(["cash", "bank", "bkash"]),
    bkash_number: z.string().optional(),
    paid: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.paid && data.amount === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter an amount or mark as paid",
        path: ["amount"],
      })
    }
    if (data.method === "bkash" && (data.amount ?? 0) > 0) {
      const number = (data.bkash_number || "").trim()
      if (!number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bkash number is required",
          path: ["bkash_number"],
        })
      }
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
  const pendingAmount = currentAmount - currentTotalPaid

  const form = useForm<UpdateWorkOrderSchema>({
    resolver: zodResolver(updateWorkOrderSchema),
    defaultValues: {
      amount: undefined,
      method: "cash",
      bkash_number: DEFAULT_BKASH_NUMBER,
      paid: false,
    },
  })

  const watchedMethod = form.watch("method")

  useEffect(() => {
    if (!open) {
      form.reset({
        amount: undefined,
        method: "cash",
        bkash_number: DEFAULT_BKASH_NUMBER,
        paid: false,
      })
    }
  }, [open, form])

  const onSubmit: SubmitHandler<UpdateWorkOrderSchema> = (data) => {
    if (!currentRow) return

    const paymentAmount = data.paid
      ? Math.round(coerceNumber(data.amount, 0))
      : Math.round(coerceNumber(data.amount))

    updateMutation.mutate(
      {
        id: currentRow.id,
        data: {
          amount: paymentAmount,
          method: data.method as WorkOrderPaymentMethod,
          ...(data.method === "bkash" && {
            bkash_number: (data.bkash_number || DEFAULT_BKASH_NUMBER).trim(),
          }),
          ...(data.paid && { is_paid: true }),
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
          const error = err as AxiosError<{ response_message?: Record<string, string[]>; message?: string }>
          const msg =
            error?.response?.data?.response_message &&
            typeof error.response.data.response_message === "object"
              ? Object.values(error.response.data.response_message).flat().join(", ")
              : error?.response?.data?.message || "Update failed"
          toast.error(msg)
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

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="bkash">Bkash</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedMethod === "bkash" && (
              <FormField
                control={form.control}
                name="bkash_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bkash number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={DEFAULT_BKASH_NUMBER} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                        Mark this work order as settled even if the amount received is less than the total — e.g. receive ৳4,000 on a ৳5,000 order and waive the rest.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount received (optional when marking as paid)</FormLabel>
                  <FormControl>
                    <NumberInput
                      value={field.value}
                      onChange={field.onChange}
                      min={0}
                      step="1"
                      placeholder="0"
                      max={pendingAmount}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    {form.watch("paid")
                      ? "When Paid is checked, the order is marked settled with the amount you enter (not auto-filled to pending)."
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
