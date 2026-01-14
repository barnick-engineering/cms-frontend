import type { ColumnDef } from '@tanstack/react-table'
import type { InventoryTrackingItemInterface } from '@/interface/inventoryInterface'

export const trackingColumns: ColumnDef<InventoryTrackingItemInterface>[] = [
    {
        accessorKey: 'inventory.name',
        header: 'Inventory Name',
        cell: ({ row }) => row.original.inventory.name,
    },
    {
        accessorKey: 'isPurchased',
        header: 'Type',
        cell: ({ getValue }) => getValue<boolean>() ? 'PURCHASE' : 'SALE'
    },
    {
        accessorKey: 'stock',
        header: 'Stock',
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ getValue }) => `${getValue<number>()}`,
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
    },
]