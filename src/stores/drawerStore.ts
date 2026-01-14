import { create } from 'zustand'

interface DrawerStore {
    isAnyDrawerOpen: boolean
    setDrawerOpen: (val: boolean) => void
}

export const useDrawerStore = create<DrawerStore>((set) => ({
    isAnyDrawerOpen: false,
    setDrawerOpen: (val) => set({ isAnyDrawerOpen: val }),
}))