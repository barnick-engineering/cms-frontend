import { useState } from "react"
import { useParams } from "react-router-dom"
import { Main } from "@/components/layout/main"
import { CustomersProvider } from "@/components/customers/customer-provider"
import VendorDialogs from "@/components/vendors/VendorDialogs"
import { useShopStore } from "@/stores/shopStore"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, User, Briefcase, Contact } from "lucide-react"
import { useCustomerById, useCustomerTransactions } from "@/hooks/useCustomer"
import CustomerTransactionsTable from "./CustomerTransactionsTable"

const CustomerTransactionsProfile = () => {
  const shopId = useShopStore((s) => s.currentShopId)
  const [startDate, setStartDate] = useState<string>()
  const [endDate, setEndDate] = useState<string>()
  const { id } = useParams<{ id: string }>()
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  // Fetch customer info
  const { data: customer, isLoading: isCustomerLoading, isError: isCustomerError } =
    useCustomerById(shopId ?? "", id ?? "")

  // Fetch customer transactions
  const {
    data: transactionsResponse,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useCustomerTransactions(
    id ?? "",
    pageIndex,
    pageSize,
    startDate,
    endDate
  )

  const transactions = transactionsResponse?.data ?? []
  const total = transactionsResponse?.total ?? 0

  return (
    <CustomersProvider>
      <Main>
        {isCustomerLoading && <p>Loading customer details...</p>}
        {isCustomerError && <p className="text-red-500">Failed to load customer</p>}

        {customer && (
          <Card className="rounded-2xl shadow-sm border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                {customer.name}
              </CardTitle>
              <CardDescription>No: {customer.no}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Info */}
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
                    {customer.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                          <p className="text-sm font-medium break-all">{customer.email}</p>
                        </div>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                          <p className="text-sm font-medium">{customer.phone}</p>
                        </div>
                      </div>
                    )}
                    {(customer.address || customer.city) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                          <p className="text-sm font-medium">
                            {[customer.address, customer.city].filter(Boolean).join(", ") || "N/A"}
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
                    {customer.shop?.name && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Shop</p>
                        <p className="text-sm font-medium">{customer.shop.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Business Type</p>
                      {customer.isB2B ? (
                        <Badge variant="default" className="text-xs">B2B</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Individual</Badge>
                      )}
                    </div>
                    {(customer.contactPerson || customer.contactPersonPhone) && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Contact Person</p>
                        <p className="text-sm font-medium">
                          {customer.contactPerson && customer.contactPersonPhone
                            ? `${customer.contactPerson} (${customer.contactPersonPhone})`
                            : customer.contactPerson || customer.contactPersonPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Transactions Table */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Transactions</h3>
                {isTransactionsLoading && <p>Loading transactions...</p>}
                {isTransactionsError && (
                  <p className="text-red-500">Failed to load transactions</p>
                )}
                {!isTransactionsLoading && transactions.length > 0 && (
                  <CustomerTransactionsTable
                    data={transactions}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPageIndex}
                    onDateChange={(from, to) => {
                      setStartDate(from)
                      setEndDate(to)
                    }}
                  />
                )}
                {!isTransactionsLoading && transactions.length === 0 && (
                  <p>No transactions found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </Main>

      <VendorDialogs />
    </CustomersProvider>
  )
}

export default CustomerTransactionsProfile