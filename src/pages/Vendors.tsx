import { useCallback, useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { CustomersProvider } from '@/components/customers/customer-provider'
import { ProductsProvider } from '@/components/products/product-provider'
import { useVendorList } from '@/hooks/useVendor'
import { useProductList } from '@/hooks/useProduct'
import { useShopStore } from '@/stores/shopStore'
import CustomerCreateButton from '@/components/customers/CustomerCreateButton'
import ProductCreateButton from '@/components/products/ProductCreateButton'
import VendorTable from '@/components/vendors/VendorTable'
import ProductTable from '@/components/products/ProductTable'
import VendorDialogs from '@/components/vendors/VendorDialogs'
import ProductDialogs from '@/components/products/ProductDialogs'

const Vendors = () => {
  const shopId = useShopStore(s => s.currentShopId)
  const [pageIndex, setPageIndex] = useState(0)
  const [searchBy, setSearchBy] = useState('')
  
  // Products state
  const [productPageIndex, setProductPageIndex] = useState(0)
  const [productSearchBy, setProductSearchBy] = useState('')
  const pageSize = 10
  const productOffset = productPageIndex * pageSize

  // Initialize with last 30 days
  const defaultDateRange = useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    return {
      from: thirtyDaysAgo,
      to: today
    }
  }, [])
  
  const [startDate, setStartDate] = useState<Date | undefined>(defaultDateRange.from)
  const [endDate, setEndDate] = useState<Date | undefined>(defaultDateRange.to)

  // useCallback ensures stable function references
  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleProductPageChange = useCallback((index: number) => {
    setProductPageIndex(index)
  }, [])

  const handleSearchChange = useCallback((
    value?: string,
    from?: Date,
    to?: Date
  ) => {
    setSearchBy(value || '')
    setStartDate(from)
    setEndDate(to)
  }, [])

  const handleProductSearchChange = useCallback((value?: string) => {
    setProductSearchBy(value || '')
    setProductPageIndex(0)
  }, [])

  const { data, isLoading, isError } = useVendorList(
    shopId || '',
    pageIndex + 1,
    pageSize,
    searchBy,
    startDate,
    endDate
  )

  const { data: productData, isLoading: isProductLoading, isError: isProductError } = useProductList(
    productSearchBy || undefined,
    pageSize,
    productOffset
  )

  if (isError) return <p>Error loading vendors.</p>

  const vendors = data?.data || []
  const total = data?.total || 0

  const products = productData?.data || []
  const productTotal = productData?.total || 0

  return (
    <CustomersProvider>
      <ProductsProvider>
        <Main>
          {/* Vendors Section */}
          <div className='mb-6'>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
              <div>
                <h2 className='text-2xl font-bold tracking-tight'>Vendors</h2>
                <p className='text-muted-foreground'>Here is a list of your all Vendors</p>
              </div>
              <CustomerCreateButton />
            </div>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              {isLoading ? (
                <p>Loading vendors data...</p>
              ) : (
                <VendorTable
                  data={vendors}
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  total={total}
                  onPageChange={handlePageChange}
                  onSearchChange={handleSearchChange}
                  initialDateRange={defaultDateRange}
                />
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className='mt-8'>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
              <div>
                <h2 className='text-2xl font-bold tracking-tight'>Products</h2>
                <p className='text-muted-foreground'>Here is a list of your all Products</p>
              </div>
              <ProductCreateButton />
            </div>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              {isProductLoading ? (
                <p>Loading products data...</p>
              ) : isProductError ? (
                <p>Error loading products.</p>
              ) : (
                <ProductTable
                  data={products}
                  pageIndex={productPageIndex}
                  pageSize={pageSize}
                  total={productTotal}
                  onPageChange={handleProductPageChange}
                  onSearchChange={handleProductSearchChange}
                />
              )}
            </div>
          </div>
        </Main>
        <VendorDialogs />
        <ProductDialogs />
      </ProductsProvider>
    </CustomersProvider>
  )
}

export default Vendors