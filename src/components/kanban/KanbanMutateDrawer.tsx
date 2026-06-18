import { useEffect, useMemo, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/date-picker'
import { toast } from 'sonner'
import { useCustomerList } from '@/hooks/useCustomer'
import {
  useCreateKanbanTask,
  useUpdateKanbanTask,
} from '@/hooks/useKanban'
import { useWorkOrderList } from '@/hooks/useWorkOrder'
import type { KanbanMutateDrawerProps } from '@/interface/kanbanInterface'
import { KANBAN_STAGES } from '@/interface/kanbanInterface'
import {
  fieldErrorsFromAxiosError,
  messageFromAxiosError,
} from '@/lib/barnickApiError'
import {
  kanbanTaskSchema,
  type KanbanTaskFormType,
} from '@/schema/kanbanTaskSchema'
import { useKanbanContext } from './kanban-provider'

function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDateToString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const KanbanMutateDrawer = ({
  open,
  onOpenChange,
  currentTask,
  onSave,
}: KanbanMutateDrawerProps) => {
  const createMutation = useCreateKanbanTask()
  const updateMutation = useUpdateKanbanTask()
  const { setOpen, setCurrentTask } = useKanbanContext()
  const isUpdate = !!currentTask?.id

  const [customerSearch, setCustomerSearch] = useState('')
  const [workOrderSearch, setWorkOrderSearch] = useState('')

  const form = useForm<KanbanTaskFormType>({
    resolver: zodResolver(kanbanTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
      customer_id: undefined,
      work_order_id: undefined,
      stage: 'todo',
    },
  })

  const watchedCustomerId = form.watch('customer_id')

  const { data: customersData, isLoading: customersLoading } = useCustomerList(
    customerSearch || undefined,
    100,
    0
  )

  const { data: workOrdersData, isLoading: workOrdersLoading } = useWorkOrderList(
    {
      search: workOrderSearch || undefined,
      customer_id: watchedCustomerId ?? undefined,
      limit: 100,
      offset: 0,
    },
    { enabled: open }
  )

  const customerOptions = useMemo(
    () =>
      (customersData?.data ?? []).map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [customersData]
  )

  const workOrderOptions = useMemo(
    () =>
      (workOrdersData?.data ?? []).map((wo) => ({
        value: String(wo.id),
        label: `${wo.no}${wo.customer ? ` | ${wo.customer}` : ''}`,
      })),
    [workOrdersData]
  )

  useEffect(() => {
    if (!open) return

    if (currentTask) {
      form.reset({
        title: currentTask.title,
        description: currentTask.description ?? '',
        deadline: currentTask.deadline,
        customer_id: currentTask.customer_id ?? undefined,
        work_order_id: currentTask.work_order_id ?? undefined,
        stage: currentTask.stage,
      })
    } else {
      form.reset({
        title: '',
        description: '',
        deadline: '',
        customer_id: undefined,
        work_order_id: undefined,
        stage: 'todo',
      })
    }
  }, [open, currentTask, form])

  const applyFieldErrors = (error: unknown) => {
    const fieldErrors = fieldErrorsFromAxiosError(error)
    if (fieldErrors) {
      for (const [key, messages] of Object.entries(fieldErrors)) {
        form.setError(key as keyof KanbanTaskFormType, {
          message: messages[0],
        })
      }
    }
  }

  const onSubmit: SubmitHandler<KanbanTaskFormType> = (values) => {
    const payload = {
      title: values.title,
      description: values.description || null,
      deadline: values.deadline,
      customer_id: values.customer_id ?? null,
      work_order_id: values.work_order_id ?? null,
      stage: values.stage ?? 'todo',
    }

    if (isUpdate && currentTask) {
      updateMutation.mutate(
        { id: currentTask.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Task updated')
            onSave?.()
          },
          onError: (error) => {
            applyFieldErrors(error)
            toast.error('Failed to update task', {
              description: messageFromAxiosError(error),
            })
          },
        }
      )
      return
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Task created')
        onSave?.()
      },
      onError: (error) => {
        applyFieldErrors(error)
        toast.error('Failed to create task', {
          description: messageFromAxiosError(error),
        })
      },
    })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? 'Edit Task' : 'Create Task'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update task details and save when done.'
              : 'Add a new kanban task linked to a customer or work order.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="kanban-task-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline *</FormLabel>
                  <FormControl>
                    <DatePicker
                      allowFuture
                      selected={
                        field.value ? parseDateString(field.value) : undefined
                      }
                      onSelect={(date) => {
                        field.onChange(date ? formatDateToString(date) : '')
                      }}
                      placeholder="Pick a deadline"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <Combobox
                      options={customerOptions}
                      value={field.value ? String(field.value) : ''}
                      onSelect={(val) => {
                        const id = val ? Number(val) : undefined
                        field.onChange(id)
                        if (!val) form.setValue('work_order_id', undefined)
                      }}
                      onSearch={setCustomerSearch}
                      loading={customersLoading}
                      placeholder="Search customer..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="work_order_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Order</FormLabel>
                  <FormControl>
                    <Combobox
                      options={workOrderOptions}
                      value={field.value ? String(field.value) : ''}
                      onSelect={(val) =>
                        field.onChange(val ? Number(val) : undefined)
                      }
                      onSearch={setWorkOrderSearch}
                      loading={workOrdersLoading}
                      placeholder="Search work order..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isUpdate && (
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select
                      value={field.value ?? 'todo'}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KANBAN_STAGES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>

        <SheetFooter className="gap-2 sm:gap-0">
          {isUpdate && currentTask && (
            <Button
              type="button"
              variant="destructive"
              className="mr-auto gap-2"
              onClick={() => {
                setCurrentTask(currentTask)
                setOpen('delete')
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit" form="kanban-task-form" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default KanbanMutateDrawer
