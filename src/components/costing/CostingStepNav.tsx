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
        'costing-no-print rounded-lg border bg-muted/30 p-3 sm:p-4',
        className
      )}
      aria-label="Calculation steps"
    >
      <ol
        className="flex flex-row items-stretch gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin sm:gap-0 sm:pb-0 sm:overflow-visible"
      >
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = onStepClick && index <= currentStep

          return (
            <li
              key={step.id}
              className="flex shrink-0 items-center snap-start sm:flex-1 sm:min-w-0"
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
                  'flex items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors sm:min-w-0 sm:flex-1',
                  isClickable && 'hover:bg-background/80 cursor-pointer',
                  !isClickable && 'cursor-default',
                  isCurrent && 'bg-background shadow-sm ring-1 ring-border'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8',
                    isComplete && 'bg-primary text-primary-foreground',
                    isCurrent && !isComplete && 'bg-primary text-primary-foreground',
                    !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block truncate text-xs sm:text-sm font-medium',
                      isCurrent && 'text-foreground',
                      !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.shortTitle ?? step.title}
                  </span>
                  {isCurrent && (
                    <span className="hidden truncate text-xs text-muted-foreground sm:block">
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
