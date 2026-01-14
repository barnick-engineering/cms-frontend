export interface TransactionMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: { id: string; title: string }
  onSave?: (updatedData: { title: string }) => void
}

export interface TransactionRowInterface {
  id: string
  title: string
  transactionType?: string
  transactionAmount?: number
  inventoryId?: string
}

export interface ComboboxOptionInterface {
  value: string
  label: string
}

export interface TransactionDetail {
  no?: string
  id: string
  transactionId: string
  inventory: {
    id: string
    name: string
  }
  quantity: number
  price: number
  total: number
  unitOfMeasurement?: {
    id: string
    name: string
  }
  shopId: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  no: string
  id: string
  partnerType: "VENDOR" | "CUSTOMER"
  vendor?: {
    id: string
    name: string
  }
  customer?: {
    id: string
    name: string
  }
  vendorId?: string
  customerId?: string
  transactionType: "PAYMENT" | "PURCHASE" | "COMMISSION" | "SALE" | "SELL_OUT" | "RECEIVABLE"
  transactionStatus: string | null
  totalAmount: number
  paid: number
  pending: number
  paymentType: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT"
  isPaid: boolean
  remarks: string | null
  payable: number
  receivable: number
  shopId: string
  createdAt: string
  updatedAt: string
  details: TransactionDetail[]
}

// update main DTO
export interface CreateTransactionDto {
  shopId: string
  // partnerType: "VENDOR" | "CUSTOMER"
  vendorId?: string
  customerId?: string
  transactionType: "PAYMENT" | "PURCHASE" | "COMMISSION" | "SALE" | "SELL_OUT" | "RECEIVABLE"
  totalAmount?: number
  paymentType?: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT"
  details?: {
    inventoryId: string
    quantity: number
    price: number
    total: number
  }[]
}

export interface TransactionListResponse {
  msg: string
  statusCode: number
  data: Transaction[]
  page: number
  limit: number
  total: number
}

export interface TransactionLedgerInterface {
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
  totalAmount: number
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
  details: TransactionDetail[]
}

export interface TransactionDetail {
  id: string
  transactionId: string
  inventory: {
    id: string
    name: string
  }
  quantity: number
  price: number
  total: number
  shopId: string
  createdAt: string
  updatedAt: string
}

export interface TransactionLedgerTableProps {
  data: TransactionLedgerInterface[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  onDateChange?: (from?: Date, to?: Date) => void
  initialDateRange?: { from: Date; to: Date }
}