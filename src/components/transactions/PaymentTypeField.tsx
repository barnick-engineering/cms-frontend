import type { UseFormReturn } from 'react-hook-form'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Combobox } from '@/components/ui/combobox'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import { PAYMENT_TYPES } from '@/constance/transactionConstances'

interface PaymentTypeFieldProps {
    form: UseFormReturn<TransactionFormValues>
}

export const PaymentTypeField = ({ form }: PaymentTypeFieldProps) => {
    return (
        <FormField
            control={form.control}
            name='paymentType'
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <FormControl>
                        <Combobox
                            options={PAYMENT_TYPES}
                            placeholder='Select payment type...'
                            className='w-full'
                            value={field.value}
                            onSelect={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}