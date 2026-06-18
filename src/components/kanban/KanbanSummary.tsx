import type { KanbanSummary as KanbanSummaryType } from '@/interface/kanbanInterface'
import { cn } from '@/lib/utils'

type KanbanSummaryProps = {
  summary?: KanbanSummaryType
  isLoading?: boolean
}

export function KanbanSummary({ summary, isLoading }: KanbanSummaryProps) {
  const items = [
    { label: 'Total tasks', value: summary?.total_tasks ?? 0 },
    { label: 'Overdue', value: summary?.overdue_count ?? 0, highlight: true },
    { label: 'Due today', value: summary?.due_today_count ?? 0 },
  ]

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border bg-muted/40 px-3 py-2 text-sm',
        'sm:gap-x-6'
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 whitespace-nowrap"
        >
          <span className="text-muted-foreground">{item.label}</span>
          {isLoading ? (
            <span className="inline-block h-4 w-8 animate-pulse rounded bg-muted" />
          ) : (
            <span
              className={cn(
                'font-semibold tabular-nums',
                item.highlight && item.value > 0 && 'text-destructive'
              )}
            >
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
