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
import { TRANSACTION_TYPES } from '@/constance/transactionConstances'

interface TransactionTypeFieldProps {
    form: UseFormReturn<TransactionFormValues>
    onTransactionTypeChange: (value: string) => void
}

export const TransactionTypeField = ({
    form,
    onTransactionTypeChange,
}: TransactionTypeFieldProps) => {
    return (
        <FormField
            control={form.control}
            name='transactionType'
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <FormControl>
                        <Combobox
                            options={TRANSACTION_TYPES}
                            placeholder='Select transaction type...'
                            className='w-full'
                            value={field.value}
                            onSelect={(val) => {
                                field.onChange(val)
                                onTransactionTypeChange(val)
                            }}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}