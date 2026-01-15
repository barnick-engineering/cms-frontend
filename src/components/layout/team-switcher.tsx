import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { TeamSwitcherProps } from '@/interface/sidebarDataInerface'

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  // For single shop "barnick pracharani", just display the shop name
  const shopName = teams && teams.length > 0 ? teams[0].name : 'Barnick Pracharani'
  const ShopLogo = teams && teams.length > 0 ? teams[0].logo : null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='cursor-default'
        >
          {ShopLogo && (
            <div className='flex items-center justify-center'>
              <ShopLogo className='size-8' />
            </div>
          )}
          <div className='grid flex-1 text-start text-sm leading-tight'>
            <span className='truncate font-semibold'>
              {shopName}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
