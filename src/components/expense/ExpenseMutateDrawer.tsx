import { useEffect, useMemo, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronsUpDown, Search } from "lucide-react"
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/ui/number-input"
import { coerceNumber } from "@/lib/numberInput"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { useCreateExpense, useUpdateExpense } from "@/hooks/useExpense"
import type { ExpenseFormInterface, Expense } from "@/interface/expenseInterface"
import { expenseFormSchema, type ExpenseFormType } from "@/schema/expenseFormSchema"
import { Combobox } from "@/components/ui/combobox"
import { useWorkOrderList, useWorkOrderById } from "@/hooks/useWorkOrder"
import { useCustomerList } from "@/hooks/useCustomer"
import { useTeamList } from "@/hooks/useTeam"
import type { TeamMember } from "@/interface/teamInterface"
import { expensePurposes } from "@/constance/expenseConstance"
import { cn } from "@/lib/utils"

interface ExpenseMutateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: Expense | null
    onSave?: (data: ExpenseFormInterface) => void
}

const KNOWN_PURPOSE_VALUES = new Set(expensePurposes.map((p) => p.value))

function parsePurposeString(raw: string): { selected: string[]; otherText: string } {
    if (!raw.trim()) return { selected: [], otherText: "" }
    const parts = raw.split(", ").map((p) => p.trim()).filter(Boolean)
    const selected: string[] = []
    let otherText = ""
    for (const part of parts) {
        if (part.startsWith("others: ")) {
            selected.push("others")
            otherText = part.slice("others: ".length)
        } else if (KNOWN_PURPOSE_VALUES.has(part)) {
            selected.push(part)
        } else {
            selected.push("others")
            otherText = part
        }
    }
    return { selected, otherText }
}

function buildPurposeString(selected: string[], otherText: string): string {
    return selected
        .map((p) =>
            p === "others" && otherText.trim() ? `others: ${otherText.trim()}` : p
        )
        .join(", ")
}

function CheckMark({ checked }: { checked: boolean }) {
    return (
        <div className={cn(
            "shrink-0 h-4 w-4 rounded-sm border flex items-center justify-center transition-colors",
            checked ? "bg-primary border-primary" : "border-input bg-background"
        )}>
            {checked && (
                <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
    )
}

interface PurposeMultiSelectProps {
    options: { value: string; label: string }[]
    value: string[]
    onChange: (val: string[]) => void
}

function PurposeMultiSelect({ options, value, onChange }: PurposeMultiSelectProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")

    const filtered = options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
    )

    const toggle = (val: string) => {
        if (value.includes(val)) {
            onChange(value.filter((v) => v !== val))
        } else {
            onChange([...value, val])
        }
    }

    const displayText =
        value.length === 0
            ? "Select purposes..."
            : value.length === 1
              ? options.find((o) => o.value === value[0])?.label ?? value[0]
              : `${value.length} purposes selected`

    return (
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch("") }}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-8"
                >
                    <span className="truncate text-sm">{displayText}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <div className="flex items-center gap-2 border-b px-3 py-2">
                    <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search purposes..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>
                <div className="overflow-y-auto max-h-52 p-1">
                    {filtered.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">No results.</p>
                    ) : (
                        filtered.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => toggle(option.value)}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer text-left",
                                    value.includes(option.value) && "bg-accent/50"
                                )}
                            >
                                <CheckMark checked={value.includes(option.value)} />
                                <span className={cn(value.includes(option.value) && "font-medium")}>
                                    {option.label}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

