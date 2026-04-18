import { create } from 'zustand'

export interface Module {
  id: string
  name: string
  slug: string
  category: 'core' | 'addon' | 'premium'
  price: number
  description: string
}

interface ModuleStore {
  activeModuleIds: string[]
  cartItemIds: string[]
  billingCycle: 'monthly' | 'quarterly' | 'annual'
  userTier: 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
  
  toggleModule: (id: string) => void
  toggleCartItem: (id: string) => void
  addSuiteToCart: (ids: string[]) => void
  clearCart: () => void
  checkoutCart: () => void
  setBillingCycle: (cycle: 'monthly' | 'quarterly' | 'annual') => void
  setUserTier: (tier: any) => void
  activateSuite: (ids: string[]) => void
  hydrateActiveModules: (ids: string[]) => void
}

export const useModuleStore = create<ModuleStore>((set) => ({
  activeModuleIds: [], // Initialized as empty, will be hydrated from DB
  cartItemIds: [],
  billingCycle: 'monthly',
  userTier: 'small',

  toggleModule: (id) => set((state) => ({
    activeModuleIds: state.activeModuleIds.includes(id)
      ? state.activeModuleIds.filter((mid) => mid !== id)
      : [...state.activeModuleIds, id]
  })),

  toggleCartItem: (id) => set((state) => ({
    cartItemIds: state.cartItemIds.includes(id)
      ? state.cartItemIds.filter((mid) => mid !== id)
      : [...state.cartItemIds, id]
  })),

  addSuiteToCart: (ids) => set((state) => {
    const newItems = ids.filter(id => !state.activeModuleIds.includes(id) && !state.cartItemIds.includes(id))
    return {
      cartItemIds: [...state.cartItemIds, ...newItems]
    }
  }),

  clearCart: () => set({ cartItemIds: [] }),

  checkoutCart: () => set((state) => ({
    activeModuleIds: Array.from(new Set([...state.activeModuleIds, ...state.cartItemIds])),
    cartItemIds: []
  })),

  setBillingCycle: (billingCycle) => set({ billingCycle }),
  
  setUserTier: (userTier) => set({ userTier }),

  activateSuite: (ids) => set((state) => ({
    activeModuleIds: Array.from(new Set([...state.activeModuleIds, ...ids]))
  })),

  hydrateActiveModules: (ids) => set({ activeModuleIds: ids })
}))
