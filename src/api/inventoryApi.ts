import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { InventoryFormInterface, InventoryItemInterface, InventoryListApiResponseInterface } from "@/interface/inventoryInterface"

// inventory list
export const inventoryList = async (
  shopId: string,
  page: number,
  limit: number,
  searchBy?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ items: InventoryItemInterface[]; total: number }> => {
  const params = new URLSearchParams({
    shopId,
    page: String(page),
    limit: String(limit),
  })

  if (searchBy) params.append("searchBy", searchBy)
  if (startDate) params.append("startDate", startDate.toISOString())
  if (endDate) params.append("endDate", endDate.toISOString())

  const res = await axiosInstance.get(`${apiEndpoints.inventory.inventoryList}?${params.toString()}`)

  return {
    items: res.data.data ?? [],
    total: res.data.total ?? 0,
  }
}

// Get inventory by ID
export const getInventoryById = async (
  id: string,
  // shopId: string
): Promise<InventoryFormInterface> => {
  if (!id) throw new Error("Inventory ID is required")
  // if (!shopId) throw new Error("Shop ID is required")

  const res = await axiosInstance.get<InventoryFormInterface>(
    `${apiEndpoints.inventory.getInventoryById.replace("id", id)}`
  )

  return res.data
}

// Create inventory
export const createInventory = async (data: InventoryFormInterface) => {
  if (!data.shopId) throw new Error("Shop ID is required")
  const res = await axiosInstance.post<InventoryListApiResponseInterface>(
    apiEndpoints.inventory.createInventory,
    data
  )
  return res.data.data
}

// Update inventory
export const updateInventory = async ({
  id,
  data,
  shopId,
}: {
  id: string
  data: InventoryFormInterface
  shopId: string
}) => {
  if (!shopId) throw new Error("Shop ID is required")

  const res = await axiosInstance.put<InventoryListApiResponseInterface>(
    `${apiEndpoints.inventory.updateInventory}/{id}?id=${id}&shopId=${shopId}`,
    data
  )

  return res.data.data
}

// delete inventory
export const deleteInventory = async ({ id }: { id: string }) => {
  if (!id) throw new Error("Inventory ID is required")

  const res = await axiosInstance.delete<InventoryListApiResponseInterface>(
    `${apiEndpoints.inventory.deleteInventory}/{id}?id=${id}`
  )

  return res.data
}

// tarck inventory by id
export const trackInventoryById = async ({
  inventoryId,
  shopId,
  page = 1,
  limit = 10,
}: {
  inventoryId: string
  shopId: string
  page?: number
  limit?: number
}) => {
  if (!inventoryId) throw new Error("Inventory ID is required")
  if (!shopId) throw new Error("Shop ID is required")

  const params = new URLSearchParams({
    shopId,
    page: String(page),
    limit: String(limit),
  })

  const url = apiEndpoints.inventory.inventoryTrackingById.replace('{inventoryId}', inventoryId)

  const res = await axiosInstance.get(`${url}?${params.toString()}`)

  return {
    items: res.data?.data ?? [],
    total: res.data?.total ?? 0,
  }
}