import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExpense } from './expense-provider'

const ExpenseCreateButton = () => {
    const { setOpen } = useExpense()

    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => setOpen('create')}>
                <span>Create</span> <Plus size={18} />
            </Button>
        </div>
    )
}

export default ExpenseCreateButton