import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { CustomerFormInterface, CustomerListInterface, CustomerListResponse, Customer } from "@/interface/customerInterface"

// customer list with search params
export const customerList = async (
    search?: string,
    limit?: number,
    offset?: number
): Promise<CustomerListResponse> => {
    const params = new URLSearchParams()
    
    if (search) params.append('search', search)
    if (limit) params.append('limit', String(limit))
    if (offset) params.append('offset', String(offset))

    const queryString = params.toString()
    const url = queryString 
        ? `${apiEndpoints.customer.customerList}?${queryString}`
        : apiEndpoints.customer.customerList

    const res = await axiosInstance.get<CustomerListResponse>(url)
    return res.data
}

// get customer by id
export const getCustomerById = async (id: string | number): Promise<Customer> => {
    if (!id) throw new Error("Customer ID is required")

    const res = await axiosInstance.get<Customer>(
        `${apiEndpoints.customer.getCustomerById}${id}/`
    )

    return res.data
}

// create customer
export const createCustomer = async (data: CustomerFormInterface) => {
    const res = await axiosInstance.post<Customer>(
        apiEndpoints.customer.createCustomer,
        data
    )
    return res.data
}

// update customer
export const updateCustomer = async (
    id: string | number,
    data: CustomerFormInterface
): Promise<Customer> => {
    if (!id) throw new Error("Customer ID is required")
    
    const res = await axiosInstance.put<Customer>(
        `${apiEndpoints.customer.updateCustomer}${id}/`,
        data
    )
    return res.data
}

// delete customer
export const deleteCustomer = async (id: string | number) => {
    if (!id) throw new Error("Customer ID is required")
    
    const res = await axiosInstance.delete(
        `${apiEndpoints.customer.deleteCustomer}${id}/`
    )
    return res.data
}
