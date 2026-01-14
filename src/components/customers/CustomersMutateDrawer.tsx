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
import { toast } from "sonner"
import { Checkbox } from "../ui/checkbox"
import type { AxiosError } from "axios"
import type { CustomerMutateDrawerProps, CustomerFormInterface } from "@/interface/customerInterface"
import { customerFormSchema } from "@/schema/customerFormSchema"
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomer"

type CustomerFormSchema = z.infer<typeof customerFormSchema>

const CustomersMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}: CustomerMutateDrawerProps) => {
  const isUpdate = !!currentRow

  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()

  const form = useForm<CustomerFormSchema>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      contact_person_name: "",
      contact_person_phone: "",
      is_company: false,
      remarks: "",
    },
  })

  // form reset
  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name || "",
        email: currentRow.email || "",
        phone: currentRow.phone || "",
        address: currentRow.address || "",
        contact_person_name: currentRow.contact_person_name || "",
        contact_person_phone: currentRow.contact_person_phone || "",
        is_company: currentRow.is_company || false,
        remarks: currentRow.remarks || "",
      })
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        contact_person_name: "",
        contact_person_phone: "",
        is_company: false,
        remarks: "",
      })
    }
  }, [currentRow, form])

  // track is_company
  const isCheckedIsCompany = form.watch("is_company")

  // isDirty is to check any field change or not
  const {
    formState: { isDirty },
  } = form

  //  submit data
  const onSubmit: SubmitHandler<CustomerFormSchema> = (data) => {
    // prevent api call if no input field changed
    if (isUpdate && !isDirty) {
      toast.info("No changes detected. Please modify something before saving.")
      return
    }

    const normalizedData: CustomerFormInterface = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || "",
      address: data.address.trim(),
      contact_person_name: data.contact_person_name?.trim() || "",
      contact_person_phone: data.contact_person_phone?.trim() || "",
      is_company: data.is_company ?? false,
      remarks: data.remarks?.trim() || null,
    }

    if (isUpdate && currentRow?.id) {
      updateMutation.mutate(
        { id: currentRow.id, data: normalizedData },
        {
          onSuccess: () => {
            onOpenChange(false)
            onSave?.(normalizedData)
            form.reset()
            toast.success("Customer updated successfully.")
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
          toast.success("Customer created successfully.")
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
            email: currentRow.email || "",
            phone: currentRow.phone || "",
            address: currentRow.address || "",
            contact_person_name: currentRow.contact_person_name || "",
            contact_person_phone: currentRow.contact_person_phone || "",
            is_company: currentRow.is_company || false,
            remarks: currentRow.remarks || "",
          })
        } else {
          form.reset({
            name: "",
            email: "",
            phone: "",
            address: "",
            contact_person_name: "",
            contact_person_phone: "",
            is_company: false,
            remarks: "",
          })
        }
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Customer</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Update the customer by providing necessary info."
              : "Add a new customer by providing necessary info."}{" "}
            Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="customer-form"
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
                    <Input {...field} placeholder="Rahul Roy" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="rahul@gmail.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="01711111111" />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Shyamoli, Dhaka" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_company"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  </FormControl>
                  <FormLabel className="m-0">Is Company</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {
              isCheckedIsCompany && (
                <>
                  <FormField
                    control={form.control}
                    name="contact_person_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="Mr. Karim Mia" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_person_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="+880199334322" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )
            }

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Additional notes..." />
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
          <Button form="customer-form" type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default CustomersMutateDrawer