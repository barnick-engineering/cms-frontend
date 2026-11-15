import { useState } from 'react'
import type { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2 } from 'lucide-react'
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
        className={cn('grid gap-4', className)} 
        {...props}>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  autoComplete='email'
                  placeholder='you@barnickpracharani.com'
                  className='bg-card h-11'
                  {...field}
                />
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
                <PasswordInput
                  autoComplete='current-password'
                  placeholder='Enter your password'
                  inputClassName='bg-card h-11 text-base md:text-sm pe-10'
                  {...field}
                />
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

        <Button
          type='submit'
          className='hover:bg-primary-hover group mt-3 h-11 text-sm font-semibold tracking-wide'
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='animate-spin' />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className='transition-transform group-hover:translate-x-0.5' />
            </>
          )}
        </Button>
        {/* Registration link disabled on this branch
        <p className='text-muted-foreground text-center text-sm'>
          Don&apos;t have an account?{' '}
          <Link
            to='/register'
            className='text-primary font-medium underline underline-offset-4'
          >
            Register
          </Link>
        </p>
        */}
      </form>
    </Form>
  )
}

export default SignInForm