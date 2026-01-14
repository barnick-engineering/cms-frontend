import { useState } from 'react'
import type { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { signInFormSchema } from '@/schema/signInFormSchema'
import PasswordInput from '@/components/password-input'

type FormValues = z.infer<typeof signInFormSchema>

const SignInForm = ({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) => {
  const [isLoading, setIsLoading] = useState(false)
  const { signInMutation } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: FormValues) => {
    setIsLoading(true)
    signInMutation.mutate(
      {
        email: data.email,
        password: data.password
      },
      {
        onSuccess: () => {
          setIsLoading(false)
        },
        onError: () => setIsLoading(false),
      }
    )
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        noValidate
        className={cn('grid gap-3', className)} 
        {...props}>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='example@gmail.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              {/* <Link
                to='#'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link> */}
            </FormItem>
          )}
        />

        <Button type='submit' className='mt-2' disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Form>
  )
}

export default SignInForm