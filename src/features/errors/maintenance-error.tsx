import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

const MaintenanceError = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-[7rem] leading-tight font-bold">503</h1>
          <span className="font-medium">Website is under maintenance!</span>
          <p className="text-muted-foreground mt-2">
            The site is not available at the moment. <br />
            We'll be back online shortly.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline">Learn more</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceError