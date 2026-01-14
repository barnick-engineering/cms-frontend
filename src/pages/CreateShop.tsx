import { Button } from "@/components/ui/button"
import type z from "zod"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useCreateShop } from "@/hooks/useShop"
import { createShopFormSchema } from "@/schema/createShopFormSchema"
import AuthLayout from "@/components/layout/AuthLayout"

type FormValues = z.infer<typeof createShopFormSchema>

const CreateShop = ({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(createShopFormSchema),
        defaultValues: { name: "", address: "" },
    })

    const { mutate, isPending } = useCreateShop()

    const onSubmit = (data: FormValues) => {
        if (isPending) return
        mutate(data)
    }

    return (
        <AuthLayout>
            <div className="max-w-md mx-auto mt-10">
                <Card className="gap-4">
                    <CardHeader>
                        <CardTitle className="text-lg tracking-tight">Create Shop</CardTitle>
                        <CardDescription>
                            Enter your shop name below to <br />
                            create your shop
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className={cn("grid gap-3", className)}
                                {...props}
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shop Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Barnick Procharoni" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shop Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Shyamoli,Dhaka" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="mt-2" disabled={isPending}>
                                    {isPending ? "Creating..." : "Create Shop"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter>
                        <p className="text-muted-foreground px-8 text-center text-sm">
                            By clicking create shop, you agree to our{" "}
                            <a href="/terms" className="hover:text-primary underline underline-offset-4">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="/privacy" className="hover:text-primary underline underline-offset-4">
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </AuthLayout>
    )
}

export default CreateShop