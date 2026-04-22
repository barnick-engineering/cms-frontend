import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import PasswordInput from '@/components/password-input'
import { useCreateUser } from '@/hooks/useCreateUser'
import { addUserSchema, type AddUserFormValues } from '@/schema/addUserSchema'
import {
  fieldErrorsFromAxiosError,
  messageFromAxiosError,
} from '@/lib/barnickApiError'
import type { UseFormSetError } from 'react-hook-form'

const FIELD_KEYS = [
  'email',
  'password',
  'confirm_password',
  'first_name',
  'last_name',
] as const satisfies readonly (keyof AddUserFormValues)[]

function applyApiFieldErrors(
  setError: UseFormSetError<AddUserFormValues>,
  fields: Record<string, string[]> | null
) {
  if (!fields) return
  for (const key of FIELD_KEYS) {
    const msgs = fields[key]
    if (msgs?.length) {
      setError(key, { message: msgs[0] })
    }
  }
}

const OOB_PASSWORD_REMINDER =
  'The password is not sent by email or shown again. Share it with the new user in person, by phone, or another secure channel outside this app.'

const defaultValues: AddUserFormValues = {
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  confirm_password: '',
}

type AddUserDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AddUserDrawer = ({ open, onOpenChange }: AddUserDrawerProps) => {
  const [bannerError, setBannerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const createUserMutation = useCreateUser()

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(defaultValues)
      setBannerError(null)
      setSuccessMessage(null)
    }
  }, [open, form])

  const onSubmit = (data: AddUserFormValues) => {
    setBannerError(null)
    setSuccessMessage(null)
    createUserMutation.mutate(
      {
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
        first_name: data.first_name?.trim() || undefined,
        last_name: data.last_name?.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          form.reset(defaultValues)
          setSuccessMessage(
            res.response_message ||
              'User created successfully. Share the password with the new user outside this application.'
          )
        },
        onError: (err) => {
          const fieldErrs = fieldErrorsFromAxiosError(err)
          if (fieldErrs) {
            applyApiFieldErrors(form.setError, fieldErrs)
            setBannerError(null)
          } else {
            setBannerError(messageFromAxiosError(err))
          }
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="text-start">
          <SheetTitle>Add team member</SheetTitle>
          <SheetDescription>
            Create a login for a new user. Set their initial password here; it
            is not returned by the server after saving. Required: email and
            password. Name fields are optional.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {successMessage && (
            <Alert className="border-green-600/30 bg-green-50 text-green-950 shrink-0 dark:bg-green-950/30 dark:text-green-50">
              <CheckCircle2 className="text-green-600 dark:text-green-400" />
              <AlertTitle>User created</AlertTitle>
              <AlertDescription className="text-inherit space-y-2">
                <p>{successMessage}</p>
                <p className="font-medium">{OOB_PASSWORD_REMINDER}</p>
              </AlertDescription>
            </Alert>
          )}

          {bannerError && (
            <Alert variant="destructive" className="shrink-0">
              <AlertTitle>Could not create user</AlertTitle>
              <AlertDescription>{bannerError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              id="add-user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 space-y-4 overflow-y-auto px-1"
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="off"
                        placeholder="colleague@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name (optional)</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        placeholder="First name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name (optional)</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        placeholder="Last name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        autoComplete="new-password"
                        placeholder="Initial password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <SheetFooter className="gap-2 sm:justify-between">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button
            form="add-user-form"
            type="submit"
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? 'Creating…' : 'Create user'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default AddUserDrawer
