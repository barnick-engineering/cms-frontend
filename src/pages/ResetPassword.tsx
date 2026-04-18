import { Link, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import AuthLayout from '@/components/layout/AuthLayout'
import PasswordInput from '@/components/password-input'
import { useResetPassword } from '@/hooks/useAuth'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/schema/resetPasswordSchema'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid') ?? ''
  const token = searchParams.get('token') ?? ''

  const { mutate: resetPwd, isPending } = useResetPassword()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  })

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!uid || !token) return
    resetPwd({
      uid,
      token,
      new_password: data.new_password,
      confirm_password: data.confirm_password,
    })
  }

  const missingLink = !uid || !token

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Set new password</CardTitle>
          <CardDescription>
            Choose a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {missingLink ? (
            <div className='space-y-4 text-center'>
              <p className='text-muted-foreground text-sm'>
                This link is missing required parameters. Open the reset link from your email,
                or request a new one.
              </p>
              <Button asChild variant='outline'>
                <Link to='/forgot-password'>Request reset email</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-3' noValidate>
                <FormField
                  control={form.control}
                  name='new_password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder='********'
                          autoComplete='new-password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirm_password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder='********'
                          autoComplete='new-password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='mt-2' disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Saving…
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
                <p className='text-muted-foreground text-center text-sm'>
                  <Link
                    to='/sign-in'
                    className='text-primary font-medium underline underline-offset-4'
                  >
                    Back to sign in
                  </Link>
                </p>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

export default ResetPassword
