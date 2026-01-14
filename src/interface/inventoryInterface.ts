export interface UnitOfMeasurement {
  id: string
  name: string
}
export interface InventoryItemInterface {
  id: string
  no?: string
  shopId?: string
  name: string
  description?: string
  quantity: number
  unitOfMeasurement?: UnitOfMeasurement
  lastPrice: number
  createdAt?: string
  updatedAt?: string
}

export interface InventoryItem {
  id: string
  name: string
  price?: number
  stock?: number
  description?: string
  unitOfMeasurement?: {
    id: string
    name: string
  }
}

export interface InventoryFormInterface {
  id?: string
  name: string
  description?: string
  quantity: number
  lastPrice: number
  shopId: string
}

export interface InventoryListItem {
  id: string
  name: string
  description?: string
  quantity: number
  lastPrice: number
  shopId?: string
  createdAt?: string
  updatedAt?: string
}

export interface InventoryListApiResponseInterface {
  data: InventoryListResponseInterface
}

export interface InventoryListResponseInterface {
  data: InventoryListItem[]
  pagination: {
    total: number
    page: number
    limit: number
  }
}
export interface InventoryMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: InventoryItemInterface
  onSave?: (data: InventoryFormInterface) => void
}

export interface InventoryTableProps {
  data: InventoryItemInterface[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (index: number) => void
  onSearchChange: (value: string) => void
  onDateChange?: (from?: Date, to?: Date) => void
}

export interface InventoryDetailInterface {
  no: string
  id: string
  name: string
  description: string
  quantity: string
  lastPrice: string
}

export interface InventoryItem {
  id: string;
  name: string;
  lastPrice: number;
  quantity: number;
}

export interface InventoryTrackingItemInterface {
  id: string
  inventory: {
    id: string
    name: string
  }
  stock: number
  price: number
  isPurchased?: boolean
  createdAt: string
  updatedAt: string
}