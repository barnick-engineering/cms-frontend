import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { CalendarIcon, X } from 'lucide-react'

interface DateRangeSearchProps {
    value?: DateRange
    onDateChange?: (from?: Date, to?: Date) => void
}

export default function DateRangeSearch({ value, onDateChange }: DateRangeSearchProps) {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(value)
    const [tempRange, setTempRange] = React.useState<DateRange | undefined>(value)
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        setDateRange(value)
        setTempRange(value)
    }, [value])

    const handleOk = () => {
        if (tempRange?.from && tempRange?.to) {
            setDateRange(tempRange)
            onDateChange?.(tempRange.from, tempRange.to)
        }
        setOpen(false)
    }

    const handleCancel = () => {
        // revert temporary selection
        setTempRange(dateRange)
        setOpen(false)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        setDateRange(undefined)
        setTempRange(undefined)
        onDateChange?.(undefined, undefined)
    }

    const formattedLabel =
        dateRange?.from && dateRange?.to
            ? `${format(dateRange.from, 'MMM dd, yyyy')} → ${format(dateRange.to, 'MMM dd, yyyy')}`
            : 'Select date range'

    return (
        <div className="flex items-center space-x-2">
            <Popover open={open} onOpenChange={(state) => {
                setOpen(state)
                // sync when opening
                if (state) setTempRange(dateRange)
            }}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="justify-start text-left font-normal w-64 h-8"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span className="truncate">{formattedLabel}</span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-3 space-y-3 max-h-[90vh] overflow-y-auto sm:max-h-none" align="start" side="bottom" sideOffset={8} >
                    <Calendar
                        mode="range"
                        selected={tempRange}
                        onSelect={setTempRange}
                        numberOfMonths={window.innerWidth < 640 ? 1 : 2}
                        initialFocus
                    />

                    {/* ok/cancel button */}
                    <div className="flex justify-end space-x-2 px-1">
                        <Button variant="ghost" size="sm" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button variant="default" size="sm" onClick={handleOk}>
                            OK
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {dateRange?.from && dateRange?.to && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    title="Clear date range"
                    className="h-8 w-8"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}