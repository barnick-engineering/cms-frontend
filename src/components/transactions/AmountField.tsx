import type { UseFormReturn } from 'react-hook-form'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'

interface AmountFieldProps {
    form: UseFormReturn<TransactionFormValues>
}

export const AmountField = ({ form }: AmountFieldProps) => {
    return (
        <div className='flex justify-end'>
            <FormField
                control={form.control}
                name='transactionAmount'
                render={({ field }) => (
                    <FormItem className='max-w-52'>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                            <Input
                                type='number'
                                {...field}
                                placeholder='0.00'
                                min={0}
                                value={field.value ?? ''}
                                onChange={(e) =>
                                    field.onChange(
                                        e.target.value ? Number(e.target.value) : null
                                    )
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}