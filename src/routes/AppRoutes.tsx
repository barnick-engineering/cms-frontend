import { Suspense, lazy } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import ProtectedRoute from "./ProtectedRoute"
import AuthenticatedLayout from "@/components/layout/authenticated-layout"
import Loader from "@/components/layout/Loader"

// Lazy load pages
const SignIn = lazy(() => import("@/pages/SignIn"))
const Dashboard = lazy(() => import("@/pages/Dashboard"))
const Customers = lazy(() => import("@/pages/Customers"))
const CustomerTransactionsProfile = lazy(() => import("@/components/customers/CustomerTransactionsProfile"))
const Products = lazy(() => import("@/pages/Products"))
const Inventory = lazy(() => import("@/pages/Inventory"))
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"))
const TransactionDetails = lazy(() => import("@/components/transactions/TransactionDetails"))
const Expense = lazy(() => import("@/pages/Expense"))
const Reports = lazy(() => import("@/pages/Reports"))
const Plans = lazy(() => import("@/pages/Plans"))
const Users = lazy(() => import("@/pages/Users"))
const UserProfile = lazy(() => import("@/components/users/UserProfile"))
const Settings = lazy(() => import("@/features/settings"))
const ComingSoon = lazy(() => import("@/components/coming-soon"))
const ChangePassword = lazy(() => import("@/pages/ChangePassword"))

const AppRoutes = () => {

    return (
        <>
            <Toaster position="top-center" />
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/sign-in" element={<SignIn />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/change-password" element={<ChangePassword />} />
                        <Route element={<AuthenticatedLayout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/customer/:id" element={<CustomerTransactionsProfile />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/plans" element={<Plans />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/transactions" element={<TransactionsPage />} />
                            <Route path="/transactions/:id" element={<TransactionDetails />} />
                            <Route path="/expense" element={<Expense />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/user/me" element={<UserProfile />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/help-center" element={<ComingSoon />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Route>
                </Routes>
            </Suspense>
        </>
    )
}

export default AppRoutes