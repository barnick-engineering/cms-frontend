import type { UseFormReturn } from 'react-hook-form'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Combobox } from '@/components/ui/combobox'
import type { BusinessEntityType } from '@/constance/transactionConstances'
import type { ComboboxOptionInterface } from '@/interface/transactionInterface'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import { createBusinessEntityOptions, getEntityLabel, getEntityPlaceholder } from './utils/transactionHelpers'

interface PartnerSelectionFieldsProps {
    form: UseFormReturn<TransactionFormValues>
    transactionType: string
    selectedBusinessEntity: BusinessEntityType | null
    entityOptions: ComboboxOptionInterface[]
    isLoading: boolean
    onBusinessEntitySelect: (value: string) => void
    onEntitySearch: (query: string) => void
    showPartnerTypeSelector: boolean
}

export const PartnerSelectionFields = ({
    form,
    transactionType,
    selectedBusinessEntity,
    entityOptions,
    isLoading,
    onBusinessEntitySelect,
    onEntitySearch,
    showPartnerTypeSelector,
}: PartnerSelectionFieldsProps) => {
    if (!transactionType) return null

    return (
        <div className='flex items-end gap-4'>
            {showPartnerTypeSelector && (
                <FormField
                    control={form.control}
                    name='partnerType'
                    render={({ field }) => (
                        <FormItem className='flex-1'>
                            <FormLabel>Partner Type</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={createBusinessEntityOptions()}
                                    placeholder='Select partner type...'
                                    className='w-full'
                                    value={field.value}
                                    onSelect={(val) => {
                                        field.onChange(val)
                                        onBusinessEntitySelect(val)
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {selectedBusinessEntity && (
                <FormField
                    control={form.control}
                    name='entityTypeId'
                    render={({ field }) => (
                        <FormItem className='flex-1'>
                            <FormLabel>{getEntityLabel(selectedBusinessEntity)}</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={entityOptions}
                                    placeholder={getEntityPlaceholder(selectedBusinessEntity)}
                                    className='w-full'
                                    value={field.value}
                                    onSelect={field.onChange}
                                    onSearch={onEntitySearch}
                                    loading={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    )
}