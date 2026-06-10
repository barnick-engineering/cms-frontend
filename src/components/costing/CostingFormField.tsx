import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type CostingFormFieldProps = {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function CostingFormField({
  label,
  hint,
  children,
  className,
}: CostingFormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {hint && (
        <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>
      )}
      <div className="max-w-md">{children}</div>
    </div>
  )
}
