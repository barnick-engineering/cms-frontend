import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import PasswordInput from '@/components/password-input'
import { toast } from 'sonner'
// AxiosError removed - user management endpoints no longer exist
import { SelectDropdown } from '@/components/select-dropdown'
// useCreateUser and useUserRoles removed - user management endpoints no longer exist
import { useShopStore } from '@/stores/shopStore'
import { userFormSchema, type UserForm } from '@/schema/userFormSchema'
import  type{ UserListItem } from '@/interface/userInterface'

type UserActionDialogProps = {
    currentRow?: UserListItem
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
    currentRow,
    open,
    onOpenChange,
}: UserActionDialogProps) {

    const isEdit = !!currentRow
    const shopId = useShopStore((s) => s.currentShopId)
    // User management hooks removed - user management endpoints no longer exist
    const roles: { id: string; name: string }[] = []
    const isRolesLoading = false
    const isPending = false


    const form = useForm<UserForm>({
        resolver: zodResolver(userFormSchema),
        defaultValues: isEdit
            ? {
                ...currentRow,
                password: '',
                confirmPassword: '',
                isEdit,
            }
            : {
                username: '',
                role: '',
                phoneNumber: '',
                password: '',
                confirmPassword: '',
                isEdit,
            },
    })

    const onSubmit = (_values: UserForm) => {
        if (!shopId) return
        // User creation removed - user management endpoints no longer exist
        toast.error("User management has been removed")
        form.reset()
        onOpenChange(false)
    }

    const isPasswordTouched = !!form.formState.dirtyFields.password

    return (
        <Dialog
            open={open}
            onOpenChange={(state) => {
                form.reset()
                onOpenChange(state)
            }}
        >
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader className='text-start'>
                    <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the user here. ' : 'Create new user here. '}
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
                    <Form {...form}>
                        <form
                            id='user-form'
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='space-y-4 px-0.5'
                        >
                            <FormField
                                control={form.control}
                                name='username'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Username
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='john_doe'
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='phoneNumber'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Phone Number
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='+123456789'
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='role'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Role</FormLabel>
                                        <FormControl>
                                            {isRolesLoading ? (
                                                <p className="col-span-4 text-sm text-muted-foreground">
                                                    Loading roles...
                                                </p>
                                            ) : (
                                                <SelectDropdown
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder="Select a role"
                                                    className="col-span-4"
                                                    items={
                                                        roles?.map((r: { name: string; id: string }) => ({
                                                            label: r.name,
                                                            value: r.id,
                                                        })) ?? []
                                                    }
                                                />
                                            )}
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Password
                                        </FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                placeholder='e.g., S3cur3P@ssw0rd'
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='confirmPassword'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            Confirm Password
                                        </FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                disabled={!isPasswordTouched}
                                                placeholder='e.g., S3cur3P@ssw0rd'
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <DialogFooter>
                    <Button type="submit" form="user-form" disabled={isPending}>
                        {isPending ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}