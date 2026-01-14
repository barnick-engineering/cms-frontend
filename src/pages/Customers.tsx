import { useCallback, useState } from 'react'
import { Main } from '@/components/layout/main'
import { CustomersProvider } from '@/components/customers/customer-provider'
import { useCustomerList } from '@/hooks/useCustomer'
import CustomerCreateButton from '@/components/customers/CustomerCreateButton'
import CustomerTable from '@/components/customers/CustomerTable'
import CustomersDialogs from '@/components/customers/CustomersDialogs'

const Customers = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const [searchBy, setSearchBy] = useState('')
  const pageSize = 10
  const offset = pageIndex * pageSize

  // useCallback ensures stable function references
  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleSearchChange = useCallback((value?: string) => {
    setSearchBy(value || '')
    setPageIndex(0) // Reset to first page on search
  }, [])

  const { data, isLoading, isError } = useCustomerList(
    searchBy || undefined,
    pageSize,
    offset
  )

  if (isError) return <p>Error loading customers.</p>

  const customers = data?.data || []
  const total = data?.total || 0

  return (
    <CustomersProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Customers</h2>
            <p className='text-muted-foreground'>
              Here is a list of your all Customers
            </p>
          </div>
          <CustomerCreateButton />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <p>Loading customers data...</p>
          ) : (
            <CustomerTable
              data={customers}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
            />
          )}
        </div>
      </Main>
      <CustomersDialogs />
    </CustomersProvider>
  )
}

export default Customers