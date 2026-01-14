import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { CreateShopInterface, UserRoleWiseShopInterface, UpdateShopInterface } from "@/interface/shopInterface"
import { createShop, shopList, updateShop } from "@/api/shopApi"
import { useShopStore } from "@/stores/shopStore"
import { useNavigate } from "react-router-dom"

// query key
const SHOP_KEYS = {
    all: ["shops"] as const,
}

export const useShopList = () => {
    return useQuery<UserRoleWiseShopInterface[]>({
        queryKey: SHOP_KEYS.all,
        queryFn: shopList,
    })
}

// create shop
export const useCreateShop = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    // set shoopId in ls
    const setCurrentShop = useShopStore((s) => s.setCurrentShop)

    return useMutation({
        mutationFn: async (data: CreateShopInterface) => {
            const createShopRes = await createShop(data)
            // fetch shops list
            const shopsRes = await shopList()
            console.log(shopsRes)
            return { createShopRes, shopsRes }
        },
        onSuccess: ({ shopsRes, createShopRes }) => {
            // store the created shop ID in Zustand (and persist via localStorage if using persist)
            if (createShopRes?.id) {
                setCurrentShop(createShopRes.id, createShopRes.name)
            }

            toast.success("Shop created successfully")
            queryClient.invalidateQueries({ queryKey: ["shops"] })
            queryClient.invalidateQueries({queryKey: ["user"]})

            const totalShops = shopsRes?.length ?? 0

            // stay shops route
            if (location.pathname === "/shops") {
                // Already on /shops → stay
                return
            }

            // single shop
            if (totalShops === 1) {
                navigate("/")
                return
            }

            // multiple shops
            navigate("/shops")
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to create shop")
        }
    })
}

// update
export const useUpdateShop = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateShopInterface) => updateShop(data),
        onSuccess: () => {
            toast.success("Shop updated successfully!")
            queryClient.invalidateQueries({ queryKey: SHOP_KEYS.all })
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to update shop")
        }
    })
}