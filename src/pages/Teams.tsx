import { useState, useCallback } from 'react'
import { Main } from '@/components/layout/main'
import { useTeamList } from '@/hooks/useTeam'
import { TeamsTable } from '@/components/teams/TeamsTable'

const Teams = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const [searchBy, setSearchBy] = useState('')
  const pageSize = 10

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleSearchChange = useCallback((value?: string) => {
    setSearchBy(value || '')
    setPageIndex(0)
  }, [])

  const { data, isLoading, isError } = useTeamList()

  if (isError) return <p>Error loading teams.</p>

  const teams = data || []
  
  // Filter teams based on search
  const filteredTeams = teams.filter((team) => {
    if (!searchBy) return true
    const search = searchBy.toLowerCase()
    return (
      team.first_name.toLowerCase().includes(search) ||
      team.last_name.toLowerCase().includes(search) ||
      team.email.toLowerCase().includes(search) ||
      team.designation.toLowerCase().includes(search) ||
      team.phone.toLowerCase().includes(search)
    )
  })

  // Paginate filtered results
  const paginatedTeams = filteredTeams.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  )
  const total = filteredTeams.length

  return (
    <Main>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground">
            View all team members and their details.
          </p>
        </div>
      </div>

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        {isLoading ? (
          <p>Loading teams...</p>
        ) : (
          <TeamsTable
            data={paginatedTeams}
            pageIndex={pageIndex}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
          />
        )}
      </div>
    </Main>
  )
}

export default Teams
