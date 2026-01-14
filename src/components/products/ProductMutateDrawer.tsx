import { useEffect } from "react"
import type z from "zod"
import { useForm } from "react-hook-form"
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
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { ProductMutateDrawerProps, ProductFormInterface } from "@/interface/productInterface"
import { productFormSchema } from "@/schema/productFormSchema"
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProduct"

type ProductFormSchema = z.infer<typeof productFormSchema>

const ProductMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}: ProductMutateDrawerProps) => {
  const isUpdate = !!currentRow

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      details: "",
      price: 0,
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name || "",
        details: currentRow.details || "",
        price: Number(currentRow.price) || 0,
      })
    } else {
      form.reset({
        name: "",
        details: "",
        price: 0,
      })
    }
  }, [currentRow, form])

  const {
    formState: { isDirty },
  } = form

  const onSubmit: SubmitHandler<ProductFormSchema> = (data) => {
    if (isUpdate && !isDirty) {
      toast.info("No changes detected. Please modify something before saving.")
      return
    }

    const normalizedData: ProductFormInterface = {
      name: data.name.trim(),
      details: data.details.trim(),
      price: data.price,
    }

    if (isUpdate && currentRow?.id) {
      updateMutation.mutate(
        { id: currentRow.id, data: normalizedData },
        {
          onSuccess: () => {
            onOpenChange(false)
            onSave?.(normalizedData)
            form.reset()
            toast.success("Product updated successfully.")
          },
          onError: (err: unknown) => {
            const error = err as AxiosError<{ message: string }>
            toast.error(error?.response?.data?.message || "Update failed")
          },
        }
      )
    } else {
      createMutation.mutate(normalizedData, {
        onSuccess: () => {
          onOpenChange(false)
          onSave?.(normalizedData)
          form.reset()
          toast.success("Product created successfully.")
        },
        onError: (err: unknown) => {
          const error = err as AxiosError<{ message: string }>
          toast.error(error?.response?.data?.message || "Creation failed")
        },
      })
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (currentRow) {
          form.reset({
            name: currentRow.name || "",
            details: currentRow.details || "",
            price: Number(currentRow.price) || 0,
          })
        } else {
          form.reset({
            name: "",
            details: "",
            price: 0,
          })
        }
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Product</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Update the product by providing necessary info."
              : "Add a new product by providing necessary info."}{" "}
            Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="product-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Product name" />
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
                    <Textarea {...field} placeholder="Product details" rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="0" 
                      min="0"
                      step="0.01"
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
          <Button form="product-form" type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default ProductMutateDrawer
