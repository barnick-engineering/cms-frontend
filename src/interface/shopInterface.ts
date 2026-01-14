export interface CreateShopInterface {
    name: string
    address?: string
}

export interface ShopInterface {
    shopId: string
    shopName: string
    shopAddress: string | null
}

export interface UserRoleWiseShopInterface {
    name: string
    shopAddress: string
    shopId: string
    shopName: string
    roleId: string
    roleName: string
}

export interface ShopListInterface {
    shops: ShopInterface[]
    total: number
}

export interface UpdateShopInterface {
    id: string
    name?: string
    address?: string
}

export interface ShopDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentShop?: ShopInterface
}

export interface ShopProps {
    shop: ShopInterface
    role?: {
        id: string
        name: string
    }
    onEdit: (shop: ShopInterface) => void
}

export interface ShopStoreInterface {
    currentShopId: string | null
    currentShopName: string | null
    setCurrentShop: (id: string, name: string) => void
    clearCurrentShop: () => void
}