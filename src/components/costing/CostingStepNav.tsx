import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CostingStep = {
  id: string
  title: string
  shortTitle?: string
}

type CostingStepNavProps = {
  steps: CostingStep[]
  currentStep: number
  onStepClick?: (index: number) => void
  className?: string
}

export function CostingStepNav({
  steps,
  currentStep,
  onStepClick,
  className,
}: CostingStepNavProps) {
  return (
    <nav
      className={cn(
        'costing-no-print rounded-lg border bg-muted/30 p-4',
        className
      )}
      aria-label="Calculation steps"
    >
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = onStepClick && index <= currentStep

          return (
            <li
              key={step.id}
              className="flex flex-1 items-center sm:min-w-0"
            >
              {index > 0 && (
                <span
                  className="hidden shrink-0 px-1 text-muted-foreground sm:block"
                  aria-hidden
                >
                  →
                </span>
              )}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className={cn(
                  'flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors sm:flex-1',
                  isClickable && 'hover:bg-background/80 cursor-pointer',
                  !isClickable && 'cursor-default',
                  isCurrent && 'bg-background shadow-sm ring-1 ring-border'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isComplete && 'bg-primary text-primary-foreground',
                    isCurrent && !isComplete && 'bg-primary text-primary-foreground',
                    !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block truncate text-sm font-medium',
                      isCurrent && 'text-foreground',
                      !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.shortTitle ?? step.title}
                  </span>
                  {isCurrent && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {step.title}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
