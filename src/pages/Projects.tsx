import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ProjectsProvider, useProjects } from '@/components/projects/project-provider'
import ProjectTable from '@/components/projects/ProjectTable'
import ProjectDialogs from '@/components/projects/ProjectDialogs'
import { useProjectList } from '@/hooks/useProject'
import { messageFromAxiosError } from '@/lib/barnickApiError'

function ProjectsContent() {
  const { setOpen } = useProjects()
  const { data, isLoading, isError, error } = useProjectList()

  const projects = data?.data ?? []

  return (
    <Main>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage projects and their work orders</p>
        </div>
        <Button onClick={() => setOpen('create')}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="-mx-4 flex-1 space-y-3 overflow-auto px-4 py-1">
        {isError ? (
          <Alert variant="destructive">
            <AlertTitle>Error loading projects</AlertTitle>
            <AlertDescription>{messageFromAxiosError(error)}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <ProjectTable data={projects} />
        )}
      </div>
    </Main>
  )
}

const Projects = () => (
  <ProjectsProvider>
    <ProjectsContent />
    <ProjectDialogs />
  </ProjectsProvider>
)

export default Projects
