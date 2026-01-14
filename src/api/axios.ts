import axios from 'axios'
import { apiEndpoints, BASE_URL } from '@/config/api'

// Log BASE_URL in development for debugging
if (import.meta.env.DEV) {
  console.log('API BASE_URL:', BASE_URL)
}

// axios instance
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// attach access token to every request
axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token')
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return config
})

// handle token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    console.log(error.response?.status)

    if (error.response?.status === 401) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        localStorage.clear()
        if (window.location.pathname !== '/sign-in') {
          window.location.href = '/sign-in'
        }
        return Promise.reject(error)
      }

      try {
        console.log('moved into try')
        const res = await axiosInstance.post(apiEndpoints.auth.refresh, {
          refreshToken: refreshToken,
        })
        const { access_token, refresh_token } = res.data

        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        originalRequest.headers['Authorization'] = `Bearer ${access_token}`
        return axiosInstance(originalRequest)
      } catch (err) {
        localStorage.clear()
        window.location.href = '/sign-in'
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)
