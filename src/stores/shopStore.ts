import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShopStoreInterface } from '@/interface/shopInterface'

export const useShopStore = create<ShopStoreInterface>()(
    persist(
        (set) => ({
            currentShopId: null,
            currentShopName: null,
            setCurrentShop: (id: string, name: string) => {
                set({ currentShopId: id, currentShopName: name })
            },
            clearCurrentShop: () => set({ currentShopId: null, currentShopName: null }),
        }),
        {
            // ls key name
            name: 'shop-storage',
        }
    )
)