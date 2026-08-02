// store/useAuthStore.ts
import { create } from 'zustand';

interface Cashier {
  id: string;
  name: string;
  role: string;
}

interface AuthState {
  cashier: Cashier | null;
  setCashier: (cashier: Cashier) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  cashier: null,
  setCashier: (cashier) => set({ cashier }),
  logout: () => set({ cashier: null }),
}));