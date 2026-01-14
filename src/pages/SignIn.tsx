import SignInForm from '@/components/signIn/SignInForm'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import AuthLayout from '@/components/layout/AuthLayout'

const SignIn = () => {
    return (
        <AuthLayout>
            <Card className='gap-4'>
                <CardHeader>
                    <CardTitle className='text-lg tracking-tight'>Login</CardTitle>
                    <CardDescription>
                        Enter your email and password below to
                        log into your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignInForm />
                </CardContent>
            </Card>
        </AuthLayout>
    )
}

export default SignIn  