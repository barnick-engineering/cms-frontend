import { useMemo, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { SidebarProvider } from '@/components/ui/sidebar'
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
    <Main>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Print Costing</h1>
          <p className="text-muted-foreground">
            Calculate print production costs and generate quotes
          </p>
        </div>
        <Button
          variant="outline"
          className="costing-no-print gap-2"
          onClick={() => setConfigOpen(true)}
        >
          <Settings2 className="h-4 w-4" />
          Config Manager
        </Button>
      </div>

      <SidebarProvider className="min-h-[calc(100vh-12rem)] flex w-full">
        <div className="flex min-h-0 w-full rounded-lg border bg-card">
          <CostingSidebar
            config={config}
            activeItemId={activeItemId}
            onSelectItem={setActiveItemId}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <CostingCalculatorPanel item={activeItem} />
          </main>
        </div>
      </SidebarProvider>

      <CostingConfigDrawer open={configOpen} onOpenChange={setConfigOpen} />
    </Main>
  )
}

export default Costing
