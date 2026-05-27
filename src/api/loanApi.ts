import { apiEndpoints } from '@/config/api'
import type {
  Loan,
  LoanFormInterface,
  LoanListResponse,
} from '@/interface/loanInterface'
import { axiosInstance } from './axios'

type BarnickWrapper<T> = {
  response_data?: T
  data?: T
  response_message?: string
  response_code?: number
}

const toDateString = (value: string) => value.split('T')[0]

export const normalizeLoan = (loan: Loan): Loan => ({
  ...loan,
  created: loan.created ? toDateString(loan.created) : loan.created,
})

/** Backend field is `created` (YYYY-MM-DD). */
export const buildLoanPayload = (data: LoanFormInterface): LoanFormInterface => {
  const created = data.created?.trim()
  if (!created) return data
  return {
    ...data,
    created,
  }
}

export const loanList = async (
  search?: string,
  startDate?: string,
  endDate?: string,
  loanFor?: string,
  limit?: number,
  offset?: number
): Promise<LoanListResponse> => {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  if (loanFor) params.append('loan_for', loanFor)
  if (limit) params.append('limit', String(limit))
  if (offset) params.append('offset', String(offset))

  const queryString = params.toString()
  const url = queryString
    ? `${apiEndpoints.loan.loanList}?${queryString}`
    : apiEndpoints.loan.loanList

  const res = await axiosInstance.get<LoanListResponse>(url)
  return {
    ...res.data,
    data: (res.data.data ?? []).map(normalizeLoan),
  }
}

export const getLoanById = async (id: string | number): Promise<Loan> => {
  if (!id) throw new Error('Loan ID is required')
  const res = await axiosInstance.get<BarnickWrapper<Loan>>(
    `${apiEndpoints.loan.getLoanById}${id}/`
  )
  return normalizeLoan(
    res.data.response_data ?? res.data.data ?? (res.data as unknown as Loan)
  )
}

export const createLoan = async (data: LoanFormInterface): Promise<Loan> => {
  const res = await axiosInstance.post<BarnickWrapper<Loan>>(
    apiEndpoints.loan.createLoan,
    buildLoanPayload(data)
  )
  return normalizeLoan(
    res.data.response_data ?? res.data.data ?? (res.data as unknown as Loan)
  )
}

export const updateLoan = async (
  id: string | number,
  data: Partial<LoanFormInterface>
): Promise<Loan> => {
  if (!id) throw new Error('Loan ID is required')
  const res = await axiosInstance.put<BarnickWrapper<Loan>>(
    `${apiEndpoints.loan.updateLoan}${id}/`,
    buildLoanPayload(data as LoanFormInterface)
  )
  return normalizeLoan(
    res.data.response_data ?? res.data.data ?? (res.data as unknown as Loan)
  )
}

export const deleteLoan = async (id: string | number) => {
  if (!id) throw new Error('Loan ID is required')
  const res = await axiosInstance.delete(
    `${apiEndpoints.loan.deleteLoan}${id}/`
  )
  return res.data
}
