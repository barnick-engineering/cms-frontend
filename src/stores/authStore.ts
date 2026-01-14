import { create } from "zustand"
import type { AuthState } from "@/interface/userInterface"

export const useAuthStore = create<AuthState>((set) => ({
    access_token: localStorage.getItem("access_token"),
    refresh_token: localStorage.getItem("refresh_token"),
    isAuthenticated: !!localStorage.getItem("access_token"),
    setTokens: (access, refresh) => {
        localStorage.setItem("access_token", access)
        localStorage.setItem("refresh_token", refresh)
        set({ access_token: access, refresh_token: refresh, isAuthenticated: true })
    },
    clearTokens: () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        set({ access_token: null, refresh_token: null, isAuthenticated: false })
    },
}))
