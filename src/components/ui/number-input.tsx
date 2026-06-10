import * as React from 'react'
import { Input } from '@/components/ui/input'
import { formatNumberInputValue, parseNumberInput } from '@/lib/numberInput'
import { cn } from '@/lib/utils'

type NumberInputProps = Omit<
  React.ComponentProps<'input'>,
  'type' | 'value' | 'onChange'
> & {
  value?: number | string | null
  onChange?: (value: number | undefined) => void
  onValueChange?: (value: number | undefined) => void
}

function NumberInput({
  className,
  value,
  onChange,
  onValueChange,
  ...props
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseNumberInput(e.target.value)
    onChange?.(next)
    onValueChange?.(next)
  }

  return (
    <Input
      type="number"
      data-slot="number-input"
      className={cn(className)}
      {...props}
      value={formatNumberInputValue(value)}
      onChange={handleChange}
    />
  )
}

export { NumberInput }
