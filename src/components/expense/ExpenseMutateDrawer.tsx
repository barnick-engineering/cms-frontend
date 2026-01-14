import { useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { useCreateExpense, useUpdateExpense } from "@/hooks/useExpense"
import { useShopStore } from "@/stores/shopStore"
import type { ExpenseFormInterface } from "@/interface/expenseInterface"
import { expenseFormSchema, type ExpenseFormType } from "@/schema/expenseFormSchema"
import { expenseTypes } from "@/constance/expenseConstance"

interface ExpenseMutateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: ExpenseFormInterface & { id?: string }
    onSave?: (data: ExpenseFormInterface) => void
}

const ExpenseMutateDrawer = ({
    open,
    onOpenChange,
    currentRow,
    onSave,
}: ExpenseMutateDrawerProps) => {
    const shopId = useShopStore((s) => s.currentShopId)
    const isUpdate = !!currentRow?.id

    const createMutation = useCreateExpense(shopId || "")
    const updateMutation = useUpdateExpense(shopId || "")

    // Using ExpenseFormType inferred from schema
    const form = useForm<ExpenseFormType>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: {
            title: "",
            type: "DAILY_EXPENSE",
            amount: 0,
            remarks: "",
            shopId: shopId || "",
        },
    })

    useEffect(() => {
        if (open) {
            form.reset(
                currentRow ?? {
                    title: "",
                    type: "DAILY_EXPENSE",
                    amount: 0,
                    remarks: "",
                    shopId: shopId || "",
                }
            )
        }
    }, [currentRow, open, form, shopId])

    // isDirty is to check any field change or not
    const {
        formState: { isDirty },
    } = form

    const onSubmit: SubmitHandler<ExpenseFormType> = (data) => {
        if (!shopId) return toast.error("Shop ID not found!")

        // prevent api call if no input field changed
        if (isUpdate && !isDirty) {
            toast.info("No changes detected. Please modify something before saving.")
            return
        }

        const payload: ExpenseFormInterface = {
            ...data,
            title: data.title.trim(),
            remarks: data.remarks?.trim() || "",
            amount: data.amount, // amount is already a number from form input
            shopId,
        }

        if (isUpdate && currentRow?.id) {
            // destructure to exclude 'id' from the request body for the PUT request.
            const { id, ...updateData } = payload

            updateMutation.mutate(
                { id: currentRow.id, data: updateData },
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
                    <SheetTitle>{isUpdate ? "Update" : "Create"} Expense</SheetTitle>
                    <SheetDescription>
                        {isUpdate
                            ? "Update the expense by providing necessary info."
                            : "Add a new expense by providing necessary info."}{" "}
                        Click save when you're done.
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
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Expense title" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expense Type</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {expenseTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                                inputMode="decimal"
                                                step="any"
                                                min="0"
                                                placeholder="0.00"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    field.onChange(val === '' ? '' : Number(val))
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Remarks" />
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