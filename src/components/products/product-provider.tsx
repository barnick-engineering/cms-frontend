import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Product } from '@/interface/productInterface'

type ProductDialogType = 'create' | 'update' | 'delete' | 'view'

type ProductContextType = {
  open: ProductDialogType | null
  setOpen: (str: ProductDialogType | null) => void
  currentRow: Product | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Product | null>>
}

const ProductContext = React.createContext<ProductContextType | null>(null)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ProductDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Product | null>(null)

  return (
    <ProductContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProductContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const productsContext = React.useContext(ProductContext)

  if (!productsContext) {
    throw new Error('useProducts has to be used within <ProductsProvider>')
  }

  return productsContext
}
