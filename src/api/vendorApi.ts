import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { VendorFormInterface, VendorListApiResponseInterface, VendorListResponseInterface, VendorTransactionApiResponse } from "@/interface/vendorInterface"

// vendor list
export const vendorList = async (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
    startDate?: Date,
    endDate?: Date,
): Promise<VendorListResponseInterface> => {
    if (!shopId) throw new Error("Shop ID is required");

    const params = new URLSearchParams({
        shopId,
        page: String(page),
        limit: String(limit),
    });

    if (searchBy) params.append('searchBy', searchBy)
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())

    const res = await axiosInstance.get<VendorListApiResponseInterface>(
        `${apiEndpoints.vendor.vendorList}?${params.toString()}`
    );

    return res.data;
}

// get vendor by id
export const getVendorById = async (
    id: string,
    shopId: string
): Promise<VendorFormInterface> => {
    if (!id) throw new Error("Vendor ID is required")
    if (!shopId) throw new Error("Shop ID is required")

    const res = await axiosInstance.get<VendorFormInterface>(
        `${apiEndpoints.vendor.getVendorById.replace("id", id)}?shopId=${shopId}`
    )

    return res.data
}

// create
export const createVendor = async (data: VendorFormInterface) => {
    if (!data.shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.post<VendorListApiResponseInterface>(apiEndpoints.vendor.createVendor, data)
    return res.data.data
}

// update
export const updateVendor = async ({
    id,
    data,
    shopId,
}: {
    id: string
    data: VendorFormInterface
    shopId: string
}) => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.put<VendorListApiResponseInterface>(
        `${apiEndpoints.vendor.updateVendor}/${id}?shopId=${shopId}`,
        data
    )
    return res.data.data
}

// delete
export const deleteVendor = async ({ id, shopId }: { id: string; shopId: string }) => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.delete<VendorListApiResponseInterface>(
        `${apiEndpoints.vendor.deleteVendor}/${id}?shopId=${shopId}`
    )
    return res.data
}

// get vendor transactions by vendorId
export const getVendorTransactions = async (
    vendorId: string,
    page: number = 1,
    limit: number = 10
): Promise<VendorTransactionApiResponse> => {
    if (!vendorId) throw new Error("Vendor ID is required")

    const res = await axiosInstance.get<VendorTransactionApiResponse>(
        apiEndpoints.vendor.vendorTransactions.replace("id", vendorId),
        {
            params: { page, limit },
        }
    )

    return res.data
}