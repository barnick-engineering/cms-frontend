import type { UseFormReturn, FieldArrayWithId } from 'react-hook-form'
import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import type { ComboboxOptionInterface } from '@/interface/transactionInterface'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import type { InventoryItem } from '@/interface/inventoryInterface'
import { Tooltip, TooltipContent, TooltipProvider } from '../ui/tooltip'
import { TooltipTrigger } from '@radix-ui/react-tooltip'

interface InventoryRowProps {
    form: UseFormReturn<TransactionFormValues>
    field: FieldArrayWithId<TransactionFormValues, 'inventories', 'id'>
    index: number
    currentInputValue: string
    itemDisplayData: { lastPrice: number | null; stockQuantity: number | null; description: string | null } | undefined
    filteredInventoryOptions: ComboboxOptionInterface[]
    inventoryOptions: ComboboxOptionInterface[]
    inventoryList: InventoryItem[]
    isInventoryLoading: boolean
    transactionType: string
    isAlreadyUsed: (value: string) => boolean
    onInventorySelect: (val: string, index: number) => void
    onInventorySearch: (query: string, index: number) => void
    onAppend: () => void
    onRemove: (index: number) => void
    showRemoveButton: boolean
    isExistingInventory: boolean
}

export const InventoryRow = ({
    form,
    field,
    index,
    currentInputValue,
    itemDisplayData,
    filteredInventoryOptions,
    inventoryOptions,
    isInventoryLoading,
    transactionType,
    isAlreadyUsed,
    onInventorySelect,
    onInventorySearch,
    onAppend,
    onRemove,
    showRemoveButton,
    isExistingInventory,
}: InventoryRowProps) => {

    const stock = itemDisplayData?.stockQuantity
    const isOverStock = transactionType === 'SALE' &&
        stock !== null &&
        stock !== undefined &&
        (form.watch(`inventories.${index}.quantity`) > stock)

    return (
        <div>
            <div key={field.id} className='flex items-end justify-between gap-4'>
                <div className="flex flex-1 gap-3">
                    {/* Inventory */}
                    <FormField
                        control={form.control}
                        name={`inventories.${index}.inventoryId`}
                        render={({ field: _field }) => (
                            <FormItem className='w-36 sm:w-48 md:w-48'>
                                <FormLabel>Inventory</FormLabel>
                                <FormControl>
                                    <Combobox
                                        options={filteredInventoryOptions}
                                        className='w-full'
                                        placeholder='Select inventory...'
                                        value={currentInputValue}
                                        onSelect={(val) => {
                                            // Check if this is a real selection from options
                                            const selectedOption = inventoryOptions.find(
                                                (opt) => opt.value === val
                                            )

                                            // Only process if it's a real option selection (from dropdown)
                                            // When allowCustomValue is true, onSelect is also called during typing,
                                            // but those are handled by onSearch. We only process explicit selections here.
                                            if (selectedOption) {
                                                const nameToCheck = selectedOption.label

                                                if (isAlreadyUsed(nameToCheck)) {
                                                    toast.warning(
                                                        'This inventory is already selected in another row'
                                                    )
                                                    return
                                                }

                                                onInventorySelect(val, index)
                                            }
                                            // If selectedOption is undefined, it's either:
                                            // 1. A custom typed value (handled by onSearch)
                                            // 2. A custom value clicked from "Create" option (also handled by onSearch via typing)
                                            // So we ignore it here to avoid conflicts
                                        }}
                                        onSearch={(query) => {
                                            if (transactionType !== 'PURCHASE') {
                                                return
                                            }

                                            if (isAlreadyUsed(query)) {
                                                toast.warning(
                                                    'This inventory name is already used in another row'
                                                )
                                                return
                                            }

                                            onInventorySearch(query, index)
                                        }}
                                        loading={isInventoryLoading}
                                        allowCustomValue={
                                            transactionType === 'PURCHASE' &&
                                            !isAlreadyUsed(currentInputValue)
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <div className='flex flex-1 items-end gap-4'>
                    {/* quantity */}
                    <FormField
                        control={form.control}
                        name={`inventories.${index}.quantity`}
                        render={({ field }) => (
                            <FormItem className='flex-1'>
                                <div className='flex flex-col'>
                                    <FormLabel>Quantity</FormLabel>
                                    {itemDisplayData?.stockQuantity !== undefined &&
                                        itemDisplayData.stockQuantity !== null && (
                                            <p
                                                className={`text-xs mt-1 ${itemDisplayData.stockQuantity <= 5
                                                    ? 'text-amber-600 font-bold'
                                                    : 'text-muted-foreground'
                                                    }`}
                                            >
                                                Stock: {itemDisplayData.stockQuantity}
                                            </p>
                                        )}
                                </div>
                                <FormControl>
                                    <Input
                                        type='number'
                                        {...field}
                                        className={isOverStock ? "border-destructive focus-visible:ring-destructive" : ""}
                                        placeholder='0'
                                        min={0}
                                        value={field.value === 0 ? '' : field.value ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            field.onChange(val === '' ? '' : Number(val))
                                        }}
                                    />
                                </FormControl>
                                {isOverStock && (
                                    <p className="text-[0.8rem] font-medium text-destructive mt-1">
                                        Insufficient stock! Max: {stock}
                                    </p>
                                )}

                                {/* description */}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* unit price */}
                    <FormField
                        control={form.control}
                        name={`inventories.${index}.price`}
                        render={({ field }) => (
                            <FormItem className='flex-1'>
                                <div className='flex flex-col'>
                                    <FormLabel>Unit Price</FormLabel>
                                    {itemDisplayData?.lastPrice !== undefined &&
                                        itemDisplayData.lastPrice !== null && (
                                            <p className='text-xs text-green-700 font-semibold mt-1'>
                                                Last Price: {itemDisplayData.lastPrice.toFixed(2)}
                                            </p>
                                        )}
                                </div>
                                <FormControl>
                                    <Input
                                        type='number'
                                        {...field}
                                        placeholder='0.00'
                                        min={0}
                                        step="0.01"
                                        value={field.value === 0 ? '' : field.value ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            field.onChange(val === '' ? null : parseFloat(val))
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                <div className='flex gap-1'>
                    <Button type='button' variant='outline' size='icon' onClick={onAppend}>
                        <Plus className='h-4 w-4' />
                    </Button>
                    {/* {showRemoveButton && ( */}
                    <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        onClick={() => onRemove(index)}
                    >
                        <Minus className='h-4 w-4' />
                    </Button>
                    {/* )} */}
                </div>
            </div>
            {itemDisplayData?.description && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="inline-flex items-center cursor-help">
                                <span className="text-xs italic truncate max-w-[180px]">
                                    Desc: {itemDisplayData.description}
                                </span>
                            </span>
                        </TooltipTrigger>

                        <TooltipContent className="max-w-xs wrap-break-word">
                            <p className="text-xs italic leading-relaxed">
                                Desc: {itemDisplayData.description}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

        </div>
    )
}