const ExpenseMutateDrawer = ({
    open,
    onOpenChange,
    currentRow,
    onSave,
}: ExpenseMutateDrawerProps) => {
    const createMutation = useCreateExpense()
    const updateMutation = useUpdateExpense()
    const isUpdate = !!currentRow?.id

    // Fetch work orders for combobox
    const [workOrderSearch, setWorkOrderSearch] = useState("")
    const { data: workOrdersData } = useWorkOrderList({
      search: workOrderSearch || undefined,
      limit: 100,
      offset: 0,
    })
    const workOrderOptions = useMemo(() => {
        return (workOrdersData?.data || []).map((workOrder) => ({
          value: String(workOrder.id),
          label: `${workOrder.no}${workOrder?.customer ? ` | ${workOrder.customer}` : ""}`,
        }));
    }, [workOrdersData])

    // Fetch customers for combobox with search functionality
    const [customerSearch, setCustomerSearch] = useState("")
    const { data: customersData, isLoading: customersLoading } = useCustomerList(customerSearch || undefined, 100, 0)
    const customerOptions = useMemo(() => {
        return (customersData?.data || []).map((customer) => ({
            value: String(customer.id),
            label: customer.name,
        }))
    }, [customersData])

    // Purpose options
    const purposeOptions = useMemo(() => {
        return expensePurposes.map((purpose) => ({
            value: purpose.value,
            label: purpose.label,
        }))
    }, [])

    // Fetch team members (users) for paid_by combobox
    const [paidBySearch, setPaidBySearch] = useState("")
    const { data: teamData, isLoading: teamLoading } = useTeamList()
    const paidByOptions = useMemo(() => {
        if (!teamData || !Array.isArray(teamData) || teamData.length === 0) return []

        const searchLower = paidBySearch.toLowerCase()
        return teamData
            .filter((member: TeamMember) => {
                if (!paidBySearch) return true
                const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase().trim()
                return (
                    fullName.includes(searchLower) ||
                    (member.email && member.email.toLowerCase().includes(searchLower)) ||
                    (member.designation && member.designation.toLowerCase().includes(searchLower))
                )
            })
            .map((member: TeamMember) => ({
                value: String(member.id),
                label: `${member.first_name || ''} ${member.last_name || ''}${member.designation ? ` (${member.designation})` : ''}`.trim(),
            }))
    }, [teamData, paidBySearch])

    const normalizeOptionalId = (value: string | number | null | undefined): number | null => {
        if (value === undefined || value === null || value === "") return null
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }

    const form = useForm<ExpenseFormType>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: {
            work_order: "",
            purpose: [],
            other_purpose: "",
            customer: undefined,
            paid_by: undefined,
            details: "",
            amount: undefined,
            expense_date: new Date().toISOString().split("T")[0],
            remarks: "",
            work_order_items_ids: [],
        },
    })

    const watchedPurpose = form.watch("purpose")
    const watchedWorkOrder = form.watch("work_order")

    // Derive numeric work order ID for fetching items
    const selectedWorkOrderId = useMemo(() => {
        if (!watchedWorkOrder || watchedWorkOrder === "" || watchedWorkOrder === "__none__") return null
        const parsed = Number(watchedWorkOrder)
        return Number.isFinite(parsed) ? parsed : null
    }, [watchedWorkOrder])

    // Fetch work order detail to get items when a WO is selected
    const { data: workOrderDetail } = useWorkOrderById(
        selectedWorkOrderId ?? 0,
        { enabled: !!selectedWorkOrderId }
    )

    const workOrderItems = useMemo(() => workOrderDetail?.items ?? [], [workOrderDetail])

    // Track selected item IDs (synced with form field)
    const watchedItemIds = form.watch("work_order_items_ids") ?? []

    const toggleItem = (itemId: number) => {
        const current = form.getValues("work_order_items_ids") ?? []
        let next: number[]
        if (current.includes(itemId)) {
            next = current.filter((id) => id !== itemId)
        } else {
            next = [...current, itemId]
        }
        form.setValue("work_order_items_ids", next, { shouldValidate: false })
    }

    // When work order changes, clear previously selected items
    const prevWorkOrderIdRef = useMemo(() => ({ value: selectedWorkOrderId }), [])
    useEffect(() => {
        if (prevWorkOrderIdRef.value !== selectedWorkOrderId) {
            prevWorkOrderIdRef.value = selectedWorkOrderId
            form.setValue("work_order_items_ids", [], { shouldValidate: false })
        }
    }, [selectedWorkOrderId, form, prevWorkOrderIdRef])

    useEffect(() => {
        if (open && currentRow && isUpdate) {
            const { selected, otherText } = parsePurposeString(currentRow.purpose || "")
            const linkedItemIds = (currentRow.work_order_items ?? []).map((wi) => wi.id)
            form.reset({
                work_order: currentRow.work_order ? String(currentRow.work_order) : "",
                purpose: selected,
                other_purpose: otherText,
                customer: currentRow.customer ? String(currentRow.customer) : undefined,
                paid_by: currentRow.paid_by ? String(currentRow.paid_by) : undefined,
                details: currentRow.details || "",
                amount: currentRow.amount || 0,
                expense_date: currentRow.expense_date || new Date().toISOString().split("T")[0],
                remarks: currentRow.remarks || "",
                work_order_items_ids: linkedItemIds,
            })
        } else if (!open) {
            form.reset({
                work_order: "",
                purpose: [],
                other_purpose: "",
                customer: undefined,
                paid_by: undefined,
                details: "",
                amount: undefined,
                expense_date: new Date().toISOString().split("T")[0],
                remarks: "",
                work_order_items_ids: [],
            })
            setWorkOrderSearch("")
            setCustomerSearch("")
            setPaidBySearch("")
        }
    }, [open, currentRow, isUpdate, form])

    const onSubmit: SubmitHandler<ExpenseFormType> = (data) => {
        const purposeString = buildPurposeString(data.purpose, data.other_purpose || "")
        const payload: ExpenseFormInterface = {
            work_order: normalizeOptionalId(data.work_order),
            purpose: purposeString,
            customer: normalizeOptionalId(data.customer),
            paid_by: normalizeOptionalId(data.paid_by),
            details: data.details?.trim() || null,
            amount: coerceNumber(data.amount),
            expense_date: data.expense_date || new Date().toISOString().split("T")[0],
            remarks: data.remarks?.trim() || null,
            work_order_items_ids: data.work_order_items_ids ?? [],
        }

        if (isUpdate && currentRow?.id) {
            updateMutation.mutate(
                { id: currentRow.id, data: payload },
                {
                    onSuccess: () => {
                        toast.success("Expense updated successfully.")
                        onOpenChange(false)
                        onSave?.(payload)
                        form.reset()
                    },
                    onError: (err: unknown) => {
                        const error = err as AxiosError<{ message: string }>
                        toast.error(error?.response?.data?.message || "Update failed")
                    },
                }
            )
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success("Expense created successfully.")
                    onOpenChange(false)
                    onSave?.(payload)
                    form.reset()
                },
                onError: (err: unknown) => {
                    const error = err as AxiosError<{ message: string }>
                    toast.error(error?.response?.data?.message || "Creation failed")
                },
            })
        }
    }

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col">
          <SheetHeader className="text-start">
            <SheetTitle>
              {isUpdate ? "Update Expense" : "Create Expense"}
            </SheetTitle>
            <SheetDescription>
              {isUpdate
                ? `Update expense ${currentRow?.no || ""} by modifying the fields below. Click save when you're done.`
                : "Add a new expense by providing necessary info. Click save when you're done."}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              id="expense-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 space-y-6 overflow-y-auto px-4"
            >
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <FormControl className="w-full">
                      <Combobox
                        options={[{ value: "__none__", label: "No Customer" }, ...customerOptions]}
                        value={
                          field.value
                            ? typeof field.value === "string"
                              ? field.value
                              : String(field.value)
                            : ""
                        }
                        onSelect={(val) => field.onChange(val === "__none__" ? undefined : val)}
                        onSearch={setCustomerSearch}
                        loading={customersLoading}
                        placeholder="Search and select customer (optional)..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="work_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Order</FormLabel>
                    <FormControl className="w-full">
                      <Combobox
                        options={[{ value: "__none__", label: "No Work Order" }, ...workOrderOptions]}
                        value={
                          typeof field.value === "string"
                            ? field.value
                            : field.value
                              ? String(field.value)
                              : ""
                        }
                        onSelect={(val) => field.onChange(val === "__none__" ? undefined : val)}
                        onSearch={setWorkOrderSearch}
                        placeholder="Select work order (optional)..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Work Order Items selector — shown when a WO with items is selected */}
              {selectedWorkOrderId && workOrderItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-none">
                    Work Order Items
                    <span className="ml-1 text-xs text-muted-foreground font-normal">
                      (select to link &amp; auto-fill amount)
                    </span>
                  </p>
                  <div className="rounded-md border divide-y">
                    {workOrderItems.map((item) => {
                      const itemId = item.id as number
                      const unitPrice = item.unit_price !== undefined ? Number(item.unit_price) : 0
                      const isChecked = watchedItemIds.includes(itemId)
                      return (
                        <div
                          key={itemId}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleItem(itemId)}
                          onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") toggleItem(itemId) }}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-sm text-left hover:bg-accent/50 transition-colors",
                            isChecked && "bg-accent/30"
                          )}
                        >
                          <CheckMark checked={isChecked} />
                          <span className={cn("flex-1 truncate", isChecked && "font-medium")}>
                            {item.item}
                          </span>
                          {unitPrice > 0 && (
                            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                              ৳{unitPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {watchedItemIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {watchedItemIds.length} item{watchedItemIds.length > 1 ? "s" : ""} selected — amount auto-filled. You can still edit it manually.
                    </p>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose *</FormLabel>
                    <FormControl className="w-full">
                      <PurposeMultiSelect
                        options={purposeOptions}
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {watchedPurpose.includes("others") && (
                <FormField
                  control={form.control}
                  name="other_purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Purpose</FormLabel>
                      <FormControl className="w-full">
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Specify the other purpose..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="paid_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid By</FormLabel>
                    <FormControl className="w-full">
                      <Combobox
                        options={paidByOptions}
                        value={
                          field.value
                            ? typeof field.value === "string"
                              ? field.value
                              : String(field.value)
                            : ""
                        }
                        onSelect={(val) => field.onChange(val || undefined)}
                        onSearch={setPaidBySearch}
                        loading={teamLoading}
                        placeholder="Search and select user..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl className="w-full">
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Expense details..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl className="w-full">
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
                name="expense_date"
                render={({ field }) => {
                  const parseDateString = (dateString: string): Date => {
                    const [year, month, day] = dateString.split("-").map(Number);
                    return new Date(year, month - 1, day);
                  };

                  const formatDateToString = (date: Date): string => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                  };

                  return (
                    <FormItem>
                      <FormLabel>Expense Date</FormLabel>
                      <FormControl className="w-full">
                        <DatePicker
                          selected={
                            field.value ? parseDateString(field.value) : undefined
                          }
                          onSelect={(date) => {
                            field.onChange(date ? formatDateToString(date) : undefined);
                          }}
                          placeholder="Pick a date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl className="w-full">
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
            <Button
              form="expense-form"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isUpdate
                  ? "Update Expense"
                  : "Create Expense"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
}

export default ExpenseMutateDrawer
