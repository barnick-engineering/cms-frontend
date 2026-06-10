import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultCostingConfig } from '@/config/costing/defaultCostingConfig'
import type { CostingConfig, CostingItem, CostingCategory } from '@/interface/costingInterface'
import { parseCostingConfig } from '@/schema/costingConfigSchema'

interface CostingConfigStore {
  config: CostingConfig
  setConfig: (config: CostingConfig) => void
  resetToDefaults: () => void
  importConfigJson: (json: string) => { ok: true } | { ok: false; error: string }
  exportConfigJson: () => string
  updateCategory: (id: string, patch: Partial<CostingCategory>) => void
  addCategory: (category: CostingCategory) => void
  removeCategory: (id: string) => void
  updateItem: (id: string, patch: Partial<CostingItem>) => void
  addItem: (item: CostingItem, categoryId?: string) => void
  removeItem: (id: string) => void
}

export const useCostingConfigStore = create<CostingConfigStore>()(
  persist(
    (set, get) => ({
      config: defaultCostingConfig,

      setConfig: (config) => set({ config }),

      resetToDefaults: () => set({ config: defaultCostingConfig }),

      importConfigJson: (json) => {
        try {
          const parsed = parseCostingConfig(JSON.parse(json))
          set({ config: parsed })
          return { ok: true }
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Invalid JSON'
          return { ok: false, error: message }
        }
      },

      exportConfigJson: () => JSON.stringify(get().config, null, 2),

      updateCategory: (id, patch) =>
        set((state) => ({
          config: {
            ...state.config,
            categories: state.config.categories.map((c) =>
              c.id === id ? { ...c, ...patch } : c
            ),
          },
        })),

      addCategory: (category) =>
        set((state) => ({
          config: {
            ...state.config,
            categories: [...state.config.categories, category],
          },
        })),

      removeCategory: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            categories: state.config.categories.filter((c) => c.id !== id),
          },
        })),

      updateItem: (id, patch) =>
        set((state) => ({
          config: {
            ...state.config,
            items: state.config.items.map((item) =>
              item.id === id ? { ...item, ...patch } : item
            ),
          },
        })),

      addItem: (item, categoryId) =>
        set((state) => {
          const categories = categoryId
            ? state.config.categories.map((c) =>
                c.id === categoryId
                  ? { ...c, itemIds: [...c.itemIds, item.id] }
                  : c
              )
            : state.config.categories

          return {
            config: {
              ...state.config,
              categories,
              items: [...state.config.items, item],
            },
          }
        }),

      removeItem: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            categories: state.config.categories.map((c) => ({
              ...c,
              itemIds: c.itemIds.filter((iid) => iid !== id),
            })),
            items: state.config.items.filter((item) => item.id !== id),
          },
        })),
    }),
    { name: 'costing-config' }
  )
)
