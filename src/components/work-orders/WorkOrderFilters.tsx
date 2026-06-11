import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Filter, Search, X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import DateRangeSearch from '@/components/DateRangeSearch'
import { Combobox } from '@/components/ui/combobox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCustomerList } from '@/hooks/useCustomer'
import { useDebounce } from '@/hooks/useDebounce'
import { useIsMobile } from '@/hooks/use-mobile'
import type { WorkOrderPaymentStatus } from '@/interface/workOrderInterface'
import { cn } from '@/lib/utils'

export type WorkOrderFilterValues = {
  search?: string
  startDate?: Date
  endDate?: Date
  customerId?: string | number
  paymentStatus?: WorkOrderPaymentStatus
  workOrderNo?: string
}

type WorkOrderFiltersProps = {
  values: WorkOrderFilterValues
  onChange: (patch: Partial<WorkOrderFilterValues>) => void
  onClear: () => void
}

function countAdvancedFilters(values: WorkOrderFilterValues) {
  let n = 0
  if (values.workOrderNo) n++
  if (values.customerId) n++
  if (values.paymentStatus) n++
  if (values.startDate && values.endDate) n++
  return n
}

function AdvancedFilterFields({
  values,
  onChange,
  setCustomerSearch,
  customerOptions,
  customersLoading,
  onCustomerSelect,
  dateRange,
  onDateChange,
  className,
}: {
  values: WorkOrderFilterValues
  onChange: (patch: Partial<WorkOrderFilterValues>) => void
  setCustomerSearch: (v: string) => void
  customerOptions: { value: string; label: string }[]
  customersLoading: boolean
  onCustomerSelect: (value: string) => void
  dateRange: DateRange | undefined
  onDateChange: (from?: Date, to?: Date) => void
  className?: string
}) {
  const [workOrderNoInput, setWorkOrderNoInput] = useState(values.workOrderNo ?? '')
  const debouncedWorkOrderNo = useDebounce(workOrderNoInput, 300)

  useEffect(() => {
    setWorkOrderNoInput(values.workOrderNo ?? '')
  }, [values.workOrderNo])

  useEffect(() => {
    const next = debouncedWorkOrderNo || undefined
    if (next !== values.workOrderNo) {
      onChange({ workOrderNo: next })
    }
  }, [debouncedWorkOrderNo, values.workOrderNo, onChange])

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Work order number</Label>
        <Input
          value={workOrderNoInput}
          onChange={(e) => setWorkOrderNoInput(e.target.value)}
          placeholder="e.g. WO/2026-01-16/3"
          className="h-8 w-full"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Customer</Label>
        <Combobox
          options={customerOptions}
          placeholder="All customers"
          emptyMessage="No customers found."
          value={values.customerId ? String(values.customerId) : ''}
          onSelect={onCustomerSelect}
          onSearch={setCustomerSearch}
          onSearchClear={() => setCustomerSearch('')}
          loading={customersLoading}
          className="h-8 w-full bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Payment</Label>
        <Select
          value={values.paymentStatus ?? 'all'}
          onValueChange={(v) =>
            onChange({
              paymentStatus:
                v === 'all' ? undefined : (v as WorkOrderPaymentStatus),
            })
          }
        >
          <SelectTrigger className="h-8 w-full bg-background">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Order date range</Label>
        <DateRangeSearch value={dateRange} onDateChange={onDateChange} />
      </div>
    </div>
  )
}

