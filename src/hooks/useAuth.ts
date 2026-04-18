import { useMutation } from "@tanstack/react-query"
import type { UseMutationResult } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type {
  UserSignInInterface,
  AuthResponseInterface,
} from "@/interface/userInterface"
import {
  signInUser,
  changePassword,
  registerUser,
  forgotPasswordRequest,
  resetPasswordRequest,
  parseBackendError,
  extractTokensFromAuthResponse,
  type RegisterPayload,
  type ResetPasswordPayload,
} from "@/api/userAuthApi"
import { useAuthStore } from "@/stores/authStore"
import type { AxiosError } from "axios"
import type { ChangePasswordFormValues } from "@/schema/changePasswordSchema"

export const useAuth = () => {
  const { setTokens } = useAuthStore()
  const navigate = useNavigate()

  const signInMutation: UseMutationResult<
    AuthResponseInterface,
    unknown,
    UserSignInInterface,
    unknown
  > = useMutation({
    mutationFn: async (data: UserSignInInterface) => {
      const authRes = await signInUser(data)
      const tokens = extractTokensFromAuthResponse(authRes)

      if (!tokens) {
        throw new Error(
          `Missing tokens in response. Found keys: ${Object.keys(authRes || {}).join(", ")}`
        )
      }

      setTokens(tokens.access, tokens.refresh)
      localStorage.setItem("userEmail", data.email)

      const savedAccessToken = localStorage.getItem("access_token")
      const savedRefreshToken = localStorage.getItem("refresh_token")

      if (!savedAccessToken || !savedRefreshToken) {
        throw new Error("Failed to save tokens to localStorage")
      }

      return authRes
    },
    onSuccess: async () => {
      const token = localStorage.getItem("access_token")

      if (!token) {
        toast.error("Authentication failed. Please try again.")
        return
      }

      toast.success("Logged in successfully!")
      navigate("/", { replace: true })
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to log in")
      } else if ((err as AxiosError)?.response) {
        const axiosError = err as AxiosError<{ message?: string; detail?: string }>
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.detail ||
          parseBackendError(err) ||
          axiosError.message ||
          "Failed to log in"
        toast.error(errorMessage)
      } else {
        toast.error(parseBackendError(err) || "Failed to log in. Please check your connection.")
      }
    },
  })

  return { signInMutation }
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordFormValues) => {
      try {
        await changePassword({
          old_password: data.oldPassword,
          new_password: data.newPassword,
          confirm_password: data.confirmPassword,
        })
      } catch (e) {
        throw new Error(parseBackendError(e))
      }
    },
  })
}

export const useRegister = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      try {
        await registerUser(payload)
      } catch (e) {
        throw new Error(parseBackendError(e))
      }
    },
    onSuccess: () => {
      toast.success("Account created. You can sign in now.")
      navigate("/sign-in", { replace: true })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Registration failed.")
    },
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        await forgotPasswordRequest(email)
      } catch (e) {
        throw new Error(parseBackendError(e))
      }
    },
    onSuccess: () => {
      toast.success(
        "If an account exists for this email, you will receive password reset instructions."
      )
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not send reset email.")
    },
  })
}

export const useResetPassword = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      try {
        await resetPasswordRequest(payload)
      } catch (e) {
        throw new Error(parseBackendError(e))
      }
    },
    onSuccess: () => {
      toast.success("Password has been reset. You can sign in now.")
      navigate("/sign-in", { replace: true })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not reset password.")
    },
  })
}
