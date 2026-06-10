import { Calculator } from 'lucide-react'
import type { CostingItem } from '@/interface/costingInterface'

export function CostingComingSoon({ item }: { item: CostingItem }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
      <Calculator className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">{item.title} Calculator</h2>
      <p className="mt-2 text-muted-foreground">Coming soon...</p>
    </div>
  )
}
