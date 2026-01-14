import { useParams } from "react-router-dom"
import { Main } from "@/components/layout/main"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { useTransactionById } from "@/hooks/useTransaction"
import { useShopStore } from "@/stores/shopStore"
import { TransactionDetailsTable } from "./TransactionDetailsTable"
import { TransactionDetailsDownload } from "./TransactionDetailsDownload"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip"
import { Receipt, User, Calendar, CreditCard, FileText, DollarSign, CheckCircle2, Clock, Briefcase } from "lucide-react"
import { Badge } from "../ui/badge"

const TransactionDetails = () => {
    const { id } = useParams<{ id: string }>()
    const shopId = useShopStore((s) => s.currentShopId)
    const { data: transaction, isLoading, isError } = useTransactionById(shopId ?? "", id ?? "")

    if (isLoading) return <Main><p>Loading transaction details...</p></Main>
    if (isError) return <Main><p className="text-red-500">Failed to load transaction.</p></Main>

    if (!transaction) return <Main><p>No transaction found.</p></Main>

    const showDetailsTable = transaction.transactionType === "PURCHASE" || transaction.transactionType === "SALE"

    const name = transaction.vendor?.name ?? transaction.customer?.name ?? "N/A"
    const partnerType = transaction.vendor ? "Vendor" : transaction.customer ? "Customer" : "N/A"
    const paymentType = (transaction.paymentType ?? "N/A").replace("_", " ")
    const status = transaction.transactionStatus ?? "Pending"
    const isPaid = transaction.isPaid || transaction.pending === 0

    return (
        <Main>
            <div className="space-y-6">
                {/* Transaction Info Card */}
                <Card className="rounded-2xl shadow-sm border bg-card">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Receipt className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Transaction #{transaction.no}</CardTitle>
                                    <CardDescription>
                                        Type: {transaction.transactionType}
                                    </CardDescription>
                                </div>
                            </div>
                            <TransactionDetailsDownload transaction={transaction} />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Transaction Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                        Transaction Information
                                    </h3>
                                </div>
                                <div className="space-y-3.5">
                                    {name && (
                                        <div className="flex items-start gap-3">
                                            <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-muted-foreground mb-0.5">{partnerType}</p>
                                                <p className="text-sm font-medium">{name}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-0.5">Payment Type</p>
                                            <p className="text-sm font-medium">{paymentType}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        {isPaid ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                        ) : (
                                            <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                                            <Badge 
                                                variant={isPaid ? "default" : "secondary"}
                                                className="text-xs"
                                            >
                                                {status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Details Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                        Financial Details
                                    </h3>
                                </div>
                                <div className="space-y-3.5">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
                                        <p className="text-sm font-medium">{transaction.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Paid</p>
                                        <p className="text-sm font-medium text-green-600">{transaction.paid.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Pending</p>
                                        <p className="text-sm font-medium text-amber-600">{transaction.pending.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                        Timeline
                                    </h3>
                                </div>
                                <div className="space-y-3.5">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Created At</p>
                                        <p className="text-sm font-medium">
                                            {new Date(transaction.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Updated At</p>
                                        <p className="text-sm font-medium">
                                            {new Date(transaction.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                        Additional Information
                                    </h3>
                                </div>
                                <div className="space-y-3.5">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Remarks</p>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="text-sm font-medium truncate cursor-help">
                                                        {transaction.remarks || "N/A"}
                                                    </p>
                                                </TooltipTrigger>
                                                {transaction.remarks && (
                                                    <TooltipContent className="max-w-xs">
                                                        <p className="break-words">{transaction.remarks}</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction Details Table */}
                {showDetailsTable && (
                    <Card className="rounded-2xl shadow-sm border bg-card">
                        <CardHeader>
                            <CardTitle>Transaction Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transaction.details?.length ? (
                                <TransactionDetailsTable data={transaction.details} />
                            ) : (
                                <p className="text-muted-foreground">No details found.</p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Main>
    )
}

export default TransactionDetails