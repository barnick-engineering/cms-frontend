import { useEffect, useState } from "react"
import { Main } from "@/components/layout/main"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useShopList } from "@/hooks/useShop"
import type { ShopInterface, UserRoleWiseShopInterface } from "@/interface/shopInterface"
import ShopCard from "@/components/shop/ShopCard"
import ShopDrawer from "@/components/shop/ShopDrawer"
import { useShopStore } from "@/stores/shopStore"

const Shops = () => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [currentShop, setCurrentShop] = useState<ShopInterface | undefined>(undefined)
    const { data, isLoading } = useShopList() as { data?: UserRoleWiseShopInterface[]; isLoading: boolean }

    const setGlobalShop = useShopStore((s) => s.setCurrentShop)

    useEffect(() => {
        if (data?.length === 1 && data[0].shopId && data[0].shopName) {
            const shop: ShopInterface = {
                shopId: data[0].shopId,
                shopName: data[0].shopName,
                shopAddress: data[0].shopAddress,
            }
            // local state
            setCurrentShop(shop)
            // zustand
            setGlobalShop(shop.shopId, shop.shopName)
        }
    }, [data, setGlobalShop])

    return (
        <div>
            <Main fixed className="flex flex-col h-[calc(100svh-4rem)] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold tracking-tight">Your Shop's</h1>
                            <p className="text-muted-foreground">
                                Here's a list of your shops!
                            </p>
                        </div>
                        <Input placeholder="Search your shop" className="h-9 w-40 lg:w-[250px]" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            className="space-x-1"
                            onClick={() => {
                                setCurrentShop(undefined)
                                setDrawerOpen(true)
                            }}
                        >
                            <span>Create</span>
                            <Plus size={18} />
                        </Button>
                    </div>
                </div>

                <Separator className="shadow-sm" />

                <div className="grid gap-4 mt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {isLoading ? (
                        <p>Loading shops...</p>
                    ) : (
                        data?.map((item) => (
                            <ShopCard
                                key={item.shopId}
                                shop={item}
                                onEdit={() => {
                                    const shop: ShopInterface = {
                                        shopId: item.shopId,
                                        shopName: item.shopName,
                                        shopAddress: item.shopAddress,
                                    }
                                    setCurrentShop(shop)
                                    setGlobalShop(shop.shopId, shop.shopName)
                                    setDrawerOpen(true)
                                }}
                            />
                        ))
                    )}
                </div>
            </Main>

            <ShopDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                currentShop={currentShop}
            />
        </div>
    )
}

export default Shops