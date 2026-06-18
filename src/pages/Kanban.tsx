import { useCallback, useMemo, useState } from 'react'
import { Main } from '@/components/layout/main'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import KanbanCreateButton from '@/components/kanban/KanbanCreateButton'
import KanbanDialogs from '@/components/kanban/KanbanDialogs'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import {
  KanbanFilters,
  kanbanFiltersToParams,
} from '@/components/kanban/KanbanFilters'
import { KanbanSummary } from '@/components/kanban/KanbanSummary'
import { KanbanProvider } from '@/components/kanban/kanban-provider'
import { useKanbanBoard } from '@/hooks/useKanban'
import type { KanbanFilterValues } from '@/interface/kanbanInterface'
import { messageFromAxiosError } from '@/lib/barnickApiError'

const EMPTY_FILTERS: KanbanFilterValues = {}

const Kanban = () => {
  const [filters, setFilters] = useState<KanbanFilterValues>(EMPTY_FILTERS)

  const boardParams = useMemo(
    () => kanbanFiltersToParams(filters),
    [filters]
  )

  const handleFiltersChange = useCallback(
    (patch: Partial<KanbanFilterValues>) => {
      setFilters((prev) => ({ ...prev, ...patch }))
    },
    []
  )

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
  }, [])

  const { data, isLoading, isError, error, isFetching } =
    useKanbanBoard(boardParams)

  const columns = data?.columns ?? []
  const summary = data?.summary

  return (
    <KanbanProvider>
      <Main fluid>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Kanban</h2>
            <p className="text-muted-foreground">
              Track print jobs across production stages
            </p>
          </div>
          <KanbanCreateButton />
        </div>

        <div className="space-y-3">
          <KanbanSummary
            summary={summary}
            isLoading={isLoading && !data}
          />

          <KanbanFilters
            values={filters}
            onChange={handleFiltersChange}
            onClear={handleClearFilters}
          />

          {isError ? (
            <Alert variant="destructive">
              <AlertTitle>Error loading board</AlertTitle>
              <AlertDescription>
                {messageFromAxiosError(error)}
              </AlertDescription>
            </Alert>
          ) : (
            <KanbanBoard
              columns={columns}
              boardParams={boardParams}
              isLoading={isLoading && !data}
            />
          )}

          {isFetching && data && (
            <p className="text-xs text-muted-foreground">Refreshing…</p>
          )}
        </div>
      </Main>

      <KanbanDialogs />
    </KanbanProvider>
  )
}

export default Kanban
