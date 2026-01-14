import { useCallback, useState, useMemo } from "react"
import { subDays } from "date-fns"
import { Main } from "@/components/layout/main"
import { useShopStore } from "@/stores/shopStore"
import { useInventoryList } from "@/hooks/useInventory"
import InventoryTable from "@/components/inventory/InventoryTable"
import InventoryDialogs from "@/components/inventory/InventoryDialogs"
import { InventoryProvider } from "@/components/inventory/inventory-provider"
import InventoryCreateButton from "@/components/inventory/InventoryCreateButton"

const Inventory = () => {
    const shopId = useShopStore(s => s.currentShopId)
    const [pageIndex, setPageIndex] = useState(0)
    const [searchBy, setSearchBy] = useState('')
    
    // Default date range: last 30 days
    const defaultDateRange = useMemo(() => {
        const today = new Date()
        const thirtyDaysAgo = subDays(today, 30)
        return {
            from: thirtyDaysAgo,
            to: today
        }
    }, [])
    
    const [startDate, setStartDate] = useState<Date | undefined>(defaultDateRange.from)
    const [endDate, setEndDate] = useState<Date | undefined>(defaultDateRange.to)
    const pageSize = 10

    const handlePageChange = useCallback((index: number) => {
        setPageIndex(index)
    }, [])

    const handleSearchChange = useCallback((value: string) => {
        setSearchBy(value)
    }, [])

    const handleDateChange = useCallback((from?: Date, to?: Date) => {
        setStartDate(from)
        setEndDate(to)
        setPageIndex(0)
    }, [])

    const { data, isLoading, isError } = useInventoryList(
        shopId || '',
        pageIndex + 1,
        pageSize,
        searchBy,
        startDate,
        endDate
    )

    if (isError) return <p>Error loading inventories.</p>

    const inventories = data?.items || []
    const total = data?.total || 0

    return (
        <InventoryProvider>
            <Main>
                <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Inventory</h2>
                        <p className='text-muted-foreground'>Here is a list of your all Inventories</p>
                    </div>
                    <InventoryCreateButton />
                </div>
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    {isLoading ? (
                        <p>Loading inventories data...</p>
                    ) : (
                        <InventoryTable
                            data={inventories}
                            pageIndex={pageIndex}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={handlePageChange}
                            onSearchChange={handleSearchChange}
                            onDateChange={handleDateChange}
                        />
                    )}
                </div>
            </Main>
            <InventoryDialogs />
        </InventoryProvider>
    )
}

export default Inventory