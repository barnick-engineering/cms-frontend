import type { CustomField } from '@/interface/costingInterface'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CostingFormField } from './CostingFormField'

type CostingFieldRendererProps = {
  field: CustomField
  value: string | number | boolean
  onChange: (value: string | number | boolean) => void
  currency?: string
}

export function CostingFieldRenderer({
  field,
  value,
  onChange,
  currency,
}: CostingFieldRendererProps) {
  if (field.type === 'number') {
    return (
      <CostingFormField label={field.label} hint={field.placeholder}>
        <div className="flex items-center gap-3">
          <NumberInput
            className="h-10 w-full"
            value={value as number | string | undefined}
            placeholder={field.placeholder}
            onChange={(v) => onChange(v ?? '')}
          />
          {currency && (
            <span className="shrink-0 text-sm text-muted-foreground">
              {currency}
            </span>
          )}
        </div>
      </CostingFormField>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <div className="flex w-full items-start gap-3 rounded-lg border bg-muted/20 p-4">
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(Boolean(checked))}
          className="mt-0.5"
        />
        <div>
          <Label className="text-sm font-medium">{field.label}</Label>
          {field.placeholder && (
            <p className="mt-1 text-xs text-muted-foreground">
              {field.placeholder}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <CostingFormField label={field.label}>
        <Select value={String(value)} onValueChange={(v) => onChange(v)}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CostingFormField>
    )
  }

  if (field.type === 'radio') {
    return (
      <CostingFormField label={field.label}>
        <RadioGroup
          value={String(value)}
          onValueChange={(v) => onChange(v)}
          className="flex w-full flex-col gap-3"
        >
          {field.options?.map((opt) => (
            <div
              key={opt.value}
              className="flex items-center gap-3 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem
                value={opt.value}
                id={`${field.key}-${opt.value}`}
              />
              <Label
                htmlFor={`${field.key}-${opt.value}`}
                className="font-normal cursor-pointer"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CostingFormField>
    )
  }

  return null
}
