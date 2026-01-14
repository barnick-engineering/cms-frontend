import type { TransactionLedgerInterface } from '@/interface/transactionInterface'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function DetailsRow({
    row,
}: {
    row: TransactionLedgerInterface
}) {
    if (!row.details || row.details.length === 0) {
        return (
            <div className="text-sm text-muted-foreground py-2">
                No details available
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-muted/30">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Inventory</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {row.details.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.inventory?.name ?? 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    {Number(item.quantity || 0).toFixed(2)} {item.unitOfMeasurement?.name ?? ''}
                                </TableCell>
                                <TableCell className="text-right">
                                    {Number(item.price || 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {Number(item.total || 0).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}