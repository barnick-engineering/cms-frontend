import { useEffect, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import type { ShopDrawerProps } from "@/interface/shopInterface"
import { useCreateShop, useUpdateShop } from "@/hooks/useShop"

const formSchema = z.object({
    name: z.string().min(1, "Shop name is required."),
    address: z.string().optional(),
})

type ShopForm = z.infer<typeof formSchema>

const ShopDrawer = ({ open, onOpenChange, currentShop }: ShopDrawerProps) => {
    const isEdit = !!currentShop
    const [loading, setLoading] = useState(false)

    const form = useForm<ShopForm>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", address: "" },
    })

    const { mutate: createMutate } = useCreateShop()
    const { mutate: updateMutate } = useUpdateShop()

    // reset form whenever currentShop changes
    useEffect(() => {
        form.reset({
            name: currentShop?.shopName || "",
            address: currentShop?.shopAddress || "",
        })
    }, [currentShop, form])

    const onSubmit = (data: ShopForm) => {
        if (isEdit && currentShop?.shopId) {
            // update address on edit
            updateMutate({ id: currentShop.shopId, address: data.address }, {
                onSuccess: () => {
                    setLoading(false)
                    form.reset()
                    onOpenChange(false)
                }
            })
        } else {
            // create shop
            createMutate(data, {
                onSuccess: () => {
                    setLoading(false)
                    form.reset()
                    onOpenChange(false)
                }
            })
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader className="text-start">
                    <SheetTitle>{isEdit ? "Edit Shop" : "Create Shop"}</SheetTitle>
                    <SheetDescription>
                        {isEdit
                            ? "Update the shop address below."
                            : "Add a new shop by providing the necessary details."}
                        Click save when you're done.
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form
                        id="shop-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 space-y-6 overflow-y-auto px-4"
                    >
                        {/* Shop Name Field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shop Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Barnick Pracharani"
                                            disabled={isEdit}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Address Field */}
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="2/ka pc culture housing, shalymoli, dhaka"
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
                        type="submit"
                        form="shop-form"
                        disabled={loading}
                    >
                        {
                            loading ? (isEdit ? "Updating..." : "Creating...")
                                : isEdit ? "Update Address" : "Create Shop"
                        }
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default ShopDrawer