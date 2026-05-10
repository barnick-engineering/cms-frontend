import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createLoan,
  deleteLoan,
  getLoanById,
  loanList,
  updateLoan,
} from '@/api/loanApi'
import type { LoanFormInterface, LoanListResponse } from '@/interface/loanInterface'

const LOAN_KEYS = {
  all: ['loan'] as const,
}

export const useLoanList = (
  search?: string,
  startDate?: string,
  endDate?: string,
  loanFor?: string,
  limit?: number,
  offset?: number,
  options?: { enabled?: boolean }
) =>
  useQuery<LoanListResponse>({
    queryKey: [...LOAN_KEYS.all, search, startDate, endDate, loanFor, limit, offset],
    queryFn: () => loanList(search, startDate, endDate, loanFor, limit, offset),
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
  })

export const useLoanById = (id?: string | number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: [...LOAN_KEYS.all, 'detail', id],
    queryFn: () => getLoanById(id as string | number),
    enabled: !!id && options?.enabled !== false,
  })

export const useCreateLoan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LoanFormInterface) => createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOAN_KEYS.all, exact: false })
    },
  })
}

export const useUpdateLoan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<LoanFormInterface> }) =>
      updateLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOAN_KEYS.all, exact: false })
    },
  })
}

export const useDeleteLoan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => deleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOAN_KEYS.all, exact: false })
    },
  })
}
