import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import type { UseFormReturn, FieldArrayWithId } from 'react-hook-form'
import type { InventoryItem } from '@/interface/inventoryInterface'
import type { ComboboxOptionInterface } from '@/interface/transactionInterface'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import { InventoryRow } from './InventoryRow'

interface InventoryFieldsProps {
  form: UseFormReturn<TransactionFormValues>
  fields: FieldArrayWithId<TransactionFormValues, 'inventories', 'id'>[]
  append: (value: TransactionFormValues['inventories'][number]) => void
  remove: (index: number) => void
  inventoryOptions: ComboboxOptionInterface[]
  inventoryList: InventoryItem[]
  inventoryInputValues: Record<number, string>
  setInventoryInputValues: Dispatch<SetStateAction<Record<number, string>>>
  inventoryDisplayData: Record<
    number,
    { lastPrice: number | null; stockQuantity: number | null; description: string | null }
  >
  setInventoryDisplayData: Dispatch<
    SetStateAction<
      Record<number, { lastPrice: number | null; stockQuantity: number | null; description: string | null }>
    >
  >
  selectedInventoryOptionsCache: Record<string, ComboboxOptionInterface>
  setSelectedInventoryOptionsCache: Dispatch<
    SetStateAction<Record<string, ComboboxOptionInterface>>
  >
  isInventoryLoading: boolean
  transactionType: string
  onInventorySearch: (query: string) => void
}

