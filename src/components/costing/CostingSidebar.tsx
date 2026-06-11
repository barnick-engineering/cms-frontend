import type { CostingConfig } from '@/interface/costingInterface'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCostingIcon } from './costingIcons'

type CostingSidebarProps = {
  config: CostingConfig
  activeItemId: string
  onSelectItem: (id: string) => void
}

function CostingProductSelect({
  config,
  activeItemId,
  onSelectItem,
}: CostingSidebarProps) {
  const itemsById = new Map(config.items.map((i) => [i.id, i]))

  return (
    <div className="costing-no-print space-y-2 px-4 pt-4 pb-2 md:hidden">
      <Label className="text-sm font-medium">Product</Label>
      <Select value={activeItemId} onValueChange={onSelectItem}>
        <SelectTrigger className="h-11 w-full">
          <SelectValue placeholder="Select a product" />
        </SelectTrigger>
        <SelectContent>
          {config.categories.map((category) => (
            <SelectGroup key={category.id}>
              <SelectLabel>{category.title}</SelectLabel>
              {category.itemIds.map((itemId) => {
                const item = itemsById.get(itemId)
                if (!item) return null
                return (
                  <SelectItem key={itemId} value={itemId}>
                    {item.title}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function CostingDesktopSidebar({
  config,
  activeItemId,
  onSelectItem,
}: CostingSidebarProps) {
  const itemsById = new Map(config.items.map((i) => [i.id, i]))

  return (
    <aside
      className="costing-no-print hidden md:flex md:w-56 md:shrink-0 md:flex-col md:border-r md:bg-muted/20"
    >
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">Print Calculator</p>
        <p className="text-xs text-muted-foreground">Select a product</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {config.categories.map((category) => {
          const Icon = getCostingIcon(category.icon)
          return (
            <div key={category.id} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                <Icon className="h-4 w-4 shrink-0" />
                {category.title}
              </div>
              <ul className="space-y-0.5">
                {category.itemIds.map((itemId) => {
                  const item = itemsById.get(itemId)
                  if (!item) return null
                  const isActive = activeItemId === itemId
                  return (
                    <li key={itemId}>
                      <button
                        type="button"
                        onClick={() => onSelectItem(itemId)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export function CostingSidebar(props: CostingSidebarProps) {
  return (
    <>
      <CostingProductSelect {...props} />
      <CostingDesktopSidebar {...props} />
    </>
  )
}
