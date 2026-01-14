import { create } from "zustand"
import type { UserState } from "@/interface/userInterface"

export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null })
}))