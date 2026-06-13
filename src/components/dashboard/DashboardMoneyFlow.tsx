import { ArrowDown, ArrowRight, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type DashboardMoneyFlowProps = {
  worked?: number
  paid?: number
  pending?: number
  expenses?: number
  netProfit?: number
  isLoading?: boolean
}

function formatCurrency(value: number) {
  return `৳${value.toLocaleString('en-IN')}`
}

function FlowStep({
  label,
  value,
  isLoading,
  className,
  hint,
}: {
  label: string
  value: string
  isLoading?: boolean
  className?: string
  hint?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card px-3 py-2.5 text-center min-w-[6.5rem] shrink-0',
        className
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      {isLoading ? (
        <div className="mx-auto mt-1 h-6 w-20 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-0.5 text-sm font-semibold tabular-nums sm:text-base">
          {value}
        </p>
      )}
      {hint && !isLoading && (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

function FlowArrow({ className }: { className?: string }) {
  return (
    <>
      <ArrowRight
        className={cn(
          'hidden sm:block h-4 w-4 shrink-0 text-muted-foreground',
          className
        )}
        aria-hidden
      />
      <ArrowDown
        className={cn(
          'sm:hidden h-4 w-4 shrink-0 text-muted-foreground',
          className
        )}
        aria-hidden
      />
    </>
  )
}

function FlowOperator({
  icon: Icon,
  className,
}: {
  icon: typeof Plus
  className?: string
}) {
  return (
    <Icon
      className={cn('h-3.5 w-3.5 shrink-0 text-muted-foreground', className)}
      aria-hidden
    />
  )
}

export function DashboardMoneyFlow({
  worked = 0,
  paid = 0,
  pending = 0,
  expenses = 0,
  netProfit = 0,
  isLoading,
}: DashboardMoneyFlowProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-sm font-medium">Money flow</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Work value split into collected and pending; profit uses collected only
      </p>

      <div
        className={cn(
          'mt-3 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-2',
          'overflow-x-auto pb-1 sm:pb-0'
        )}
      >
        <FlowStep
          label="Work value"
          value={formatCurrency(worked)}
          isLoading={isLoading}
        />
        <FlowArrow />
        <FlowStep
          label="Collected"
          value={formatCurrency(paid)}
          isLoading={isLoading}
        />
        <FlowOperator icon={Plus} />
        <FlowStep
          label="Pending"
          value={formatCurrency(pending)}
          isLoading={isLoading}
          hint="Not in profit calc"
          className="border-dashed"
        />
        <span
          className="hidden sm:inline text-muted-foreground/50 px-0.5"
          aria-hidden
        >
          |
        </span>
        <FlowOperator icon={Minus} />
        <FlowStep
          label="Expenses"
          value={formatCurrency(expenses)}
          isLoading={isLoading}
        />
        <FlowArrow />
        <FlowStep
          label="Net profit"
          value={formatCurrency(netProfit)}
          isLoading={isLoading}
          className="border-primary/30 bg-primary/5"
        />
      </div>
    </div>
  )
}
