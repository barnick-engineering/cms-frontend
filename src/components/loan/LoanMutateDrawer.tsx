import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/date-picker'
import { loanForOptions } from '@/constance/loanConstance'
import { useCreateLoan, useUpdateLoan } from '@/hooks/useLoan'
import type { Loan, LoanFormInterface } from '@/interface/loanInterface'
import { messageFromAxiosError } from '@/lib/barnickApiError'
import { loanFormSchema, type LoanFormType } from '@/schema/loanFormSchema'

interface LoanMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Loan | null
  onSave?: (data: LoanFormInterface) => void
}

const getTodayDateString = () => new Date().toISOString().split('T')[0]

const toDateString = (value?: string | null) => {
  if (!value) return undefined
  return value.split('T')[0]
}

const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const LoanMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}: LoanMutateDrawerProps) => {
  const createMutation = useCreateLoan()
  const updateMutation = useUpdateLoan()
  const isUpdate = !!currentRow?.id

  const form = useForm<LoanFormType>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      loan_for: '',
      loan_from: '',
      amount: 0,
      paid: 0,
      remarks: '',
      created_at: undefined,
    },
  })
  const amountValue = Number(form.watch('amount') || 0)
  const paidValue = Number(form.watch('paid') || 0)
  const computedRemaining = Math.max(0, amountValue - paidValue)

  useEffect(() => {
    if (open && currentRow && isUpdate) {
      form.reset({
        loan_for: currentRow.loan_for || '',
        loan_from: currentRow.loan_from || '',
        amount: Number(currentRow.amount || 0),
        paid: Number(currentRow.paid || 0),
        remarks: currentRow.remarks || '',
        created_at: toDateString(currentRow.created_at || currentRow.created),
      })
      return
    }

    if (!open) {
      form.reset({
        loan_for: '',
        loan_from: '',
        amount: 0,
        paid: 0,
        remarks: '',
        created_at: undefined,
      })
    }
  }, [open, currentRow, isUpdate, form])

  const onSubmit: SubmitHandler<LoanFormType> = (data) => {
    const latestAmount = Number(form.getValues('amount') || 0)
    const latestPaid = Number(form.getValues('paid') || 0)
    const calculatedRemaining = Math.max(0, latestAmount - latestPaid)
    const payload: LoanFormInterface = {
      loan_for: data.loan_for.trim(),
      loan_from: data.loan_from?.trim() || null,
      amount: latestAmount,
      paid: latestPaid,
      remaining: calculatedRemaining,
      remarks: data.remarks?.trim() || null,
    }

    if (isUpdate && currentRow?.id) {
      payload.created_at =
        data.created_at?.trim() ||
        toDateString(currentRow.created_at || currentRow.created) ||
        getTodayDateString()
      updateMutation.mutate(
        { id: currentRow.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Loan updated successfully.')
            onOpenChange(false)
            onSave?.(payload)
          },
          onError: (err) => toast.error(messageFromAxiosError(err)),
        }
      )
      return
    }

    payload.created_at = data.created_at?.trim() || getTodayDateString()

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Loan created successfully.')
        onOpenChange(false)
        onSave?.(payload)
      },
      onError: (err) => toast.error(messageFromAxiosError(err)),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? 'Update Loan' : 'Create Loan'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update this loan and save your changes.'
              : 'Add a new loan with basic details.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="loan-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            <FormField
              control={form.control}
              name="loan_for"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan For *</FormLabel>
                  <FormControl className="w-full">
                    <Combobox
                      options={loanForOptions}
                      value={field.value || ''}
                      onSelect={(value) => field.onChange(value)}
                      placeholder="Select loan receiver"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loan_from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan From</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Outside Lender" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Remaining (auto-calculated)</FormLabel>
              <FormControl>
                <Input type="number" min={0} value={computedRemaining} disabled readOnly />
              </FormControl>
            </FormItem>

            <FormField
              control={form.control}
              name="created_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Created At</FormLabel>
                  <FormControl className="w-full">
                    <DatePicker
                      selected={field.value ? parseDateString(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? formatDateToString(date) : undefined)
                      }}
                      placeholder="Pick a date (defaults to today)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} placeholder="Optional note..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button
            form="loan-form"
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : isUpdate
                ? 'Update Loan'
                : 'Create Loan'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default LoanMutateDrawer