export function WorkOrderFilters({
  values,
  onChange,
  onClear,
}: WorkOrderFiltersProps) {
  const isMobile = useIsMobile()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(values.search ?? '')
  const [customerSearch, setCustomerSearch] = useState('')

  const debouncedSearch = useDebounce(searchInput, 300)

  const dateRange: DateRange | undefined =
    values.startDate && values.endDate
      ? { from: values.startDate, to: values.endDate }
      : undefined

  const { data: customersData, isLoading: customersLoading } = useCustomerList(
    customerSearch || undefined,
    100,
    0
  )

  const customerOptions = useMemo(() => {
    const options = (customersData?.data || []).map((customer) => ({
      value: String(customer.id),
      label: customer.name,
    }))
    return [{ value: '__clear__', label: 'All customers' }, ...options]
  }, [customersData])

  const selectedCustomerLabel = customerOptions.find(
    (c) => c.value === String(values.customerId)
  )?.label

  useEffect(() => {
    setSearchInput(values.search ?? '')
  }, [values.search])

  useEffect(() => {
    const next = debouncedSearch || undefined
    if (next !== values.search) {
      onChange({ search: next })
    }
  }, [debouncedSearch, values.search, onChange])

  const advancedCount = countAdvancedFilters(values)
  const hasAnyFilter =
    values.search ||
    advancedCount > 0

  const handleDateChange = (from?: Date, to?: Date) => {
    onChange({ startDate: from, endDate: to })
  }

  const handleCustomerSelect = (value: string) => {
    if (value === '__clear__' || !value) {
      onChange({ customerId: undefined })
      return
    }
    onChange({ customerId: value })
  }

  const handleClearAll = () => {
    setSearchInput('')
    onClear()
    setFiltersOpen(false)
  }

  const advancedFieldsProps = {
    values,
    onChange,
    setCustomerSearch,
    customerOptions,
    customersLoading,
    onCustomerSelect: handleCustomerSelect,
    dateRange,
    onDateChange: handleDateChange,
  }

  const chips: { key: string; label: string; onRemove: () => void }[] = []

  if (values.workOrderNo) {
    chips.push({
      key: 'wo',
      label: `WO: ${values.workOrderNo}`,
      onRemove: () => onChange({ workOrderNo: undefined }),
    })
  }
  if (values.customerId && selectedCustomerLabel) {
    chips.push({
      key: 'customer',
      label: selectedCustomerLabel,
      onRemove: () => onChange({ customerId: undefined }),
    })
  }
  if (values.paymentStatus) {
    chips.push({
      key: 'payment',
      label: values.paymentStatus,
      onRemove: () => onChange({ paymentStatus: undefined }),
    })
  }
  if (values.startDate && values.endDate) {
    chips.push({
      key: 'dates',
      label: `${format(values.startDate, 'dd MMM')} – ${format(values.endDate, 'dd MMM')}`,
      onRemove: () => onChange({ startDate: undefined, endDate: undefined }),
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search orders, customers, amounts…"
            className="h-8 w-full pl-8 lg:w-72"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isMobile ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 flex-1 sm:flex-none"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              {advancedCount > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 px-1 text-xs">
                  {advancedCount}
                </Badge>
              )}
            </Button>
          ) : (
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  {advancedCount > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-5 px-1 text-xs">
                      {advancedCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[min(100vw-2rem,360px)] p-4"
                align="end"
                sideOffset={8}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">More filters</p>
                  {advancedCount > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => {
                        onChange({
                          workOrderNo: undefined,
                          customerId: undefined,
                          paymentStatus: undefined,
                          startDate: undefined,
                          endDate: undefined,
                        })
                      }}
                    >
                      Reset filters
                    </Button>
                  )}
                </div>
                <AdvancedFilterFields {...advancedFieldsProps} />
              </PopoverContent>
            </Popover>
          )}

          {hasAnyFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={handleClearAll}
            >
              <X className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {chips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="shrink-0 gap-1 pr-1 capitalize"
            >
              {chip.label}
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-muted"
                onClick={chip.onRemove}
                aria-label={`Remove ${chip.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {isMobile && (
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="bottom" className="max-h-[85vh] rounded-t-xl px-4 pb-6">
            <SheetHeader className="text-left">
              <SheetTitle>Filter work orders</SheetTitle>
              <SheetDescription>
                Narrow by customer, payment, or date range.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto pb-2">
              <AdvancedFilterFields {...advancedFieldsProps} />
            </div>
            <div className="mt-4 flex gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onChange({
                    workOrderNo: undefined,
                    customerId: undefined,
                    paymentStatus: undefined,
                    startDate: undefined,
                    endDate: undefined,
                  })
                }}
              >
                Reset filters
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => setFiltersOpen(false)}
              >
                Apply
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

export function workOrderFiltersToParams(
  filters: WorkOrderFilterValues,
  pagination: { limit: number; offset: number }
) {
  return {
    search: filters.search,
    work_order_no: filters.workOrderNo,
    customer_id: filters.customerId,
    payment_status: filters.paymentStatus,
    start_date:
      filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
    end_date:
      filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
    limit: pagination.limit,
    offset: pagination.offset,
  }
}
