import {
  ChartNoAxesCombined,
  ClipboardPlus,
  ContactRound,
  LayoutDashboard,
  Package,
  PanelTopOpenIcon,
  ShoppingBag,
  UserRoundCheck,
  UserRoundPlus,
  UserStar,
} from 'lucide-react'
import type { SidebarData } from '@/interface/sidebarDataInerface'

export const sidebarData: Omit<SidebarData, 'teams'> = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navGroups: [
    {
      title: '',
      items: [
        { title: 'Dashboard', url: '/', icon: LayoutDashboard },
        { title: 'Customer', url: '/customers', icon: UserStar },
        { title: 'Products', url: '/products', icon: ShoppingBag },
        { title: 'Transaction Board', url: '/transactions', icon: Package },
        { title: 'Expense', url: '/expense', icon: ChartNoAxesCombined },
        { title: 'Reports', url: '/reports', icon: ClipboardPlus },
        {
          title: 'User Management',
          icon: UserRoundCheck,
          items: [
            {
              title: 'Users',
              url: '/users',
              icon: UserRoundPlus
            },
            {
              title: 'User Profile',
              url: '/user/me',
              icon: ContactRound
            },
          ],
        },
        { title: 'Plans', url: '/plans', icon: PanelTopOpenIcon, },
      ],
    },
  ],
}