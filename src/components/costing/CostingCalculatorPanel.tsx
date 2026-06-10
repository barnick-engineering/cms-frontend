import type { CostingItem } from '@/interface/costingInterface'
import { CustomCalculator } from './CustomCalculator'
import { CostingComingSoon } from './CostingComingSoon'
import { OffsetMemoCalculator } from './OffsetMemoCalculator'
import { VisitingCardCalculator } from './VisitingCardCalculator'

export function CostingCalculatorPanel({ item }: { item: CostingItem | undefined }) {
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-lg font-medium">Select a Product</h2>
        <p className="text-muted-foreground">
          Choose a product from the sidebar to start calculating costs.
        </p>
      </div>
    )
  }

  switch (item.calculatorType) {
    case 'visiting-card':
      return <VisitingCardCalculator item={item} />
    case 'offset-memo':
      return <OffsetMemoCalculator item={item} />
    case 'custom':
      return <CustomCalculator item={item} />
    case 'stub':
      return <CostingComingSoon item={item} />
    default:
      return <CostingComingSoon item={item} />
  }
}
