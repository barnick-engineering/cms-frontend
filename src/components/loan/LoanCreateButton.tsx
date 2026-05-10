import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLoan } from './loan-provider'

const LoanCreateButton = () => {
  const { setOpen } = useLoan()
  return (
    <Button className="space-x-1" onClick={() => setOpen('create')}>
      <span>Create</span> <Plus size={18} />
    </Button>
  )
}

export default LoanCreateButton
