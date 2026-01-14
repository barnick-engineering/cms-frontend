import { useState, useCallback } from 'react'
import { Main } from '@/components/layout/main'
import { UsersProvider } from '@/components/users/UserProvider'
// useUserList removed - user management endpoints no longer exist
import { useShopStore } from '@/stores/shopStore'
import { UsersPrimaryButtons } from '@/components/users/UserPrimaryButtons'
import { UsersDialogs } from '@/components/users/UserDialogs'
import { UsersTable } from '@/components/users/UserTable'

const Users = () => {
  // Users page replaced by Teams - kept for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions
  void useShopStore((s) => s.currentShopId)

  const [pageIndex, setPageIndex] = useState(0)
  const [_searchBy, setSearchBy] = useState('')
  const [_startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [_endDate, setEndDate] = useState<Date | undefined>(undefined)
  const pageSize = 10

  // Stable callback to handle page changes
  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  // Handle search and date range changes
  const handleSearchChange = useCallback((
    value?: string,
    from?: Date,
    to?: Date
  ) => {
    setSearchBy(value || '') // eslint-disable-line @typescript-eslint/no-unused-vars
    setStartDate(from)
    setEndDate(to)
    setPageIndex(0) // Reset to first page when search changes
  }, [])

  // User management removed - this page is replaced by Teams
  const users: never[] = []
  const isLoading = false
  const total = 0

  return (
    <UsersProvider>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {isLoading ? (
            <p>Loading users...</p>
          ) : (
            <UsersTable
              data={users}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
            />
          )}
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}

export default Users