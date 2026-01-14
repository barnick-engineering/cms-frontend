import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { CreateShopInterface, UpdateShopInterface } from "@/interface/shopInterface"

// create
export const createShop = async (data: CreateShopInterface) => {
    const response = await axiosInstance.post(apiEndpoints.shop.createShop, data)
    return response.data
}

// list
export const shopList = async () => {
    const response = await axiosInstance.get(apiEndpoints.shop.shopList)
    return response.data
}

// update
export const updateShop = async (data: UpdateShopInterface) => {
    // removing shop id
    const { id, ...payload } = data
    const response = await axiosInstance.put(`${apiEndpoints.shop.updateShop}${data.id}`, payload)
    return response.data
}