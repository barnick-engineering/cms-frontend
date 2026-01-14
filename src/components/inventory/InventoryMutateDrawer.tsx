import { useEffect } from "react"
import type { z } from "zod"
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
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { useCreateInventory, useUpdateInventory } from "@/hooks/useInventory"
import { useShopStore } from "@/stores/shopStore"
import { inventoryFormSchema } from "@/schema/inventoryFormSchema"
import type { InventoryMutateDrawerProps } from "@/interface/inventoryInterface"

// Combine the Zod schema type with the required unitOfMeasurementId
type InventoryFormType = z.infer<typeof inventoryFormSchema>

const InventoryMutateDrawer = ({
  open,
  onOpenChange,
  currentRow, // currentRow is now typed as InventoryItemInterface
  onSave,
}: InventoryMutateDrawerProps) => {
  const shopId = useShopStore((s) => s.currentShopId)
  const isUpdate = !!currentRow?.id

  const createMutation = useCreateInventory(shopId || "")
  const updateMutation = useUpdateInventory(shopId || "")

  const form = useForm<InventoryFormType>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      lastPrice: 0,
    },
  })

  useEffect(() => {
    if (open) {
      const emptyState: InventoryFormType = {
        name: "",
        description: "",
        quantity: 0,
        lastPrice: 0,
      }

      let defaults = emptyState

      if (currentRow) {
        defaults = {
          name: currentRow.name,
          description: currentRow.description ?? '',
          quantity: currentRow.quantity ?? 0,
          lastPrice: currentRow.lastPrice ?? 0,
        }
      }

      form.reset(defaults)
    }
  }, [currentRow, open, form])

  // isDirty is to check any field change or not
  const {
    formState: { isDirty },
  } = form

  const onSubmit: SubmitHandler<InventoryFormType> = (data) => {
    if (!shopId) return toast.error("Shop ID not found!")

    // prevent api call if no input field changed
    if (isUpdate && !isDirty) {
      toast.info("No changes detected. Please modify something before saving.")
      return
    }

    const payload = {
      ...data,
      name: data.name.trim(),
      description: data.description?.trim() || "",
      quantity: Number(data.quantity),
      lastPrice: Number(data.lastPrice),
      shopId,
    }

    if (isUpdate && currentRow?.id) {
      updateMutation.mutate(
        { id: currentRow.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Inventory updated successfully.")
            onOpenChange(false)
            onSave?.(payload)
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
          toast.success("Inventory created successfully.")
          onSave?.(payload)
          form.reset({
            name: "",
            description: "",
            quantity: 0,
            lastPrice: 0,
          })
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
        if (!v) {
          // Reset on close
          form.reset({
            name: "",
            description: "",
            quantity: 0,
            lastPrice: 0,
          })
        }
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Inventory</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Update the inventory by providing necessary info."
              : "Add a new inventory by providing necessary info."}{" "}
            Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="inventory-form"
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
                    <Input {...field} placeholder="Inventory name" />
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
                    <Input {...field} placeholder="Inventory description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        min={0}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="lastPrice"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Last Price</FormLabel>
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
                        }
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button
            form="inventory-form"
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default InventoryMutateDrawer