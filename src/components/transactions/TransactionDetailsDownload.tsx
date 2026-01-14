import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useShopStore } from '@/stores/shopStore'
import { generateTransactionDetailsPDF } from '@/utils/enums/transactionDetailsPdf'
import type { Transaction } from '@/interface/transactionInterface'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
    transaction: Transaction
}

export const TransactionDetailsDownload = ({ transaction }: Props) => {
    const { currentShopName } = useShopStore()
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!currentShopName) {
            toast.error('Shop name is missing')
            return
        }

        try {
            setIsDownloading(true)
            generateTransactionDetailsPDF(transaction, currentShopName)
            toast.success('Transaction report downloaded successfully')
        } catch (error) {
            console.error('Download error:', error)
            toast.error('Failed to download transaction report. Please try again.')
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant="default"
            className="gap-2"
        >
            {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            Download PDF
        </Button>
    )
}
