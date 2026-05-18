import { create } from 'zustand';
import { createClient } from '../utils/supabase/client';

export interface Transaction {
  id?: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  is_auto_sync?: boolean;
}

export interface ForestTile {
  id?: string;
  grid_x: number;
  grid_y: number;
  item_type: string;
  status: string;
}

export interface Goal {
  id?: string;
  name: string;
  target: number;
  current?: number;
  color?: string;
}

interface AppState {
  xp: number;
  levelNumber: number;
  level: string;
  forestHealth: number;
  currentStreak: number;
  streakShield: number;
  transactions: Transaction[];
  forestGrid: ForestTile[];
  mainGoal: Goal | null;
  fullName: string;
  avatarUrl: string;
  isLoading: boolean;
  isDemo: boolean;
  monthlyIncomeTarget: number;
  monthlySavingsTarget: number;
  budgetResetDate: number; // 1-31
  hasCompletedTutorial: boolean;
  
  completeTutorial: () => void;
  fetchUserData: (userId: string) => Promise<void>;
  updateMonthlyTargets: (userId: string, income: number, savings: number, resetDate: number) => Promise<void>;
  withdrawFromSavings: (userId: string, amount: number, reason: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>, userId: string) => Promise<void>;
  updateGamificationState: (userId: string, updates: Partial<{ xp: number; levelNumber: number; forestHealth: number; currentStreak: number; streakShield: number }>) => Promise<void>;
  syncForestTile: (tile: Omit<ForestTile, 'id'>, userId: string) => Promise<void>;
  updateMainGoal: (userId: string, name: string, target: number) => Promise<void>;
  deleteMainGoal: (userId: string) => Promise<void>;
  loadDemoData: () => void;
}

const LEVEL_NAMES = ['Bibit', 'Tunas', 'Pohon Muda', 'Hutan', 'Hutan Hujan', 'Ekosistem'];
export const getLevelName = (levelNum: number) => {
  const nameIndex = Math.min(Math.max(Math.ceil(levelNum / 2) - 1, 0), 5);
  return LEVEL_NAMES[nameIndex];
};

export const calculateLevelFromXp = (xp: number) => {
  // Every 500 XP is 1 level, up to level 12 max
  return Math.min(12, Math.floor(xp / 500) + 1);
};

export const calculateHealthFromTransactions = (transactions: Transaction[], resetDate: number = 1) => {
  const now = new Date();
  let startOfPeriod = new Date(now.getFullYear(), now.getMonth(), resetDate);
  
  if (now.getDate() < resetDate) {
    // We are still in the period that started last month
    startOfPeriod.setMonth(startOfPeriod.getMonth() - 1);
  }
  
  const endOfPeriod = new Date(startOfPeriod);
  endOfPeriod.setMonth(endOfPeriod.getMonth() + 1);

  const expensesThisPeriod = transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const d = new Date(t.date);
      return d >= startOfPeriod && d < endOfPeriod;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Fallback budget if targets not set
  const monthlyBudget = 2250000; 
  return expensesThisPeriod > monthlyBudget ? 50 : 100;
};

