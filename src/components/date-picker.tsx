import { format } from 'date-fns'
import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  /** Allow dates after today (e.g. task deadlines). Default false for expense/historical dates. */
  allowFuture?: boolean
}

function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Pick a date',
  allowFuture = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!selected}
          className='data-[empty=true]:text-muted-foreground w-[240px] justify-start text-start font-normal'
        >
          {selected ? (
            format(selected, 'MMM d, yyyy')
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          selected={selected}
          onSelect={(date) => {
            onSelect(date)
            if (date) setOpen(false)
          }}
          disabled={(date: Date) => {
            const day = startOfDay(date)
            const today = startOfDay(new Date())
            if (!allowFuture && day > today) return true
            if (day < startOfDay(new Date('1900-01-01'))) return true
            return false
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
