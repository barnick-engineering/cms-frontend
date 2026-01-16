import { useEffect, useMemo, useState } from "react"
import type z from "zod"
import { useForm, useFieldArray } from "react-hook-form"
import type { SubmitHandler } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { WorkOrderMutateDrawerProps, WorkOrderFormInterface } from "@/interface/workOrderInterface"
import { workOrderFormSchema } from "@/schema/workOrderFormSchema"
import { useCreateWorkOrder } from "@/hooks/useWorkOrder"
import { useCustomerList } from "@/hooks/useCustomer"
import { Combobox } from "@/components/ui/combobox"
import { Plus, Minus } from "lucide-react"

type WorkOrderFormSchema = z.infer<typeof workOrderFormSchema>

const WorkOrderMutateDrawer = ({
  open,
  onOpenChange,
  currentRow: _currentRow,
  onSave,
}: WorkOrderMutateDrawerProps) => {
  const createMutation = useCreateWorkOrder()

  // Fetch customers for combobox with search functionality
  const [customerSearch, setCustomerSearch] = useState("")
  const { data: customersData, isLoading: customersLoading } = useCustomerList(customerSearch || undefined, 100, 0)
  const customerOptions = useMemo(() => {
    return (customersData?.data || []).map((customer) => ({
      value: String(customer.id),
      label: customer.name,
    }))
  }, [customersData])

  const form = useForm<WorkOrderFormSchema>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: undefined,
      items: [{ item: "", total_order: 0, unit_price: 0 }],
      date: new Date().toISOString().split("T")[0],
      total_paid: 0,
      remarks: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  useEffect(() => {
    if (!open) {
      form.reset({
        customer: undefined,
        items: [{ item: "", total_order: 0, unit_price: 0 }],
        date: new Date().toISOString().split("T")[0],
        total_paid: 0,
        remarks: "",
      })
      setCustomerSearch("")
    }
  }, [open, form])

  // Watch items array for real-time calculation
  const watchedItems = form.watch("items")

  // Calculate total amount - updates in real-time
  const totalAmount = useMemo(() => {
    if (!watchedItems || watchedItems.length === 0) return 0
    return watchedItems.reduce((sum, item) => {
      const quantity = Number(item.total_order) || 0
      const price = Number(item.unit_price) || 0
      return sum + (quantity * price)
    }, 0)
  }, [watchedItems])

  const onSubmit: SubmitHandler<WorkOrderFormSchema> = (data) => {
    const normalizedData: WorkOrderFormInterface = {
      customer: data.customer || undefined,
      items: data.items.map((item) => ({
        item: item.item.trim(),
        total_order: item.total_order,
        unit_price: item.unit_price,
      })),
      date: data.date || new Date().toISOString().split("T")[0],
      total_paid: data.total_paid || 0,
      remarks: data.remarks || null,
    }

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader className="text-start">
          <SheetTitle>Create Work Order</SheetTitle>
          <SheetDescription>
            Add a new work order by providing necessary info. Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="work-order-form"
            onSubmit={form.handleSubmit(onSubmit)}
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
                  const [year, month, day] = dateString.split('-').map(Number)
                  return new Date(year, month - 1, day)
                }
                
                // Convert Date object to date string (YYYY-MM-DD) in local timezone
                const formatDateToString = (date: Date): string => {
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  return `${year}-${month}-${day}`
                }
                
                return (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value ? parseDateString(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? formatDateToString(date) : undefined)
                        }}
                        placeholder="Pick a date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Items *</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ item: "", total_order: 0, unit_price: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {index + 1}</span>
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

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.total_order`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = Number(e.target.value) || 0
                                field.onChange(value)
                              }}
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
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = Number(e.target.value) || 0
                                field.onChange(value)
                              }}
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
                    Subtotal: ৳{((watchedItems[index]?.total_order || 0) * (watchedItems[index]?.unit_price || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-lg font-bold">৳{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="total_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Paid</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button form="work-order-form" type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default WorkOrderMutateDrawer
