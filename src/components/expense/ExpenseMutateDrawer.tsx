import { useEffect, useMemo, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
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
import { useCreateExpense, useUpdateExpense } from "@/hooks/useExpense"
import type { ExpenseFormInterface, Expense } from "@/interface/expenseInterface"
import { expenseFormSchema, type ExpenseFormType } from "@/schema/expenseFormSchema"
import { Combobox } from "@/components/ui/combobox"
import { useWorkOrderList } from "@/hooks/useWorkOrder"
import { useCustomerList } from "@/hooks/useCustomer"
import { useTeamList } from "@/hooks/useTeam"
import type { TeamMember } from "@/interface/teamInterface"
import { expensePurposes } from "@/constance/expenseConstance"

interface ExpenseMutateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: Expense | null
    onSave?: (data: ExpenseFormInterface) => void
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
    const { data: workOrdersData } = useWorkOrderList(workOrderSearch || undefined, 100, 0)
    const workOrderOptions = useMemo(() => {
        return (workOrdersData?.data || []).map((workOrder) => ({
            value: String(workOrder.id),
            label: workOrder.no,
        }))
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

    const form = useForm<ExpenseFormType>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: {
            work_order: "",
            purpose: "",
            customer: undefined,
            paid_by: undefined,
            details: "",
            amount: 0,
            expense_date: new Date().toISOString().split("T")[0],
            remarks: "",
        },
    })

    useEffect(() => {
        if (open && currentRow && isUpdate) {
            // Populate form with current row data for update
            form.reset({
                work_order: currentRow.work_order ? String(currentRow.work_order) : "",
                purpose: currentRow.purpose || "",
                customer: currentRow.customer ? String(currentRow.customer) : undefined,
                paid_by: currentRow.paid_by ? String(currentRow.paid_by) : undefined,
                details: currentRow.details || "",
                amount: currentRow.amount || 0,
                expense_date: currentRow.expense_date || new Date().toISOString().split("T")[0],
                remarks: currentRow.remarks || "",
            })
        } else if (!open) {
            // Reset form when closing
            form.reset({
                work_order: "",
                purpose: "",
                customer: undefined,
                paid_by: undefined,
                details: "",
                amount: 0,
                expense_date: new Date().toISOString().split("T")[0],
                remarks: "",
            })
            setWorkOrderSearch("")
            setCustomerSearch("")
            setPaidBySearch("")
        }
    }, [open, currentRow, isUpdate, form])

    const onSubmit: SubmitHandler<ExpenseFormType> = (data) => {
        const payload: ExpenseFormInterface = {
            work_order: data.work_order ? String(data.work_order) : undefined,
            purpose: data.purpose.trim(),
            customer: data.customer ? String(data.customer) : undefined,
            paid_by: data.paid_by ? String(data.paid_by) : undefined,
            details: data.details?.trim() || undefined,
            amount: data.amount || undefined,
            expense_date: data.expense_date || undefined,
            remarks: data.remarks || null,
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
                    <SheetTitle>{isUpdate ? "Update Expense" : "Create Expense"}</SheetTitle>
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
                            name="work_order"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Work Order</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={workOrderOptions}
                                            value={typeof field.value === "string" ? field.value : (field.value ? String(field.value) : "")}
                                            onSelect={(val) => field.onChange(val || undefined)}
                                            onSearch={setWorkOrderSearch}
                                            placeholder="Select work order..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purpose *</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={purposeOptions}
                                            value={field.value || ""}
                                            onSelect={(val) => field.onChange(val)}
                                            placeholder="Select purpose..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={customerOptions}
                                            value={field.value ? (typeof field.value === "string" ? field.value : String(field.value)) : ""}
                                            onSelect={(val) => field.onChange(val)}
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
                            name="paid_by"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paid By</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={paidByOptions}
                                            value={field.value ? (typeof field.value === "string" ? field.value : String(field.value)) : ""}
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
                                    <FormControl>
                                        <Input {...field} value={field.value || ""} placeholder="Expense details..." />
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
                                    <FormLabel>Amount</FormLabel>
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
                            name="expense_date"
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
                                        <FormLabel>Expense Date</FormLabel>
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
                    <Button form="expense-form" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {createMutation.isPending || updateMutation.isPending
                            ? "Saving..."
                            : isUpdate
                            ? "Update Expense"
                            : "Create Expense"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default ExpenseMutateDrawer
