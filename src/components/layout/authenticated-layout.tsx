import { Outlet } from 'react-router-dom'
import {
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { TeamSwitcher } from './team-switcher'
import { Header } from './header'
import { Search } from '../search'
import { ThemeSwitch } from '../theme-switch'
import { ConfigDrawer } from '../config-drawer'
import { ProfileDropdown } from '../profile-dropdown'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { sidebarData as staticSidebarData } from '../../constance/sidebarConstances'
import type { AuthenticatedLayoutProps } from '@/interface/sidebarDataInerface'
import { useDrawerStore } from '@/stores/drawerStore'

// Favicon logo component for sidebar
const FaviconLogo = ({ className }: { className?: string }) => {
  return (
    <img 
      src="/images/favicon.svg" 
      alt="Barnick Pracharani" 
      className={className}
    />
  )
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  // global drawer state apply blur while any drawer open to view
  const isAnyDrawerOpen = useDrawerStore((s) => s.isAnyDrawerOpen)

  // Single shop "barnick pracharani" - no need to fetch from API
  const dynamicTeams = [{
    id: 'barnick-pracharani',
    name: 'Barnick Pracharani',
    logo: FaviconLogo,
  }]

  return (
    <SidebarProvider defaultOpen={true}>
      {/* wrapper for blur */}
      <div
        className={`relative flex h-screen w-screen overflow-hidden transition-all duration-300 
          ${isAnyDrawerOpen ? 'blur-sm pointer-events-none' : ''
          }`}
      >
        {/* sidebar */}
        <AppSidebar>
          <SidebarHeader>
            <TeamSwitcher teams={dynamicTeams} />
          </SidebarHeader>

          <SidebarContent className="overflow-y-auto">
            {staticSidebarData.navGroups.map((group) => (
              <NavGroup key={group.title} {...group} />
            ))}
          </SidebarContent>

          <SidebarFooter>
            <NavUser user={{ id: '', name: 'User', phone: '' }} />
          </SidebarFooter>
        </AppSidebar>

        {/* main content */}
        <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden relative z-0">
          {/* top header */}
          <Header>
            {/* search inside the blur wrapper */}
            <div className="relative z-0 w-full">
              <Search />
            </div>

            <div className="ms-auto flex items-center space-x-4">
              <ThemeSwitch />
              <ConfigDrawer />
              <ProfileDropdown />
            </div>
          </Header>

          {/* main content area */}
          <main className="flex-1 min-w-0 h-full overflow-auto">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}