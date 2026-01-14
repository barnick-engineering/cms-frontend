export interface Product {
  id: number
  name: string
  details: string
  price: string
}

export interface ProductFormInterface {
  name: string
  details: string
  price: number
}

export interface ProductListResponse {
  data: Product[]
  total: number
  prev_url: string | null
  next_url: string | null
  page: number
  response_code: number
  response: string
}

export type ProductListInterface = Product

export interface ProductMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Product
  onSave?: (updatedData: ProductFormInterface) => void
}

export interface DataTablePropsInterface {
  data: ProductListInterface[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  onSearchChange?: (searchBy?: string) => void
  rowSelection?: Record<string, boolean>
}
