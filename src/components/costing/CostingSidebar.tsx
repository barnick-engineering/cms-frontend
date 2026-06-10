import type { CostingConfig } from '@/interface/costingInterface'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { getCostingIcon } from './costingIcons'

type CostingSidebarProps = {
  config: CostingConfig
  activeItemId: string
  onSelectItem: (id: string) => void
}

export function CostingSidebar({
  config,
  activeItemId,
  onSelectItem,
}: CostingSidebarProps) {
  const itemsById = new Map(config.items.map((i) => [i.id, i]))

  return (
    <Sidebar
      collapsible="none"
      className="costing-no-print w-56 shrink-0 border-r bg-transparent"
    >
      <SidebarHeader className="border-b px-4 py-3">
        <p className="text-sm font-semibold">Print Calculator</p>
        <p className="text-xs text-muted-foreground">Select a product</p>
      </SidebarHeader>
      <SidebarContent>
        {config.categories.map((category) => {
          const Icon = getCostingIcon(category.icon)
          return (
            <SidebarGroup key={category.id}>
              <SidebarGroupLabel className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {category.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {category.itemIds.map((itemId) => {
                    const item = itemsById.get(itemId)
                    if (!item) return null
                    return (
                      <SidebarMenuItem key={itemId}>
                        <SidebarMenuButton
                          isActive={activeItemId === itemId}
                          onClick={() => onSelectItem(itemId)}
                        >
                          {item.title}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}
