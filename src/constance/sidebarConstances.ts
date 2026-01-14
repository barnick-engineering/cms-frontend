import {
  ChartNoAxesCombined,
  ClipboardPlus,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
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
        { title: 'Work Orders', url: '/work-orders', icon: Package },
        { title: 'Expense', url: '/expense', icon: ChartNoAxesCombined },
        { title: 'Reports', url: '/reports', icon: ClipboardPlus },
        { title: 'Teams', url: '/teams', icon: Users },
      ],
    },
  ],
}