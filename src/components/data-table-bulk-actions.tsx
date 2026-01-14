// import { useState } from 'react'
// import { type Table } from '@tanstack/react-table'
// import { Trash2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import {
//     Tooltip,
//     TooltipContent,
//     TooltipTrigger,
// } from '@/components/ui/tooltip'
// import { BulkActionsToolbar } from '@/components/bulk-actions-toolbar'
// import { TasksMultiDeleteDialog } from './tasks-multi-delete-dialog'

// export interface DataTableBulkActionsProps<TData extends { id: string }> {
//     table: Table<TData>
// }

// export function DataTableBulkActions<TData extends { id: string }>({
//     table,
// }: DataTableBulkActionsProps<TData>) {
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

//     return (
//         <>
//             <BulkActionsToolbar table={table} entityName='designation'>
//                 <Tooltip>
//                     <TooltipTrigger asChild>
//                         <Button
//                             variant='destructive'
//                             size='icon'
//                             onClick={() => setShowDeleteConfirm(true)}
//                             className='size-8'
//                             aria-label='Delete selected Designations'
//                             title='Delete selected Designations'
//                         >
//                             <Trash2 />
//                             <span className='sr-only'>Delete selected Designations</span>
//                         </Button>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                         <p>Delete selected Designations</p>
//                     </TooltipContent>
//                 </Tooltip>
//             </BulkActionsToolbar>

//             <TasksMultiDeleteDialog
//                 open={showDeleteConfirm}
//                 onOpenChange={setShowDeleteConfirm}
//                 table={table}
//             />
//         </>
//     )
// }