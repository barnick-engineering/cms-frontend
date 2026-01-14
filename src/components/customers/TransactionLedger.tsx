import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Mail, MapPin, Phone, User, Building2, Download, Briefcase, Contact } from "lucide-react"
import { Badge } from "../ui/badge"
import { generatePDF } from "@/utils/enums/pdf"
import type { Entity } from "@/utils/enums/pdf"
import { Main } from "@/components/layout/main"
import { CustomersProvider } from "@/components/customers/customer-provider"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import VendorDialogs from "@/components/vendors/VendorDialogs"
import { useShopStore } from "@/stores/shopStore"
import TransactionLedgerTable from "./TransactionLedgerTable"
import { useTransactionLedger } from "@/hooks/useTransaction"
import { useCustomerById } from "@/hooks/useCustomer"
import { useVendorById } from "@/hooks/useVendor"
import { format, subDays } from "date-fns"

const TransactionLedger = () => {
  const shopId = useShopStore((s) => s.currentShopId)

  // Now we have the type in URL
  const { id: entityId, type } = useParams<{ id: string; type: "vendor" | "customer" }>()

  // Default to last 30 days
  const defaultDateRange = useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)
    return {
      from: thirtyDaysAgo,
      to: today
    }
  }, [])

  const [pageIndex, setPageIndex] = useState(0)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(defaultDateRange)
  const [startDate, setStartDate] = useState<string>(format(defaultDateRange.from, 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(defaultDateRange.to, 'yyyy-MM-dd'))
  const pageSize = 10

  const isVendor = type === "vendor"
  const isCustomer = type === "customer"

  // always call hooks — only one will execute due to enabled flag
  const {
    data: customer,
    isLoading: isCustomerLoading,
  } = useCustomerById(shopId ?? "", entityId ?? "", {
    enabled: isCustomer, // only run customer API when type = "customer"
  })

  const {
    data: vendor,
    isLoading: isVendorLoading,
  } = useVendorById(shopId ?? "", entityId ?? "", {
    enabled: isVendor, // only run vendor API when type = "vendor"
  })

  // choose correct entity
  const entity = customer || vendor

  // ledger fetch (shared)
  const { data, isLoading, isError } = useTransactionLedger(
    shopId ?? "",
    pageIndex + 1,
    entityId ?? "",
    pageSize,
    undefined,
    startDate,
    endDate
  )

  const transactions = data?.transactions ?? []
  const total = data?.total ?? 0
  const totalAmount = data?.totalAmount ?? 0
  const totalPaid = data?.paid ?? 0
  const totalPending = data?.totalPending ?? 0

  // loading handler
  if (isCustomerLoading || isVendorLoading) {
    return <p>Loading details...</p>
  }

  // no entity found
  if (!entity) {
    return (
      <p className="text-red-500 text-center mt-4">
        No {type} found.
      </p>
    )
  }

  return (
    <CustomersProvider>
      <Main>
        <div className="space-y-6">

          {/* entity info card */}
          <Card className="rounded-2xl shadow-sm border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                {isCustomer ? (
                  <User className="h-8 w-8 text-primary" />
                ) : (
                  <Building2 className="h-8 w-8 text-primary" />
                )}
                {entity.name}
              </CardTitle>
              <CardDescription>
                No: {entity.no || <span className="text-muted-foreground">N/A</span>}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Contact Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Contact className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Contact Information
                    </h3>
                  </div>
                  <div className="space-y-3.5">
                    {entity.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                          <p className="text-sm font-medium break-all">{entity.email}</p>
                        </div>
                      </div>
                    )}
                    {entity.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                          <p className="text-sm font-medium">{entity.phone}</p>
                        </div>
                      </div>
                    )}
                    {(entity.address || entity.city) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                          <p className="text-sm font-medium">
                            {[entity.address, entity.city].filter(Boolean).join(", ") || "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Business Details
                    </h3>
                  </div>
                  <div className="space-y-3.5">
                    {isCustomer && entity.shop?.name && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Shop</p>
                        <p className="text-sm font-medium">{entity.shop.name}</p>
                      </div>
                    )}
                    {isCustomer && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Business Type</p>
                        {entity.isB2B ? (
                          <Badge variant="default" className="text-xs">B2B</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Individual</Badge>
                        )}
                      </div>
                    )}
                    {(entity.contactPerson || entity.contactPersonPhone) && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Contact Person</p>
                        <p className="text-sm font-medium">
                          {entity.contactPerson && entity.contactPersonPhone
                            ? `${entity.contactPerson} (${entity.contactPersonPhone})`
                            : entity.contactPerson || entity.contactPersonPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* ledger section */}
          {transactions.length > 0 && (
            <Card className="rounded-2xl shadow-sm border bg-card">
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h3 className="text-lg font-semibold">
                    {isCustomer ? "Customer Ledger" : "Vendor Ledger"}
                  </h3>

                  {isLoading ? (
                    <div className="flex flex-wrap gap-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-32 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="font-semibold">{totalAmount}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-green-100 text-green-700 dark:bg-green-900/30 px-3 py-2 rounded-lg">
                        <span className="text-sm">Paid</span>
                        <span className="font-semibold">{totalPaid}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-red-100 text-red-700 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                        <span className="text-sm">Balance</span>
                        <span className="font-semibold">{totalPending}</span>
                      </div>

                      <Button
                        onClick={() => generatePDF(entity as Entity, transactions, {
                          totalAmount,
                          totalPaid,
                        })}
                        variant="default"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  )}
                </div>

                {/* table */}
                {isLoading ? (
                  <p>Loading transactions...</p>
                ) : isError ? (
                  <p className="text-red-500">Failed to load transactions</p>
                ) : (
                  <TransactionLedgerTable
                    data={transactions}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPageIndex}
                    initialDateRange={dateRange}
                    onDateChange={(from, to) => {
                      if (from && to) {
                        setDateRange({ from, to })
                        setStartDate(format(from, 'yyyy-MM-dd'))
                        setEndDate(format(to, 'yyyy-MM-dd'))
                        setPageIndex(0) // Reset to first page when date range changes
                      } else {
                        setDateRange(defaultDateRange)
                        setStartDate(format(defaultDateRange.from, 'yyyy-MM-dd'))
                        setEndDate(format(defaultDateRange.to, 'yyyy-MM-dd'))
                        setPageIndex(0) // Reset to first page when date range is cleared
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* if no transactions */}
          {transactions.length === 0 && !isLoading && (
            <Card className="rounded-2xl shadow-sm border bg-card">
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h3 className="text-lg font-semibold">
                    {isCustomer ? "Customer Ledger" : "Vendor Ledger"}
                  </h3>
                </div>

                {/* table */}
                {isLoading ? (
                  <p>Loading transactions...</p>
                ) : isError ? (
                  <p className="text-red-500">Failed to load transactions</p>
                ) : (
                  <TransactionLedgerTable
                    data={transactions}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPageIndex}
                    initialDateRange={dateRange}
                    onDateChange={(from, to) => {
                      if (from && to) {
                        setDateRange({ from, to })
                        setStartDate(format(from, 'yyyy-MM-dd'))
                        setEndDate(format(to, 'yyyy-MM-dd'))
                        setPageIndex(0) // Reset to first page when date range changes
                      } else {
                        setDateRange(defaultDateRange)
                        setStartDate(format(defaultDateRange.from, 'yyyy-MM-dd'))
                        setEndDate(format(defaultDateRange.to, 'yyyy-MM-dd'))
                        setPageIndex(0) // Reset to first page when date range is cleared
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </Main>
      <VendorDialogs />
    </CustomersProvider>
  )
}

export default TransactionLedger