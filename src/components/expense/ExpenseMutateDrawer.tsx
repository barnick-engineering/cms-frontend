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
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { useCreateExpense } from "@/hooks/useExpense"
import type { ExpenseFormInterface } from "@/interface/expenseInterface"
import { expenseFormSchema, type ExpenseFormType } from "@/schema/expenseFormSchema"
import { Combobox } from "@/components/ui/combobox"
import { useWorkOrderList } from "@/hooks/useWorkOrder"
import { useCustomerList } from "@/hooks/useCustomer"
import { expensePurposes } from "@/constance/expenseConstance"

interface ExpenseMutateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: ExpenseFormInterface & { id?: string }
    onSave?: (data: ExpenseFormInterface) => void
}

const ExpenseMutateDrawer = ({
    open,
    onOpenChange,
    currentRow: _currentRow,
    onSave,
}: ExpenseMutateDrawerProps) => {
    const createMutation = useCreateExpense()

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

    const form = useForm<ExpenseFormType>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: {
            work_order: "",
            purpose: "",
            customer: undefined,
            details: "",
            amount: 0,
            expense_date: new Date().toISOString().split("T")[0],
            remarks: "",
        },
    })

    useEffect(() => {
        if (!open) {
            form.reset({
                work_order: "",
                purpose: "",
                customer: undefined,
                details: "",
                amount: 0,
                expense_date: new Date().toISOString().split("T")[0],
                remarks: "",
            })
            setWorkOrderSearch("")
            setCustomerSearch("")
        }
    }, [open, form])

    const onSubmit: SubmitHandler<ExpenseFormType> = (data) => {
        const payload: ExpenseFormInterface = {
            work_order: String(data.work_order),
            purpose: data.purpose.trim(),
            customer: data.customer ? String(data.customer) : undefined,
            details: data.details?.trim() || undefined,
            amount: data.amount || undefined,
            expense_date: data.expense_date || undefined,
            remarks: data.remarks || null,
        }

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

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader className="text-start">
                    <SheetTitle>Create Expense</SheetTitle>
                    <SheetDescription>
                        Add a new expense by providing necessary info. Click save when you're done.
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
                                    <FormLabel>Work Order *</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={workOrderOptions}
                                            value={typeof field.value === "string" ? field.value : (field.value ? String(field.value) : "")}
                                            onSelect={(val) => field.onChange(val)}
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
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expense Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} value={field.value || ""} />
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
                    <Button form="expense-form" type="submit">
                        Save changes
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default ExpenseMutateDrawer
