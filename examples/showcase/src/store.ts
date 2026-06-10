import { create } from 'zustand'

type AuthStore = {
  token: string
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: '',
  setToken: (token) => set({ token }),
}))
