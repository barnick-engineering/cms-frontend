import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { ProductFormInterface, ProductListResponse, Product } from "@/interface/productInterface"

// product list with search params
export const productList = async (
    search?: string,
    limit?: number,
    offset?: number
): Promise<ProductListResponse> => {
    const params = new URLSearchParams()
    
    if (search) params.append('search', search)
    if (limit) params.append('limit', String(limit))
    if (offset) params.append('offset', String(offset))

    const queryString = params.toString()
    const url = queryString 
        ? `${apiEndpoints.product.productList}?${queryString}`
        : apiEndpoints.product.productList

    const res = await axiosInstance.get<ProductListResponse>(url)
    return res.data
}

// get product by id
export const getProductById = async (id: string | number): Promise<Product> => {
    if (!id) throw new Error("Product ID is required")

    const res = await axiosInstance.get<Product>(
        `${apiEndpoints.product.getProductById}${id}/`
    )

    return res.data
}

// create product
export const createProduct = async (data: ProductFormInterface) => {
    const res = await axiosInstance.post<Product>(
        apiEndpoints.product.createProduct,
        data
    )
    return res.data
}

// update product
export const updateProduct = async (
    id: string | number,
    data: ProductFormInterface
): Promise<Product> => {
    if (!id) throw new Error("Product ID is required")
    
    const res = await axiosInstance.put<Product>(
        `${apiEndpoints.product.updateProduct}${id}/`,
        data
    )
    return res.data
}

// delete product
export const deleteProduct = async (id: string | number) => {
    if (!id) throw new Error("Product ID is required")
    
    const res = await axiosInstance.delete(
        `${apiEndpoints.product.deleteProduct}${id}/`
    )
    return res.data
}
