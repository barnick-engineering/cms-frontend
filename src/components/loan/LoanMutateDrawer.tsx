import { useEffect, useRef } from 'react'
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
import { NumberInput } from '@/components/ui/number-input'
import { coerceNumber } from '@/lib/numberInput'
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
import { useCreateLoan, useUpdateLoan, useLoanById } from '@/hooks/useLoan'
import type { Loan, LoanFormInterface } from '@/interface/loanInterface'
import { messageFromAxiosError } from '@/lib/barnickApiError'
import { loanFormSchema, type LoanFormType } from '@/schema/loanFormSchema'
import {
  formatDateToString,
  getLoanCreatedDate,
  getTodayDateString,
  parseDateString,
  toDateString,
} from '@/lib/loanDateUtils'

interface LoanMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Loan | null
  onSave?: (data: LoanFormInterface) => void
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

  const { data: loanDetails, isFetching: isLoadingDetails } = useLoanById(currentRow?.id, {
    enabled: isUpdate && open && !!currentRow?.id,
  })

  const hydratedLoanIdRef = useRef<number | null>(null)

  const form = useForm<LoanFormType>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      loan_for: '',
      loan_from: '',
      amount: undefined,
      paid: undefined,
      remarks: '',
      created: undefined,
    },
  })
  const amountValue = coerceNumber(form.watch('amount'))
  const paidValue = coerceNumber(form.watch('paid'))
  const computedRemaining = Math.max(0, amountValue - paidValue)

  useEffect(() => {
    if (!open) {
      hydratedLoanIdRef.current = null
      form.reset({
        loan_for: '',
        loan_from: '',
        amount: undefined,
        paid: undefined,
        remarks: '',
        created: undefined,
      })
      return
    }

    if (!isUpdate) {
      if (hydratedLoanIdRef.current === -1) return
      form.reset({
        loan_for: '',
        loan_from: '',
        amount: undefined,
        paid: undefined,
        remarks: '',
        created: undefined,
      })
      hydratedLoanIdRef.current = -1
      return
    }

    if (!currentRow?.id || isLoadingDetails) return
    if (hydratedLoanIdRef.current === currentRow.id) return

    const source = loanDetails ?? currentRow
    form.reset({
      loan_for: source.loan_for || '',
      loan_from: source.loan_from || '',
      amount: Number(source.amount || 0),
      paid: Number(source.paid || 0),
      remarks: source.remarks || '',
      created: toDateString(getLoanCreatedDate(source)),
    })
    hydratedLoanIdRef.current = currentRow.id
  }, [open, isUpdate, currentRow, loanDetails, isLoadingDetails, form])

  const onSubmit: SubmitHandler<LoanFormType> = (data) => {
    const latestAmount = coerceNumber(form.getValues('amount'))
    const latestPaid = coerceNumber(form.getValues('paid'))
    const latestCreated =
      form.getValues('created')?.trim() || data.created?.trim()
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
      const existingCreated = toDateString(getLoanCreatedDate(loanDetails ?? currentRow))
      payload.created = latestCreated || existingCreated
      if (!payload.created) {
        toast.error('Please select a created date.')
        return
      }

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

    payload.created = latestCreated || getTodayDateString()

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
                    <NumberInput
                      min={0}
                      value={field.value}
                      onChange={field.onChange}
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
                    <NumberInput
                      min={0}
                      value={field.value}
                      onChange={field.onChange}
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
              name="created"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Created</FormLabel>
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
            disabled={createMutation.isPending || updateMutation.isPending || (isUpdate && isLoadingDetails)}
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
