import { create } from 'zustand';

// Definisi tipe data agar kode kita rapi (TypeScript)
interface Transaction {
  id?: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

interface AppState {
  // State Gamifikasi
  xp: number;
  level: string;
  forestHealth: number;
  
  // State Transaksi
  transactions: Transaction[];
  
  // Actions (Fungsi untuk mengubah state)
  addTransaction: (tx: Transaction) => void;
  updateXP: (points: number) => void;
  setForestHealth: (health: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Data Awal (Initial State) sesuai PNG Mockup Anda
  xp: 1240,
  level: 'Sapling',
  forestHealth: 72,
  transactions: [],

  // Fungsi menambah transaksi & otomatis menambah XP
  addTransaction: (tx) => set((state) => ({ 
    transactions: [tx, ...state.transactions],
    xp: state.xp + 10 // Setiap catat transaksi dapat 10 XP!
  })),

  updateXP: (points) => set((state) => ({ xp: state.xp + points })),
  
  setForestHealth: (health) => set({ forestHealth: health }),
}));