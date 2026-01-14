import { Download, Loader2 } from 'lucide-react'
import { useShopStore } from '@/stores/shopStore'
import { generatePDF } from '@/utils/enums/pdf'
import type { Entity } from '@/utils/enums/pdf'
import type { Vendor } from '@/interface/vendorInterface'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTransactionLedger } from '@/hooks/useTransaction'
import { toast } from 'sonner'
import { useState } from 'react'

interface Props {
    vendor: Vendor
}

export const VendorLedgerDownload = ({ vendor }: Props) => {
    const { currentShopId, currentShopName } = useShopStore()
    const [isDownloading, setIsDownloading] = useState(false)

    // only fetch when needed
    const { refetch } = useTransactionLedger(
        currentShopId ?? '',
        1,
        vendor.id,
        10,
        undefined,
        undefined,
        undefined,
        { enabled: false }
    )

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!currentShopId) {
            toast.error('Shop ID is missing')
            return
        }

        setIsDownloading(true)

        try {
            // Fetch data only when download is clicked
            const { data: ledgerData } = await refetch()

            if (!ledgerData?.transactions?.length) {
                toast.warning('No transactions found for this vendor')
                return
            }

            // preparing entity data for PDF
            const entity: Entity = {
                name: vendor.name,
                no: vendor.no ?? undefined,
                email: vendor.email ?? undefined,
                phone: vendor.phone ?? undefined,
                address: vendor.address ?? undefined,
                city: vendor.city ?? undefined,
                country: vendor.country ?? undefined,
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
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Download vendor ledger"
                    >
                        {isDownloading ? (
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