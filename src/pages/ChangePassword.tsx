import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUser } from "@/hooks/useUser"
import type { ChangePasswordFormValues } from "@/schema/changePasswordSchema"
import { changePasswordSchema } from "@/schema/changePasswordSchema"
import { signInUser } from "@/api/userAuthApi"
import { useChangePassword } from "@/hooks/useAuth"

const ChangePassword = () => {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  })

  const { mutate: handleChangePassword, isPending } = useChangePassword()
  const { data: currentUser } = useUser() // fetch current user
  const navigate = useNavigate()
  const [userPhone, setUserPhone] = useState<string>("")

  // set the phone from current user once loaded
  useEffect(() => {
    if (currentUser?.phone) {
      setUserPhone(currentUser.phone)
    }
  }, [currentUser])

  const onSubmit = (data: ChangePasswordFormValues) => {
    if (!userPhone) {
      toast.error("Unable to retrieve user phone for auto login.")
      return
    }

    // prevent using the old password as the new one
    if (data.oldPassword === data.newPassword) {
      toast.error("New password cannot be the same as the old password.")
      return
    }

    handleChangePassword(data, {
      onSuccess: async () => {
        try {
          // auto sign in using phone and new password
          await signInUser({
            phone: userPhone,
            password: data.newPassword,
          })

          toast.success("Password changed successfully!")
          form.reset()
          navigate("/dashboard")
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to sign in. Please try again."
          toast.error(errorMessage)
        }
      },
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update password. Please try again."
        toast.error(errorMessage)
      },
    })
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">
            Change Password
          </CardTitle>
          <CardDescription>
            Enter your current password and set a new one.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Old Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter old password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="mt-2" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Updating...
                  </>
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter>
          <p className="text-muted-foreground mx-auto text-center text-sm">
            <Link
              to="/sign-in"
              className="hover:text-primary underline underline-offset-4"
            >
              Back to Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ChangePassword