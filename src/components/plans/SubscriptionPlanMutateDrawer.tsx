import { useState } from "react"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useCreateSubscriptionPlan } from "@/hooks/usePlans"
import type { CreateSubscriptionPlanDto } from "@/interface/subscriptionInterface"
import { subscriptionFormSchema } from "@/schema/subscriptionFormSchema"
// import { toast } from "sonner"

type SubscriptionPlanForm = z.infer<typeof subscriptionFormSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const SubscriptionPlanMutateDrawer = ({ open, onOpenChange }: Props) => {
    const [loading, setLoading] = useState(false)

    const form = useForm<SubscriptionPlanForm>({
        resolver: zodResolver(subscriptionFormSchema),
        defaultValues: {
            name: "",
            price: 0,
            totalTransactions: 0,
            dashboardAccess: false,
            description: "",
        },
    })

    const { mutate: createPlan } = useCreateSubscriptionPlan()

    const onSubmit = (data: SubscriptionPlanForm) => {
        setLoading(true)

        // ensure description is always a string
        const payload: CreateSubscriptionPlanDto = {
            ...data,
            description: data.description || "",
        }

        createPlan(payload, {
            onSuccess: () => {
                setLoading(false)
                onOpenChange(false)
                form.reset()
            },
            onError: () => setLoading(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col px-2">
                <SheetHeader>
                    <SheetTitle> Create Subscription Plan</SheetTitle>
                    <SheetDescription>Add a new subscription plan.</SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form
                        id="subscription-plan-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 space-y-5 overflow-y-auto px-1"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plan Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Plan name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Plan description" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center gap-2">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="0.00"
                                                min={0}
                                                step="0.01"
                                                value={field.value ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    field.onChange(value === '' ? null : parseFloat(value))
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="totalTransactions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Transactions</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    field.onChange(value === '' ? null : Number(value))
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
                            name="dashboardAccess"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <FormLabel className="mb-0">Dashboard Access</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <SheetFooter className="gap-2">
                    <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </SheetClose>
                    <Button
                        type="submit"
                        form="subscription-plan-form"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Plan"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default SubscriptionPlanMutateDrawer