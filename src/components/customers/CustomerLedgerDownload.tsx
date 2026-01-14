import { Download, Loader2 } from 'lucide-react'
import { useShopStore } from '@/stores/shopStore'
import { generatePDF } from '@/utils/enums/pdf'
import type { Entity } from '@/utils/enums/pdf'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTransactionLedger } from '@/hooks/useTransaction'
import { toast } from 'sonner'
import type { Customer } from '@/interface/customerInterface'

interface Props {
    customer: Customer
}

export const CustomerLedgerDownload = ({ customer }: Props) => {
    const { currentShopId, currentShopName } = useShopStore()

    const { isLoading, refetch } = useTransactionLedger(
        currentShopId ?? '',
        1,
        customer.id,
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

        try {
            // fetching latest data
            const { data: ledgerData } = await refetch()

            if (!ledgerData?.transactions?.length) {
                toast.warning('No transactions found for this customer')
                return
            }

            // preparing entity data for PDF
            const entity: Entity = {
                name: customer.name,
                no: customer.no ?? undefined,
                email: customer.email ?? undefined,
                phone: customer.phone ?? undefined,
                address: customer.address ?? undefined,
                city: customer.city ?? undefined,
                country: customer.country ?? undefined,
                shop: {
                    name: currentShopName || 'Shop',
                    address: undefined,
                },
            }

            // generate PDF
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

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleDownload}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Download customer ledger"
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