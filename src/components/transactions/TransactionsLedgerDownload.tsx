import { Download, Loader2 } from 'lucide-react'
import { useShopStore } from '@/stores/shopStore'
import { generatePDF } from '@/utils/enums/pdf'
import type { Entity } from '@/utils/enums/pdf'
import type { Transaction } from '@/interface/transactionInterface'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTransactionLedger } from '@/hooks/useTransaction'
import { toast } from 'sonner'

interface Props {
    transaction: Transaction
}

export const TransactionsLedgerDownload = ({ transaction }: Props) => {
    const { currentShopId, currentShopName } = useShopStore()

    // Determine which entity (vendor or customer) this transaction belongs to
    const entityId = transaction.vendor?.id || transaction.customer?.id
    const entityName = transaction.vendor?.name || transaction.customer?.name
    const entityType = transaction.vendor ? 'vendor' : 'customer'

    const { isLoading, refetch } = useTransactionLedger(
        currentShopId ?? '',
        1,
        entityId ?? '',
        10,
        undefined,
        undefined,
        undefined,
        { enabled: false },
    )

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!currentShopId) {
            toast.error('Shop ID is missing')
            return
        }

        if (!entityId) {
            toast.error('No vendor or customer associated with this transaction')
            return
        }

        try {
            // Fetch latest data
            const { data: ledgerData } = await refetch()

            if (!ledgerData?.transactions?.length) {
                toast.warning(`No transactions found for this ${entityType}`)
                return
            }

            // Prepare entity data for PDF
            const entity: Entity = {
                name: entityName || 'Unknown',
                no: undefined,
                email: undefined,
                phone: undefined,
                address: undefined,
                city: undefined,
                country: undefined,
                shop: {
                    name: currentShopName || 'Shop',
                    address: undefined,
                },
            }

            // Generate PDF
            generatePDF(entity, ledgerData.transactions, {
                totalAmount: ledgerData.totalAmount || 0,
                totalPaid: ledgerData.paid || 0,
            })

            toast.success('Ledger report downloaded successfully')
        } catch (error) {
            console.error('Download error:', error)
            toast.error('Failed to download ledger report. Please try again.')
        }
    }

    // Don't show button if there's no vendor or customer
    if (!entityId) {
        return null
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleDownload}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Download ${entityType} ledger`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                            <Download className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Download PDF</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}