import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { UserSignInInterface, AuthResponseInterface } from "@/interface/userInterface"

// signin user
export const signInUser = async (data: UserSignInInterface): Promise<AuthResponseInterface> => {
    try {
        console.log('Login request:', {
            endpoint: apiEndpoints.auth.signIn,
            baseURL: axiosInstance.defaults.baseURL,
            fullURL: `${axiosInstance.defaults.baseURL}${apiEndpoints.auth.signIn}`,
            data
        })
        
        const response = await axiosInstance.post(apiEndpoints.auth.signIn, data)
        
        console.log('Login response status:', response.status)
        console.log('Login response data:', response.data)
        console.log('Response data type:', typeof response.data)
        console.log('Response data keys:', Object.keys(response.data || {}))
        
        // Return the full response - let the hook handle extraction
        return response.data
    } catch (error: any) {
        console.error('Login API error:', error)
        console.error('Error response:', error?.response)
        console.error('Error status:', error?.response?.status)
        console.error('Error data:', error?.response?.data)
        // Re-throw to be handled by the mutation's onError
        throw error
    }
}

// change password
export const changePassword = async (data: {
    oldPassword: string
    newPassword: string
}) => {
    const res = await axiosInstance.put(apiEndpoints.user.changePassword, data)
    return res.data
}