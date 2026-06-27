import { useEffect, useMemo, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import type { FieldErrors, Resolver, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { NumberInput } from "@/components/ui/number-input"
import { coerceNumber } from "@/lib/numberInput"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { WorkOrderMutateDrawerProps, WorkOrderFormInterface } from "@/interface/workOrderInterface"
import { workOrderFormSchema, type WorkOrderFormSchema } from "@/schema/workOrderFormSchema"
import { useCreateWorkOrder, useUpdateWorkOrderFull, useWorkOrderById } from "@/hooks/useWorkOrder"
import { useCustomerList } from "@/hooks/useCustomer"
import { Combobox } from "@/components/ui/combobox"
import { Plus, Minus } from "lucide-react"

const WorkOrderMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}: WorkOrderMutateDrawerProps) => {
  const createMutation = useCreateWorkOrder()
  const updateMutation = useUpdateWorkOrderFull()
  const isUpdate = !!currentRow?.id

  // Fetch work order details when in update mode
  const {
    data: workOrderDetails,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
  } = useWorkOrderById(currentRow?.id || 0, {
    enabled: isUpdate && open && !!currentRow?.id,
  })

  // Fetch customers for combobox with search functionality
  const [customerSearch, setCustomerSearch] = useState("")
  const { data: customersData, isLoading: customersLoading } = useCustomerList(customerSearch || undefined, 100, 0)
  const customerOptions = useMemo(() => {
    return (customersData?.data || []).map((customer) => ({
      value: String(customer.id),
      label: customer.name,
    }))
  }, [customersData])

  const emptyItem = {
    item: "",
    total_order: undefined,
    unit_price: undefined,
  } as unknown as WorkOrderFormSchema["items"][number]

  const form = useForm<WorkOrderFormSchema>({
    resolver: zodResolver(workOrderFormSchema) as Resolver<WorkOrderFormSchema>,
    defaultValues: {
      customer: undefined,
      items: [emptyItem],
      date: new Date().toISOString().split("T")[0],
      total_paid: undefined,
      delivery_charge: undefined,
      remarks: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // Populate form when editing
  useEffect(() => {
    if (open && isUpdate && workOrderDetails) {
      form.reset({
        customer: workOrderDetails.customer.id,
        items: workOrderDetails.items.map((item) => ({
          id: item.id,
          item: item.item,
          details: item.details || null,
          total_order: coerceNumber(item.total_order),
          unit_price: coerceNumber(item.unit_price),
        })),
        date: workOrderDetails.date ?? undefined,
        total_paid: coerceNumber(workOrderDetails.total_paid, 0),
        delivery_charge:
          workOrderDetails.delivery_charge != null
            ? coerceNumber(workOrderDetails.delivery_charge)
            : undefined,
        remarks: workOrderDetails.remarks ?? "",
      });
    } else if (!open) {
      form.reset({
        customer: undefined,
        items: [{ ...emptyItem, details: null }],
        date: new Date().toISOString().split("T")[0],
        total_paid: undefined,
        delivery_charge: undefined,
        remarks: "",
      });
      setCustomerSearch("")
    }
  }, [open, isUpdate, workOrderDetails, form])

  // Watch items array for real-time calculation
  const watchedItems = form.watch("items")

  // Calculate total amount - updates in real-time
  const totalAmount = useMemo(() => {
    if (!watchedItems || watchedItems.length === 0) return 0
    return watchedItems.reduce((sum, item) => {
      const quantity = coerceNumber(item.total_order)
      const price = coerceNumber(item.unit_price)
      return sum + (quantity * price)
    }, 0)
  }, [watchedItems])

  const onSubmit: SubmitHandler<WorkOrderFormSchema> = (data) => {
    const calculatedAmount = data.items.reduce((sum, item) => {
      const quantity = coerceNumber(item.total_order)
      const price = coerceNumber(item.unit_price)
      return sum + (quantity * price)
    }, 0)

    const normalizedData: WorkOrderFormInterface = {
      customer: data.customer || undefined,
      items: data.items.map((item) => ({
        ...(item.id && { id: item.id }),
        item: item.item.trim(),
        details: item.details || null,
        total_order: item.total_order,
        unit_price: item.unit_price,
      })),
      date: data.date || new Date().toISOString().split("T")[0],
      amount: Math.round(calculatedAmount),
      delivery_charge: Math.round(coerceNumber(data.delivery_charge, 0)),
      total_paid: data.total_paid || 0,
      remarks: data.remarks || null,
    };

    if (isUpdate && currentRow?.id) {
      // For full updates, calculate the difference for total_paid since backend adds to existing value
      // If we want to set a specific value, we need to send the difference
      const currentTotalPaid = workOrderDetails?.total_paid || 0
      const newTotalPaid = data.total_paid || 0
      const totalPaidDifference = newTotalPaid - currentTotalPaid
      
      const updatePayload: WorkOrderFormInterface = {
        ...normalizedData,
        ...(totalPaidDifference !== 0 && { total_paid: totalPaidDifference }),
      }
      delete updatePayload.amount
      
      updateMutation.mutate(
        { id: currentRow.id, data: updatePayload },
        {
          onSuccess: () => {
            onOpenChange(false)
            onSave?.(normalizedData)
            form.reset()
            toast.success("Work order updated successfully.")
          },
          onError: (err: unknown) => {
            const error = err as AxiosError<{
              message?: string
              response_message?: string | Record<string, string[]>
            }>
            const responseMessage = error?.response?.data?.response_message
            const msg =
              typeof responseMessage === "string"
                ? responseMessage
                : responseMessage && typeof responseMessage === "object"
                  ? Object.values(responseMessage).flat().join(", ")
                  : error?.response?.data?.message || "Update failed"
            toast.error(msg)
          },
        }
      )
    } else {
      createMutation.mutate(normalizedData, {
        onSuccess: () => {
          onOpenChange(false)
          onSave?.(normalizedData)
          form.reset()
          toast.success("Work order created successfully.")
        },
        onError: (err: unknown) => {
          const error = err as AxiosError<{ message: string }>
          toast.error(error?.response?.data?.message || "Creation failed")
        },
      })
    }
  }

  const onInvalid = (errors: FieldErrors<WorkOrderFormSchema>) => {
    const firstMessage = findFirstFormError(errors)
    toast.error(firstMessage || "Please fix the form errors before saving.")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader className="text-start">
          <SheetTitle>
            {isUpdate ? "Edit Work Order" : "Create Work Order"}
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Update the work order information. Click save when you're done."
              : "Add a new work order by providing necessary info. Click save when you're done."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="work-order-form"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <Combobox
                      options={customerOptions}
                      value={field.value ? String(field.value) : ""}
                      onSelect={(val) => field.onChange(Number(val))}
                      onSearch={setCustomerSearch}
                      loading={customersLoading}
                      placeholder="Search and select customer..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => {
                // Convert date string (YYYY-MM-DD) to local Date object
                const parseDateString = (dateString: string): Date => {
                  const [year, month, day] = dateString.split("-").map(Number);
                  return new Date(year, month - 1, day);
                };

                // Convert Date object to date string (YYYY-MM-DD) in local timezone
                const formatDateToString = (date: Date): string => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day}`;
                };

                return (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={
                          field.value ? parseDateString(field.value) : undefined
                        }
                        onSelect={(date) => {
                          field.onChange(
                            date ? formatDateToString(date) : undefined,
                          );
                        }}
                        placeholder="Pick a date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Items *</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append(emptyItem)
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Item {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.item`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Visiting Card" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.details`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Details</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                            }}
                            placeholder="Item details"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormMessage />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.total_order`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <NumberInput
                              value={field.value}
                              onChange={field.onChange}
                              min={1}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price *</FormLabel>
                          <FormControl>
                            <NumberInput
                              value={field.value}
                              onChange={field.onChange}
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Subtotal: ৳
                    {(
                      (watchedItems[index]?.total_order || 0) *
                      (watchedItems[index]?.unit_price || 0)
                    ).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-lg font-bold">
                  ৳{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="total_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Paid</FormLabel>
                  <FormControl>
                    <NumberInput
                      value={field.value}
                      onChange={field.onChange}
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_charge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Charge</FormLabel>
                  <FormControl>
                    <NumberInput
                      value={field.value}
                      onChange={field.onChange}
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {isUpdate && isDetailsError && (
          <p className="px-4 text-sm text-destructive">
            Could not load work order details. Close and try again.
          </p>
        )}

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button
            form="work-order-form"
            type="submit"
            disabled={isUpdate && (isLoadingDetails || isDetailsError)}
          >
            {isUpdate ? "Update" : "Create"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function findFirstFormError(errors: FieldErrors<WorkOrderFormSchema>): string | undefined {
  if (Array.isArray(errors)) {
    for (const item of errors) {
      const nested = findFirstFormError(item as FieldErrors<WorkOrderFormSchema>)
      if (nested) return nested
    }
    return undefined
  }

  for (const value of Object.values(errors)) {
    if (!value) continue
    if (typeof value === "object" && "message" in value && value.message) {
      return String(value.message)
    }
    if (typeof value === "object") {
      const nested = findFirstFormError(value as FieldErrors<WorkOrderFormSchema>)
      if (nested) return nested
    }
  }
  return undefined
}

export default WorkOrderMutateDrawer
