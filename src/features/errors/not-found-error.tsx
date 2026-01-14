import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

const NotFoundError = () => {
  const navigate = useNavigate()

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
          <h1 className="text-[7rem] leading-tight font-bold">404</h1>
          <span className="font-medium">Oops! Page Not Found!</span>
          <p className="text-muted-foreground mt-2">
            It seems like the page you're looking for <br />
            does not exist or might have been removed.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundError