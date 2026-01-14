import { useCallback, useState } from 'react'
import { Main } from '@/components/layout/main'
import { ProductsProvider } from '@/components/products/product-provider'
import { useProductList } from '@/hooks/useProduct'
import ProductCreateButton from '@/components/products/ProductCreateButton'
import ProductTable from '@/components/products/ProductTable'
import ProductDialogs from '@/components/products/ProductDialogs'

const Products = () => {
  const [productPageIndex, setProductPageIndex] = useState(0)
  const [productSearchBy, setProductSearchBy] = useState('')
  const pageSize = 10
  const productOffset = productPageIndex * pageSize

  const handleProductPageChange = useCallback((index: number) => {
    setProductPageIndex(index)
  }, [])

  const handleProductSearchChange = useCallback((value?: string) => {
    setProductSearchBy(value || '')
    setProductPageIndex(0)
  }, [])

  const { data: productData, isLoading: isProductLoading, isError: isProductError } = useProductList(
    productSearchBy || undefined,
    pageSize,
    productOffset
  )

  const products = productData?.data || []
  const productTotal = productData?.total || 0

  return (
    <ProductsProvider>
      <Main>
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
      </Main>
      <ProductDialogs />
    </ProductsProvider>
  )
}

export default Products
