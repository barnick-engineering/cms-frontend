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
const Products = lazy(() => import("@/pages/Products"))
const Inventory = lazy(() => import("@/pages/Inventory"))
const WorkOrders = lazy(() => import("@/pages/WorkOrders"))
const Expense = lazy(() => import("@/pages/Expense"))
const Reports = lazy(() => import("@/pages/Reports"))
const Teams = lazy(() => import("@/pages/Teams"))
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
                            <Route path="/products" element={<Products />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/work-orders" element={<WorkOrders />} />
                            <Route path="/expense" element={<Expense />} />
                            <Route path="/teams" element={<Teams />} />
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