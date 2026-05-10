import { create } from 'zustand';

interface Transaction {
  id?: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

interface AppState {
  xp: number;
  level: string;
  forestHealth: number;
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
}

// Fungsi cerdas untuk menentukan Level berdasarkan XP
const calculateLevel = (xp: number) => {
  if (xp >= 3000) return 'Ecosystem';   // Level Maksimal!
  if (xp >= 2000) return 'Rainforest';
  if (xp >= 1500) return 'Forest';
  if (xp >= 1000) return 'Sapling';     // Start awal kita (1.240 XP)
  if (xp >= 500) return 'Sprout';
  return 'Seedling';
};

export const useAppStore = create<AppState>((set) => ({
  xp: 1240, // Base awal sesuai desain mockup
  level: 'Sapling',
  forestHealth: 72,
  transactions: [],

  addTransaction: (tx) => set((state) => {
    // Beri +150 XP per transaksi untuk memudahkan testing fitur evolusi
    const newXp = state.xp + 150; 
    const newLevel = calculateLevel(newXp);
    
    return { 
      transactions: [tx, ...state.transactions],
      xp: newXp,
      level: newLevel // Level otomatis ter-update!
    };
  }),
}));