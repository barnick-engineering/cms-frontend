import { Fragment } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { GlobalAiChat } from "@/components/ai-chat/GlobalAiChat"

const ProtectedRoute = () => {
    // Check localStorage directly for more reliable authentication check
    const token = localStorage.getItem("access_token")
    const isAuthenticated = !!token

    return isAuthenticated ? (
        <Fragment>
            <Outlet />
            <GlobalAiChat />
        </Fragment>
    ) : (
        <Navigate to="/sign-in" replace />
    )
}

export default ProtectedRoute