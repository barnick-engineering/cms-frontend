import {
  Calculator,
  ChartNoAxesCombined,
  ClipboardPlus,
  Columns3,
  Images,
  LayoutDashboard,
  Package,
  HandCoins,
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
        { title: 'Kanban', url: '/kanban', icon: Columns3 },
        { title: 'Expense', url: '/expense', icon: ChartNoAxesCombined },
        { title: 'Loan', url: '/loan', icon: HandCoins },
        { title: 'Sample Hub', url: '/sample-hub', icon: Images },
        { title: 'Print Costing', url: '/costing', icon: Calculator },
        { title: 'Reports', url: '/reports', icon: ClipboardPlus },
        { title: 'Teams', url: '/teams', icon: Users },
      ],
    },
  ],
}