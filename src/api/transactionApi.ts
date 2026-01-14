import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { CreateTransactionDto, TransactionListResponse } from "@/interface/transactionInterface"

export const getTransactions = async (
  shopId: string,
  page: number,
  limit: number,
  searchBy?: string,
  startDate?: string,
  endDate?: string,
  transactionTypes?: string[],
  vendorIds?: string[],
  customerIds?: string[]
) => {
  const res = await axiosInstance.get<TransactionListResponse>(
    apiEndpoints.transactions.transactionsList,
    {
      params: {
        shopId,
        page,
        limit,
        searchBy,
        startDate,
        endDate,
        transactionTypes: transactionTypes?.length ? transactionTypes : undefined,
        vendorIds: vendorIds?.length ? vendorIds : undefined,
        customerIds: customerIds?.length ? customerIds : undefined,
      },
      paramsSerializer: {
        indexes: null, // This makes arrays serialize as key=val1&key=val2 instead of key[0]=val1&key[1]=val2
      },
    }
  )
  return res.data
}

export const createTransaction = async (data: CreateTransactionDto) => {
  // this function will receive the payload with 'details' for inventory types
  if (!data.shopId) throw new Error("Shop ID is required")
  const res = await axiosInstance.post(apiEndpoints.transactions.createTransactions, data)
  return res.data
}

export const getTransactionById = async (shopId: string, id: string) => {
  if (!shopId) throw new Error("Shop ID is required")
  if (!id) throw new Error("Transaction ID is required")

  // replace {id} in the path and also put id in the query string.
  const path = apiEndpoints.transactions.getTransactionById.replace("{id}", id)
  const res = await axiosInstance.get(`${path}?id=${id}&shopId=${shopId}`)
  return res.data
}

// transaction ledger by customer/vendor id
export const transactionLedger = async (
  shopId: string,
  page: number,
  customerOrVendorId: string,
  limit: number = 10,
  searchBy?: string,
  startDate?: string,
  endDate?: string
) => {
  if (!shopId) throw new Error("Shop ID is required")
  if (!customerOrVendorId) throw new Error("Customer/Vendor ID is required")

  const params: Record<string, any> = {
    shopId,
    page,
    limit,
  }

  if (searchBy) params.searchBy = searchBy
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

  // Correct path replacement
  const path = apiEndpoints.transactions.transactionLedger.replace(
    "{customerOrVendorId}",
    customerOrVendorId
  )

  const res = await axiosInstance.get(path, { params })
  return res.data
}