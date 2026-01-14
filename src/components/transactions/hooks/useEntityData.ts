import { useDebounce } from '@/hooks/useDebounce'
import { useVendorList } from '@/hooks/useVendor'
import { useCustomerList } from '@/hooks/useCustomer'
import { BusinessEntityType } from '@/constance/transactionConstances'

export const useEntityData = (
    shopId: string | null,
    selectedBusinessEntity: BusinessEntityType | null,
    searchQuery: string
) => {
    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    const { data: vendorResponse, isFetching: isVendorFetching } = useVendorList(
        shopId || '',
        1,
        10,
        debouncedSearchQuery || undefined,
        undefined,
        undefined,
        {
            enabled: !!shopId && selectedBusinessEntity === BusinessEntityType.VENDOR,
        }
    )

    const { data: customerResponse, isFetching: isCustomerFetching } =
        useCustomerList(
            shopId || '',
            1,
            10,
            debouncedSearchQuery || undefined,
            undefined,
            undefined,
            {
                enabled: !!shopId && selectedBusinessEntity === BusinessEntityType.CUSTOMER,
            }
        )

    return {
        flatVendorList: vendorResponse?.data || [],
        flatCustomerList: customerResponse?.customers || [],
        isLoading:
            (selectedBusinessEntity === BusinessEntityType.VENDOR && isVendorFetching) ||
            (selectedBusinessEntity === BusinessEntityType.CUSTOMER && isCustomerFetching),
    }
}