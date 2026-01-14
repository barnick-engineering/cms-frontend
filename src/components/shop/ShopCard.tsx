import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, ShoppingBag, Pencil, CheckCheck } from "lucide-react"
import type { ShopProps } from "@/interface/shopInterface"
import { useShopStore } from "@/stores/shopStore"
import { useUser } from "@/hooks/useUser"


const ShopCard = ({ shop, onEdit }: ShopProps) => {
    // currentShopId from store to compare
    const currentShopId = useShopStore((s) => s.currentShopId)
    const setCurrentShop = useShopStore((s) => s.setCurrentShop)

    const { data: user } = useUser()

    // check if this card is the active one
    const isActive = currentShopId === shop.shopId

    // find role for this shop from user data
    const userRole = user?.shopWiseUserRoles.find(
        (s) => s.shop?.id === shop.shopId
    )?.role

    return (
        <Card
            // only switch if it's a different shop
            onClick={() => {
                if (shop.shopId && !isActive) {
                    setCurrentShop(shop.shopId, shop.shopName)
                }
            }}
            className={`list-none relative rounded-lg border p-4 transition-all duration-200 cursor-pointer ${
                isActive
                    ? "border-muted-foreground/30"
                    : "hover:shadow-sm border-border hover:border-muted-foreground/30"
            }`}
        >
            {/* top row: icon & menu */}
            <div className="mb-4 ml-2 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg p-2 bg-muted text-muted-foreground">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    {isActive && (
                        <span className="text-sm flex items-center gap-1 text-muted-foreground font-semibold">
                            <CheckCheck className="h-4 w-4" />
                            Selected
                        </span>
                    )}
                </div>

                {/* edit dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => onEdit(shop)}
                            className="cursor-pointer"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* shop info */}
            <div className="min-h-20 flex flex-col gap-1">
                {/* role badge */}
                {userRole && (
                    <Badge
                        variant="secondary"
                        className="text-xs px-2 py-1 mt-1 w-max text-left"
                    >
                        {userRole.name.replace("_", " ")}
                    </Badge>
                )}

                <h2
                    className="font-semibold truncate ml-2"
                    title={shop.shopName}
                >
                    {shop.shopName}
                </h2>

                <p
                    className="text-gray-500 overflow-hidden text-ellipsis line-clamp-2 ml-2"
                    title={shop.shopAddress || ""}
                >
                    {shop.shopAddress || "no address provided"}
                </p>
            </div>
        </Card>
    )
}

export default ShopCard