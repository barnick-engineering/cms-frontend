import type { ComboboxOptionInterface } from "@/interface/transactionInterface"

export const TRANSACTION_TYPES = [
  { value: "SALE", label: "Sale" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "PAYMENT", label: "Payment" },
  { value: "RECEIVABLE", label: "Receivable" },
  { value: "COMMISSION", label: "Commission" },
]

export enum BusinessEntityType {
  VENDOR = "VENDOR",
  CUSTOMER = "CUSTOMER",
}

export const FORM_ID = 'transaction-form'

export const DEFAULT_VALUES = {
  transactionType: '',
  partnerType: '',
  entityTypeId: '',
  paymentType: '',
  paid: 0,
  transactionAmount: null,
  inventories: [],
}

export const PAYMENT_TYPES: ComboboxOptionInterface[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_PAYMENT", label: "Mobile Payment" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
]