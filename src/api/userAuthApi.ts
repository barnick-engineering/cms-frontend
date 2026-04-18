import axios from "axios"
import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { UserSignInInterface, AuthResponseInterface } from "@/interface/userInterface"

/** Extract JWT pair from login/refresh-style responses. */
export function extractTokensFromAuthResponse(
  authRes: AuthResponseInterface | Record<string, unknown> | null | undefined
): { access: string; refresh: string } | null {
  if (!authRes) return null
  const r = authRes as AuthResponseInterface
  const accessToken =
    r.access_token ||
    r.access ||
    r.data?.access_token ||
    r.data?.access

  const refreshToken =
    r.refresh_token ||
    r.refresh ||
    r.data?.refresh_token ||
    r.data?.refresh

  if (!accessToken || !refreshToken) return null
  return { access: accessToken, refresh: refreshToken }
}

/** Backend envelope: `{ data, response_message, response_code }` */
function parseBackendError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { response_message?: unknown; detail?: unknown }
      | undefined
    if (data?.response_message != null) {
      const msg = data.response_message
      if (typeof msg === "string") return msg
      if (typeof msg === "object" && msg !== null) {
        const parts = Object.values(msg as Record<string, unknown>).flatMap((v) =>
          Array.isArray(v) ? v.map(String) : [String(v)]
        )
        if (parts.length) return parts.join(" ")
        return JSON.stringify(msg)
      }
    }
    if (typeof data?.detail === "string") return data.detail
    if (Array.isArray(data?.detail)) return data.detail.map(String).join(" ")
  }
  if (error instanceof Error) return error.message
  return "Something went wrong."
}

export { parseBackendError }

// signin user
export const signInUser = async (
  data: UserSignInInterface
): Promise<AuthResponseInterface> => {
  const response = await axiosInstance.post(apiEndpoints.auth.signIn, data)
  return response.data
}

export type RegisterPayload = {
  email: string
  password: string
  confirm_password: string
  first_name?: string
  last_name?: string
}

export const registerUser = async (payload: RegisterPayload) => {
  const res = await axiosInstance.post(apiEndpoints.auth.register, payload)
  return res.data
}

export const forgotPasswordRequest = async (email: string) => {
  const res = await axiosInstance.post(apiEndpoints.auth.forgotPassword, {
    email,
  })
  return res.data
}

export type ResetPasswordPayload = {
  uid: string
  token: string
  new_password: string
  confirm_password: string
}

export const resetPasswordRequest = async (payload: ResetPasswordPayload) => {
  const res = await axiosInstance.post(apiEndpoints.auth.resetPassword, payload)
  return res.data
}

export type ChangePasswordPayload = {
  old_password: string
  new_password: string
  confirm_password: string
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const res = await axiosInstance.put(apiEndpoints.user.changePassword, payload)
  return res.data
}
