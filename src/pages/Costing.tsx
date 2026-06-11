import { useMemo, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { CostingCalculatorPanel } from '@/components/costing/CostingCalculatorPanel'
import { CostingConfigDrawer } from '@/components/costing/CostingConfigDrawer'
import { CostingSidebar } from '@/components/costing/CostingSidebar'
import { useCostingConfigStore } from '@/stores/costingConfigStore'

const Costing = () => {
  const config = useCostingConfigStore((s) => s.config)
  const [activeItemId, setActiveItemId] = useState(
    config.categories[0]?.itemIds[0] ?? config.items[0]?.id ?? ''
  )
  const [configOpen, setConfigOpen] = useState(false)

  const activeItem = useMemo(
    () => config.items.find((i) => i.id === activeItemId),
    [config.items, activeItemId]
  )

  return (
    <Main fluid>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Print Costing
          </h1>
          <p className="text-sm text-muted-foreground">
            Calculate print production costs and generate quotes
          </p>
        </div>
        <Button
          variant="outline"
          className="costing-no-print shrink-0 gap-2 w-full sm:w-auto"
          onClick={() => setConfigOpen(true)}
        >
          <Settings2 className="h-4 w-4" />
          Config Manager
        </Button>
      </div>

      <div className="costing-no-print rounded-lg border bg-card overflow-hidden">
        <div className="flex flex-col md:flex-row md:min-h-0">
          <CostingSidebar
            config={config}
            activeItemId={activeItemId}
            onSelectItem={setActiveItemId}
          />
          <main className="flex-1 min-w-0 p-4 md:p-6">
            <CostingCalculatorPanel item={activeItem} />
          </main>
        </div>
      </div>

      <CostingConfigDrawer open={configOpen} onOpenChange={setConfigOpen} />
    </Main>
  )
}

export default Costing
