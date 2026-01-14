import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoute = () => {
    // Check localStorage directly for more reliable authentication check
    const token = localStorage.getItem("access_token")
    const isAuthenticated = !!token

    return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" replace />
}

export default ProtectedRoute