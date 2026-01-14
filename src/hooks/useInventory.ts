import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createInventory,
  deleteInventory,
  getInventoryById,
  inventoryList,
  trackInventoryById,
  updateInventory,
} from "@/api/inventoryApi"
import type { InventoryFormInterface, InventoryItemInterface } from "@/interface/inventoryInterface"

// query keys
export const INVENTORY_KEYS = {
  all: ["inventories"] as const,
  detail: (id: string) => [...INVENTORY_KEYS.all, id] as const,
  tracking: (inventoryId: string, shopId: string) => [...INVENTORY_KEYS.all, 'tracking', inventoryId, shopId] as const,
}

// inventory list
export const useInventoryList = (
  shopId: string,
  page: number,
  limit: number,
  searchBy?: string,
  startDate?: Date,
  endDate?: Date,
  options?: { enabled?: boolean }
) =>
  useQuery<{ items: InventoryItemInterface[]; total: number }>({
    queryKey: [...INVENTORY_KEYS.all, shopId, page, limit, searchBy, startDate, endDate],
    queryFn: () => inventoryList(shopId, page, limit, searchBy, startDate, endDate),
    enabled: options?.enabled !== false && !!shopId,
    placeholderData: keepPreviousData,
  })

// create inventory
export const useCreateInventory = (shopId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<InventoryFormInterface, "shopId">) =>
      createInventory({ ...data, shopId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INVENTORY_KEYS.all, shopId] })
    },
  })
}

// fetch multiple inventories by selected IDs
export const useInventoryDetail = (inventoryId: string | null, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: INVENTORY_KEYS.detail(inventoryId || ''),
    queryFn: () => getInventoryById(inventoryId!),
    enabled: (options?.enabled !== false) && !!inventoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// update inventory
export const useUpdateInventory = (shopId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InventoryFormInterface }) =>
      updateInventory({ id, data, shopId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INVENTORY_KEYS.all, shopId] })
    },
  })
}

// delete inventory
export const useDeleteInventory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteInventory({ id }),

    // remove from all paginated/filtered lists
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["inventories"] })

      // store previous state for rollback
      const previousQueries = queryClient.getQueriesData<{ items: InventoryItemInterface[]; total: number }>({
        queryKey: ["inventories"],
      })

      // optimistically update all cached inventory lists
      previousQueries.forEach(([key, oldData]) => {
        if (!oldData) return
        queryClient.setQueryData(key, {
          ...oldData,
          items: oldData.items.filter((item) => item.id !== id),
          total: oldData.total ? oldData.total - 1 : oldData.total,
        })
      })

      return { previousQueries }
    },

    // rollback on error
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
    },

    // always sync with backend after deletion
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inventories"],
        exact: false,
      })
    },
  })
}

// inventory tracking
export const useTrackInventoryById = (
  inventoryId: string | null,
  shopId: string | null,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...INVENTORY_KEYS.tracking(inventoryId || '', shopId || ''), page, limit],
    queryFn: () =>
      trackInventoryById({
        inventoryId: inventoryId!,
        shopId: shopId!,
        page,
        limit,
      }),
    // fetch when explicitly enabled and have required ids
    enabled: (options?.enabled !== false) && !!inventoryId && !!shopId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}