export const InventoryFields = ({
  form,
  fields,
  append,
  remove,
  inventoryOptions,
  inventoryList,
  inventoryInputValues,
  setInventoryInputValues,
  inventoryDisplayData,
  setInventoryDisplayData,
  selectedInventoryOptionsCache,
  setSelectedInventoryOptionsCache,
  isInventoryLoading,
  transactionType,
  onInventorySearch,
}: InventoryFieldsProps) => {

  // Update cache when inventoryOptions change and we have selected inventories
  useEffect(() => {
    Object.entries(inventoryInputValues).forEach(([inventoryId]) => {
      // Only update cache for valid inventory IDs (UUIDs), not custom typed values
      if (inventoryId && inventoryId.length > 20) {
        const option = inventoryOptions.find((opt) => opt.value === inventoryId)
        if (option) {
          setSelectedInventoryOptionsCache((prev) => {
            // Only update if not already cached
            if (prev[inventoryId]) return prev
            return {
              ...prev,
              [inventoryId]: option,
            }
          })
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryOptions, inventoryInputValues])

  const handleInventorySelect = (val: string, index: number) => {
    // Check if the value is an existing inventory ID
    // When allowCustomValue is true, onSelect is called even when typing,
    // so we need to distinguish between real selections and typed values
    const selectedInventory = inventoryList.find((item) => item.id === val)

    // Only process if this is a real inventory selection (exists in options)
    // Custom typed values are handled by handleInventorySearch
    if (selectedInventory) { // CHANGED: Check if selectedInventory exists first
      // Store the inventory option in cache so it's always available for display
      const option = inventoryOptions.find((opt) => opt.value === val)
      if (option) {
        setSelectedInventoryOptionsCache((prev) => ({
          ...prev,
          [val]: option,
        }))
      }

      setInventoryDisplayData((prev) => ({
        ...prev,
        [index]: {
          lastPrice: selectedInventory.lastPrice ?? null,
          stockQuantity: selectedInventory.quantity ?? null,
          description: selectedInventory.description ?? null,
        },
      }))

      form.setValue(`inventories.${index}.inventoryId`, val)
      setInventoryInputValues((prev) => ({
        ...prev,
        [index]: val,
      }))


      // reset search
      onInventorySearch('')
    }
    // If val is not found in inventoryList, it's a custom typed value
    // and will be handled by handleInventorySearch, so we ignore it here
  }

  const handleInventorySearch = (query: string, index: number) => {
    // Trigger parent search state
    onInventorySearch(query)

    setInventoryDisplayData((prev) => ({
      ...prev,
      [index]: { lastPrice: null, stockQuantity: null, description: null },
    }))

    form.setValue(`inventories.${index}.inventoryId`, query)
    setInventoryInputValues((prev) => ({
      ...prev,
      [index]: query,
    }))


    // If user typed a completely new inventory name,
    // clear search after a short delay so list refetches full data
    if (!inventoryList.find((i) => i.name.toLowerCase() === query.toLowerCase())) {
      setTimeout(() => onInventorySearch(''), 400)
    }
  }

  const handleAppend = () => {
    append({ inventoryId: '', quantity: 0, price: 0 })
  }

  const handleRemove = (index: number) => {
    const removedInventoryId = inventoryInputValues[index]

    remove(index)
    // Reindex display data
    setInventoryDisplayData((prev) => {
      const newState = { ...prev }
      delete newState[index]
      return Object.keys(newState).reduce(
        (acc, key, _i) => {
          const numKey = Number(key)
          if (numKey > index) {
            acc[numKey - 1] = newState[numKey]
          } else {
            acc[numKey] = newState[numKey]
          }
          return acc
        },
        {} as Record<
          number,
          { lastPrice: number | null; stockQuantity: number | null; description: string | null }
        >
      )
    })
    // Reindex input values
    const newInputValues = Object.keys(inventoryInputValues).reduce(
      (acc, key, _i) => {
        const numKey = Number(key)
        if (numKey > index) {
          acc[numKey - 1] = inventoryInputValues[numKey]
        } else if (numKey !== index) {
          acc[numKey] = inventoryInputValues[numKey]
        }
        return acc
      },
      {} as Record<number, string>
    )
    setInventoryInputValues(newInputValues)


    // Remove from inventory cache if it's no longer used in any row
    if (
      removedInventoryId &&
      !Object.values(newInputValues).includes(removedInventoryId)
    ) {
      setSelectedInventoryOptionsCache((prev) => {
        const newCache = { ...prev }
        delete newCache[removedInventoryId]
        return newCache
      })
    }

  }

  return (
    <>
      {fields.map((field, index) => {
        const currentInputValue = inventoryInputValues[index] ?? ''
        const itemDisplayData = inventoryDisplayData[index]

        const allOtherSelectedValues = Object.entries(inventoryInputValues)
          .filter(([i]) => Number(i) !== index)
          .map(([, v]) => v.toLowerCase().trim())
          .filter((v) => v.length > 0)

        const allOtherSelectedNames = allOtherSelectedValues.map((val) => {
          const option = inventoryOptions.find((opt) => opt.value === val)
          return option ? option.label.toLowerCase().trim() : val
        })

        // Filter out already selected inventories from other rows
        let filteredInventoryOptions = inventoryOptions.filter((opt) => {
          const optionName = opt.label.toLowerCase().trim()
          return !allOtherSelectedNames.includes(optionName)
        })

        // Always include the currently selected inventory for this row,
        // even if it doesn't match the search query (so it displays correctly)
        if (currentInputValue) {
          // First try to find it in current inventoryOptions
          let currentSelectedOption = inventoryOptions.find(
            (opt) => opt.value === currentInputValue
          )

          // If not found in current options (due to search filter), check cache
          if (
            !currentSelectedOption &&
            selectedInventoryOptionsCache[currentInputValue]
          ) {
            currentSelectedOption =
              selectedInventoryOptionsCache[currentInputValue]
          }

          // If current selection is a valid inventory ID but not in filtered options,
          // add it back so it displays correctly
          if (
            currentSelectedOption &&
            !filteredInventoryOptions.some(
              (opt) => opt.value === currentInputValue
            )
          ) {
            filteredInventoryOptions = [
              currentSelectedOption,
              ...filteredInventoryOptions,
            ]
          }
        }


        const isAlreadyUsed = (value: string): boolean => {
          const normalized = value.toLowerCase().trim()
          if (!normalized) return false
          return allOtherSelectedNames.includes(normalized)
        }

        const isExistingInventory = !!inventoryList.find(
          (item) => item.id === currentInputValue
        )

        return (
          <InventoryRow
            key={field.id}
            form={form}
            field={field}
            index={index}
            currentInputValue={currentInputValue}
            itemDisplayData={itemDisplayData}
            filteredInventoryOptions={filteredInventoryOptions}
            inventoryOptions={inventoryOptions}
            inventoryList={inventoryList}
            isInventoryLoading={isInventoryLoading}
            transactionType={transactionType}
            isAlreadyUsed={isAlreadyUsed}
            onInventorySelect={handleInventorySelect}
            onInventorySearch={handleInventorySearch}
            onAppend={handleAppend}
            onRemove={handleRemove}
            showRemoveButton={index > 0}
            isExistingInventory={isExistingInventory}
          />
        )
      })}
    </>
  )
}