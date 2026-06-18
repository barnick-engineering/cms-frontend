import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKanbanContext } from './kanban-provider'

const KanbanCreateButton = () => {
  const { setOpen, setCurrentTask } = useKanbanContext()

  return (
    <Button
      className="gap-1"
      onClick={() => {
        setCurrentTask(null)
        setOpen('create')
      }}
    >
      <span>Create</span>
      <Plus size={18} />
    </Button>
  )
}

export default KanbanCreateButton
