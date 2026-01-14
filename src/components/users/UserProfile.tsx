import ContentSection from '@/features/settings/components/content-section'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { useUser } from '@/hooks/useUser'
import { Main } from '../layout/main'

const UserProfile = () => {
    const { data: user } = useUser()

    if (!user) {
        return (
            <ContentSection
                title='User Profile'
                desc='View the details of your account and associated shops.'
            >
                <div className='text-muted-foreground'>Loading user data...</div>
            </ContentSection>
        )
    }

    return (
        <Main>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">User Profile</h2>
                <p className="text-muted-foreground">
                    View the details of your account and associated shops                    </p>
            </div>
            <div className='space-y-6 mt-5'>
                {/* Basic Info */}
                <div className='space-y-2'>
                    <div className='text-lg font-medium'>{user.name}</div>
                    <div className='text-sm text-muted-foreground'>Phone: {user.phone}</div>
                    <div className='text-sm text-muted-foreground'>
                        Created At: {format(new Date(user.createdAt), 'PPpp')}
                    </div>
                </div>

                <Separator />

                {/* Shop Roles */}
                <div className='space-y-2'>
                    <div className='text-lg font-medium'>Shop Roles</div>
                    {user.shopWiseUserRoles?.length === 0 ? (
                        <div className='text-sm text-muted-foreground'>No shops assigned</div>
                    ) : (
                        user.shopWiseUserRoles.map((shopRole) => (
                            <div
                                key={shopRole.id}
                                className='p-4 border rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center'
                            >
                                <div>
                                    <div className='font-medium'>{shopRole.shop?.name || 'No shop assigned'}</div>
                                    <div className='text-sm text-muted-foreground'>
                                        Role: {shopRole.role.name.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Main>
    )
}

export default UserProfile