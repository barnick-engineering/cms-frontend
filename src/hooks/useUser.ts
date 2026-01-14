import { useShopStore } from "@/stores/shopStore"

// Helper hook to get shopId (for single shop app - "barnick pracharani")
// Since we removed user/me API, shopId should be stored in localStorage or come from login response
export const useShopId = () => {
    const shopId = useShopStore((s) => s.currentShopId)
    // If shopId is not in store, try to get from localStorage
    if (!shopId) {
        const storedShopId = localStorage.getItem('shopId')
        if (storedShopId) {
            return storedShopId
        }
    }
    return shopId || ''
}

// User management hooks removed - user management endpoints no longer exist