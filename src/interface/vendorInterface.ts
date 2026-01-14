import type { Table } from "@tanstack/react-table";

export interface Shop {
  id: string
  name: string
}

export interface VendorListInterface {
  id: string
  no: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  isB2B: boolean
  contactPerson?: string
  contactPersonPhone?: string
}

export interface Vendor {
  id: string
  no?: string
  name: string
  email: string | null
  phone: string
  address: string
  city: string | null
  country: string | null
  isB2B: boolean
  contactPerson: string | null
  contactPersonPhone: string | null
  shop: Shop
}

export interface VendorDataResponseInterface {
  msg: string
  statusCode: number
}

export interface VendorListResponseInterface
  extends VendorDataResponseInterface {
  data: Vendor[]
  page: number
  limit: number
  total: number
}

export interface VendorListApiResponseInterface {
  msg: string
  statusCode: number
  data: Vendor[]
  page: number
  limit: number
  total: number
}

export interface VendorFormInterface {
  id?: string
  no?: string
  name: string
  email?: string | null
  phone?: string
  address?: string
  city?: string | null
  country?: string | null
  isB2B: boolean
  contactPerson?: string | null
  contactPersonPhone?: string | null
  shopId?: string
  shop?: Shop | null
}

export interface VendorMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Vendor
  onSave?: (updatedData: VendorFormInterface) => void
}

export interface VendorMultiDeleteDialogProps<TData extends { id: string }> {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export interface DataTablePropsInterface {
  data: Vendor[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onSearchChange?: (value?: string, startDate?: Date, endDate?: Date) => void
  rowSelection?: Record<string, boolean>
  dateRange?: { from?: Date; to?: Date }
}

export interface VendorTransactionVendor {
  id: string
  name: string
}

export interface VendorTransactionDetail {
  id: string
  description: string
  amount: number
}

export interface VendorTransactionInterface {
  no: string
  id: string
  partnerType: string
  vendor: {
    id: string
    name: string
  }
  vendorId: string
  transactionType: string
  transactionStatus: string
  amount: number
  paid: number
  pending: number
  paymentType: string
  isPaid: boolean
  remarks: string
  payable: number
  receivable: number
  shopId: string
  createdAt: string
  updatedAt: string
  details: VendorTransactionDetail[]
}

export interface VendorTransactionApiResponse {
  msg: string
  statusCode: number
  data: VendorTransactionInterface[]
  page: number
  limit: number
  total: number
}