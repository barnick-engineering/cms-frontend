import { useMutation } from "@tanstack/react-query"
import type { UseMutationResult } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type {
    UserSignInInterface,
    AuthResponseInterface
} from "@/interface/userInterface"
import { signInUser, changePassword } from "@/api/userAuthApi"
import { useAuthStore } from "@/stores/authStore"
import type { AxiosError } from "axios"

export const useAuth = () => {
    const { setTokens } = useAuthStore()
    const navigate = useNavigate()

    // sign in
    const signInMutation: UseMutationResult<
        AuthResponseInterface,
        unknown,
        UserSignInInterface,
        unknown
    > = useMutation({
        mutationFn: async (data: UserSignInInterface) => {
            try {
                const authRes = await signInUser(data)

                console.log('Auth response received:', authRes)
                console.log('Response type:', typeof authRes)
                console.log('Response keys:', Object.keys(authRes || {}))

            // Extract tokens - handle multiple possible response structures:
            // 1. { access_token, refresh_token }
            // 2. { access, refresh }
            // 3. { data: { access_token, refresh_token } }
            // 4. { data: { access, refresh } }
            const accessToken = authRes?.access_token || 
                               authRes?.access || 
                               authRes?.data?.access_token || 
                               authRes?.data?.access
            
            const refreshToken = authRes?.refresh_token || 
                               authRes?.refresh || 
                               authRes?.data?.refresh_token || 
                               authRes?.data?.refresh

            console.log('Extracted tokens:', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                accessTokenLength: accessToken?.length,
                refreshTokenLength: refreshToken?.length,
                responseKeys: Object.keys(authRes || {})
            })

            // Validate tokens exist
            if (!accessToken || !refreshToken) {
                const errorMsg = `Missing tokens in response. Found keys: ${Object.keys(authRes || {}).join(', ')}`
                console.error(errorMsg)
                console.error('Full response:', JSON.stringify(authRes, null, 2))
                throw new Error(errorMsg)
            }

                // Save tokens synchronously - setTokens updates both Zustand store and localStorage
                setTokens(accessToken, refreshToken)

                // Verify tokens were saved immediately
                const savedAccessToken = localStorage.getItem("access_token")
                const savedRefreshToken = localStorage.getItem("refresh_token")

                if (!savedAccessToken || !savedRefreshToken) {
                    const errorMsg = 'Failed to save tokens to localStorage'
                    console.error(errorMsg)
                    throw new Error(errorMsg)
                }

                console.log('Tokens saved and verified successfully')
                return authRes
            } catch (error) {
                console.error('Error in mutationFn:', error)
                // Re-throw to be caught by onError
                throw error
            }
        },
        onSuccess: async () => {
            try {
                // Tokens are already saved in mutationFn, just verify one more time
                const token = localStorage.getItem("access_token")
                
                if (!token) {
                    // This should not happen if mutationFn worked correctly
                    console.error('Token not found in localStorage - this should not happen')
                    toast.error("Authentication failed. Please try again.")
                    return
                }

                if (import.meta.env.DEV) {
                    console.log('Login successful, navigating to dashboard')
                }

                toast.success("Logged in successfully!")
                // Navigate to dashboard - tokens are already saved and verified
                navigate("/", { replace: true })
            } catch (error) {
                console.error('Navigation error:', error)
                toast.error("Something went wrong.")
            }
        },
        onError: (err: any) => {
            console.error('Login error:', err)
            
            // Handle different error types
            if (err instanceof Error) {
                // Error thrown in mutationFn (e.g., missing tokens)
                console.error('Error message:', err.message)
                toast.error(err.message || "Failed to log in")
            } else if (err?.response) {
                // Axios error with response
                const axiosError = err as AxiosError<{ message?: string; detail?: string }>
                const errorMessage = axiosError.response?.data?.message || 
                                   axiosError.response?.data?.detail || 
                                   axiosError.message || 
                                   "Failed to log in"
                console.error('API error:', {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data,
                    message: errorMessage
                })
                toast.error(errorMessage)
            } else {
                // Network or other error
                console.error('Network or unknown error:', err)
                toast.error("Failed to log in. Please check your connection.")
            }
        },
    })

    return { signInMutation }
}

// change password
export const useChangePassword = () => {
    return useMutation({
        mutationFn: changePassword,
    })
}