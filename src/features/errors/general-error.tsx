import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
}

const GeneralError = ({
  className,
  minimal = false,
}: GeneralErrorProps) => {
  const navigate = useNavigate()

  return (
    <div className={cn('flex flex-col min-h-screen w-full', className)}>
      {/* Header */}
      {!minimal && (
        <Header fixed>
          <Search />
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
      )}

      {/* Content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          {!minimal && <h1 className="text-[7rem] leading-tight font-bold">500</h1>}
          <span className="font-medium">Oops! Something went wrong {`:')`}</span>
          <p className="text-muted-foreground mt-2">
            We apologize for the inconvenience. <br /> Please try again later.
          </p>
          {!minimal && (
            <div className="mt-6 flex justify-center gap-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GeneralError