export const useAppStore = create<AppState>((set, get) => ({
  xp: 0,
  levelNumber: 1,
  level: 'Bibit',
  forestHealth: 100,
  currentStreak: 1,
  streakShield: 1,
  transactions: [],
  forestGrid: [],
  mainGoal: null,
  fullName: "User",
  avatarUrl: "https://ui-avatars.com/api/?name=User&background=2A6A55&color=fff",
  isLoading: false,
  isDemo: false,
  monthlyIncomeTarget: 0,
  monthlySavingsTarget: 0,
  budgetResetDate: 1,
  hasCompletedTutorial: false,

  completeTutorial: () => set({ hasCompletedTutorial: true }),

  loadDemoData: () => {
    const demoGrid: ForestTile[] = [
      { grid_x: 0, grid_y: 0, item_type: 'tree_6', status: 'healthy' },
      { grid_x: 1, grid_y: 0, item_type: 'tree_3', status: 'healthy' },
      { grid_x: 0, grid_y: 1, item_type: 'tree_2', status: 'dry' },
      { grid_x: -1, grid_y: 0, item_type: 'tree_1', status: 'healthy' },
      { grid_x: 1, grid_y: 1, item_type: 'tree_2', status: 'healthy' },
    ];

    const demoTxs: Transaction[] = [
      { id: '1', title: 'Kiriman Ortu', amount: 1500000, category: 'Lainnya', type: 'income', date: new Date().toISOString() },
      { id: '2', title: 'Makan Ayam Geprek (Accumulated)', amount: 545000, category: 'Makanan', type: 'expense', date: new Date().toISOString() },
      { id: '3', title: 'GoPay – Grab Food', amount: 35000, category: 'Makanan', type: 'expense', date: new Date().toISOString() },
      { id: '4', title: 'Bensin & Parkir (Accumulated)', amount: 98000, category: 'Transport', type: 'expense', date: new Date().toISOString() },
      { id: '5', title: 'Grab', amount: 22000, category: 'Transport', type: 'expense', date: new Date().toISOString() },
      { id: '6', title: 'Skincare / Kaos (Accumulated)', amount: 141000, category: 'Belanja', type: 'expense', date: new Date().toISOString() },
      { id: '7', title: 'Shopee', amount: 89000, category: 'Belanja', type: 'expense', date: new Date().toISOString() },
      { id: '8', title: 'Bioskop & Kopi (Accumulated)', amount: 80000, category: 'Hiburan', type: 'expense', date: new Date().toISOString() },
    ];

    set({
      isDemo: true,
      fullName: "Demo Mahasiswa",
      avatarUrl: "https://ui-avatars.com/api/?name=Demo+Mahasiswa&background=2A6A55&color=fff",
      xp: 2200,
      levelNumber: 5,
      level: 'Pohon Muda',
      forestHealth: 72,
      currentStreak: 4,
      monthlyIncomeTarget: 1500000,
      monthlySavingsTarget: 300000,
      budgetResetDate: 1,

      transactions: demoTxs,
      forestGrid: demoGrid,
      mainGoal: {
        name: "Sepatu Compass Baru",
        target: 1200000,
        color: 'bg-primary'
      }
    });
  },

  fetchUserData: async (userId: string) => {
    set({ isLoading: true });
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const metadata = user?.user_metadata || {};

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const name = profile?.full_name || metadata.full_name || metadata.name || user?.email?.split('@')[0] || "User";
      const avatar = profile?.avatar_url || metadata.avatar_url || metadata.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2A6A55&color=fff`;

      let { data: gameState, error: gameError } = await supabase
        .from('gamification_state')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (gameError || !gameState) {
        const defaultState = { user_id: userId, level: 1, xp: 0, forest_health: 100, current_streak: 1, streak_shield: 1 };
        const { data: insertedState } = await supabase.from('gamification_state').insert(defaultState).select().single();
        gameState = insertedState || defaultState;
      }

      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      const mappedTxs: Transaction[] = (txs || []).map(t => ({
        id: t.id, title: t.title, amount: Number(t.amount), category: t.category, type: t.type as any, date: t.date, is_auto_sync: t.is_auto_sync
      }));

      let { data: grid } = await supabase.from('forest_grid').select('*').eq('user_id', userId);
      if (!grid || grid.length === 0) {
        const defaultTile = { user_id: userId, grid_x: 0, grid_y: 0, item_type: 'tree_1', status: 'healthy' };
        const { data: insertedTile } = await supabase.from('forest_grid').insert(defaultTile).select();
        grid = insertedTile || [defaultTile];
      }

      const mappedGrid: ForestTile[] = (grid || []).map(tile => ({
        id: tile.id, grid_x: tile.grid_x, grid_y: tile.grid_y, item_type: tile.item_type, status: tile.status
      }));

      // Fetch user's North Star main goal
      const { data: goalData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const mappedGoal: Goal | null = goalData ? {
        id: goalData.id,
        name: goalData.name,
        target: Number(goalData.target),
        current: Number(goalData.current || 0),
        color: goalData.color || 'bg-primary'
      } : null;

      const resetDate = profile?.budget_reset_date || 1;

      set({
        fullName: name,
        avatarUrl: avatar,
        xp: gameState.xp,
        levelNumber: gameState.level,
        level: getLevelName(gameState.level),
        forestHealth: calculateHealthFromTransactions(mappedTxs, resetDate),
        currentStreak: gameState.current_streak,
        streakShield: gameState.streak_shield,
        transactions: mappedTxs,
        forestGrid: mappedGrid,
        mainGoal: mappedGoal,
        monthlyIncomeTarget: Number(profile?.monthly_income_target || 0),
        monthlySavingsTarget: Number(profile?.monthly_savings_target || 0),
        budgetResetDate: resetDate,
        hasCompletedTutorial: profile?.has_completed_tutorial || false,
        isLoading: false
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
      set({ isLoading: false });
    }
  },

  updateMonthlyTargets: async (userId: string, income: number, savings: number, resetDate: number) => {
    const supabase = createClient();
    try {
      await supabase
        .from('profiles')
        .update({
          monthly_income_target: income,
          monthly_savings_target: savings,
          budget_reset_date: resetDate
        })
        .eq('id', userId);

      set({
        monthlyIncomeTarget: income,
        monthlySavingsTarget: savings,
        budgetResetDate: resetDate
      });
    } catch (err) {
      console.error("Error updating monthly targets:", err);
    }
  },

  withdrawFromSavings: async (userId: string, amount: number, reason: string) => {
    const supabase = createClient();
    try {
      // Withdrawal is essentially an income transaction (money back to available cash)
      // but flagged as withdrawal to avoid double counting "real" income
      await get().addTransaction({
        title: `Tarik Tabungan: ${reason || 'Kebutuhan'}`,
        amount: amount,
        category: 'Lainnya',
        type: 'income',
        date: new Date().toISOString(),
      }, userId);
    } catch (err) {
      console.error("Error withdrawing from savings:", err);
    }
  },


  addTransaction: async (tx: Omit<Transaction, 'id'>, userId: string) => {
    const supabase = createClient();
    try {
      // 1. Simpan transaksi ke Supabase
      const { data: insertedTx } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: tx.type,
          category: tx.category,
          amount: tx.amount,
          title: tx.title,
          date: tx.date || new Date().toISOString(),
          is_auto_sync: tx.is_auto_sync || false
        })
        .select()
        .single();

      if (!insertedTx) return;

      const mappedNewTx: Transaction = {
        id: insertedTx.id,
        title: insertedTx.title,
        amount: Number(insertedTx.amount),
        category: insertedTx.category,
        type: insertedTx.type,
        date: insertedTx.date,
        is_auto_sync: insertedTx.is_auto_sync
      };

      // 2. Beri bonus XP per transaksi
      const state = get();
      const xpReward = mappedNewTx.type === 'income' ? 50 : 5;
      const newXp = state.xp + xpReward;
      const newLevelNum = calculateLevelFromXp(newXp);

      // 3. Update state di DB Supabase
      await supabase
        .from('gamification_state')
        .update({
          xp: newXp,
          level: newLevelNum
        })
        .eq('user_id', userId);

      // 4. Update Zustand State lokal
      const newTxs = [mappedNewTx, ...state.transactions];
      set({
        transactions: newTxs,
        xp: newXp,
        levelNumber: newLevelNum,
        level: getLevelName(newLevelNum),
        forestHealth: calculateHealthFromTransactions(newTxs)
      });

    } catch (err) {
      console.error("Error saving transaction to DB:", err);
    }
  },

  updateGamificationState: async (userId: string, updates: Partial<{ xp: number; levelNumber: number; forestHealth: number; currentStreak: number; streakShield: number }>) => {
    const supabase = createClient();
    const dbUpdates: any = {};
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.levelNumber !== undefined) dbUpdates.level = updates.levelNumber;
    if (updates.forestHealth !== undefined) dbUpdates.forest_health = updates.forestHealth;
    if (updates.currentStreak !== undefined) dbUpdates.current_streak = updates.currentStreak;
    if (updates.streakShield !== undefined) dbUpdates.streak_shield = updates.streakShield;

    try {
      await supabase
        .from('gamification_state')
        .update(dbUpdates)
        .eq('user_id', userId);

      set((state) => {
        const nextXp = updates.xp !== undefined ? updates.xp : state.xp;
        const nextLevelNum = updates.levelNumber !== undefined ? updates.levelNumber : state.levelNumber;
        return {
          xp: nextXp,
          levelNumber: nextLevelNum,
          level: getLevelName(nextLevelNum),
          forestHealth: updates.forestHealth !== undefined ? updates.forestHealth : state.forestHealth,
          currentStreak: updates.currentStreak !== undefined ? updates.currentStreak : state.currentStreak,
          streakShield: updates.streakShield !== undefined ? updates.streakShield : state.streakShield,
        };
      });
    } catch (err) {
      console.error("Error updating gamification state in DB:", err);
    }
  },

  syncForestTile: async (tile: Omit<ForestTile, 'id'>, userId: string) => {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from('forest_grid')
        .upsert({
          user_id: userId,
          grid_x: tile.grid_x,
          grid_y: tile.grid_y,
          item_type: tile.item_type,
          status: tile.status
        }, { onConflict: 'user_id,grid_x,grid_y' }) // Sesuai dengan batasan koordinat unik
        .select()
        .single();

      if (data) {
        set((state) => {
          const filtered = state.forestGrid.filter(f => !(f.grid_x === tile.grid_x && f.grid_y === tile.grid_y));
          return {
            forestGrid: [...filtered, {
              id: data.id,
              grid_x: data.grid_x,
              grid_y: data.grid_y,
              item_type: data.item_type,
              status: data.status
            }]
          };
        });
      }
    } catch (err) {
      console.error("Error syncing forest tile with DB:", err);
    }
  },

  updateMainGoal: async (userId: string, name: string, target: number) => {
    if (get().isDemo || !userId) {
      set({
        mainGoal: {
          name: name,
          target: target,
          color: 'bg-primary'
        }
      });
      return;
    }
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from('goals')
        .upsert({
          user_id: userId,
          name: name,
          target: target,
          color: 'bg-primary'
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (data) {
        set({
          mainGoal: {
            id: data.id,
            name: data.name,
            target: Number(data.target),
            current: Number(data.current || 0),
            color: data.color || 'bg-primary'
          }
        });
      }
    } catch (err) {
      console.error("Error updating main goal in DB:", err);
    }
  },

  deleteMainGoal: async (userId: string) => {
    if (get().isDemo || !userId) {
      set({ mainGoal: null });
      return;
    }
    const supabase = createClient();
    try {
      await supabase
        .from('goals')
        .delete()
        .eq('user_id', userId);

      set({ mainGoal: null });
    } catch (err) {
      console.error("Error deleting main goal from DB:", err);
    }
  }
}));