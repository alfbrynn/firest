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
  activeToast: { message: string; type: 'success' | 'warning' | 'levelUp' | 'streak' | 'onboarding'; subtext?: string } | null;
  statusBarMessage: string | null;
  
  completeTutorial: () => void;
  fetchUserData: (userId: string) => Promise<void>;
  updateMonthlyTargets: (userId: string, income: number, savings: number, resetDate: number) => Promise<void>;
  withdrawFromSavings: (userId: string, amount: number, reason: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>, userId: string) => Promise<void>;
  updateTransaction: (txId: string, updatedFields: Partial<Transaction>, userId: string) => Promise<void>;
  deleteTransaction: (txId: string, userId: string) => Promise<void>;
  updateGamificationState: (userId: string, updates: Partial<{ xp: number; levelNumber: number; forestHealth: number; currentStreak: number; streakShield: number }>) => Promise<void>;
  syncForestTile: (tile: Omit<ForestTile, 'id'>, userId: string) => Promise<void>;
  updateMainGoal: (userId: string, name: string, target: number) => Promise<void>;
  deleteMainGoal: (userId: string) => Promise<void>;
  loadDemoData: () => void;
  showToast: (message: string, type: 'success' | 'warning' | 'levelUp' | 'streak' | 'onboarding', subtext?: string) => void;
  clearToast: () => void;
  showStatusBarMessage: (msg: string, duration?: number) => void;
  triggerOnboardingSequence: (userId: string) => Promise<void>;
  checkDailyLoginXP: (userId?: string) => Promise<void>;
  triggerWeeklyReviewXP: (userId?: string) => Promise<void>;
  checkStreakAndActivity: (userId?: string) => Promise<void>;
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

export const calculateHealthFromTransactions = (
  transactions: Transaction[], 
  resetDate: number = 1,
  monthlyIncomeTarget: number = 0,
  monthlySavingsTarget: number = 0
) => {
  const now = new Date();
  let startOfPeriod = new Date(now.getFullYear(), now.getMonth(), resetDate);
  
  if (now.getDate() < resetDate) {
    startOfPeriod.setMonth(startOfPeriod.getMonth() - 1);
  }
  
  const endOfPeriod = new Date(startOfPeriod);
  endOfPeriod.setMonth(endOfPeriod.getMonth() + 1);

  const expensesThisPeriod = transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const d = new Date(t.date);
      return d >= startOfPeriod && d < endOfPeriod;
    });

  const totalSpent = expensesThisPeriod.reduce((sum, t) => sum + t.amount, 0);

  if (monthlyIncomeTarget === 0) {
    const monthlyBudget = 2250000; 
    return totalSpent > monthlyBudget ? 50 : 100;
  }

  const totalBudget = Math.max(0, monthlyIncomeTarget - monthlySavingsTarget);
  const budgets: Record<string, number> = {
    'Makanan': Math.round(totalBudget * 0.4),
    'Transport': Math.round(totalBudget * 0.15),
    'Belanja': Math.round(totalBudget * 0.15),
    'Hiburan': Math.round(totalBudget * 0.1),
    'Tagihan': Math.round(totalBudget * 0.15),
    'Lainnya': Math.round(totalBudget * 0.05)
  };

  const categoryExpenses: Record<string, number> = {
    'Makanan': 0, 'Transport': 0, 'Belanja': 0, 'Hiburan': 0, 'Tagihan': 0, 'Lainnya': 0
  };
  expensesThisPeriod.forEach(t => {
    if (categoryExpenses[t.category] !== undefined) {
      categoryExpenses[t.category] += t.amount;
    }
  });

  let health = 100;
  Object.keys(budgets).forEach(cat => {
    const limit = budgets[cat];
    const spent = categoryExpenses[cat];
    if (spent > limit && limit > 0) {
      health -= 15;
    }
  });

  if (totalSpent > 0.9 * totalBudget) {
    health -= 30;
  }

  // Check weekly saving rate
  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  startOfWeek.setHours(0,0,0,0);
  
  const weeklyTxs = transactions.filter(t => new Date(t.date) >= startOfWeek);
  const weeklyIncome = weeklyTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const weeklyExpense = weeklyTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  let weeklySavingRate = 0;
  if (weeklyIncome > 0) {
    weeklySavingRate = ((weeklyIncome - weeklyExpense) / weeklyIncome) * 100;
  } else {
    if (weeklyExpense <= (totalBudget / 4)) {
      weeklySavingRate = 25; // Treat as positive
    }
  }

  if (weeklySavingRate > 0) {
    health += 10;
  }

  return Math.min(100, Math.max(0, health));
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
  activeToast: null,
  statusBarMessage: null,

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
        isDemo: false,
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

      if (userId) {
        get().checkStreakAndActivity(userId);
        get().checkDailyLoginXP(userId);
      }
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
        type: insertedTx.type as any,
        date: insertedTx.date,
        is_auto_sync: insertedTx.is_auto_sync
      };

      // 2. Beri bonus XP per transaksi
      const state = get();
      const isOnboarding = state.monthlyIncomeTarget === 0;
      const xpReward = isOnboarding ? 0 : 10;
      const newXp = state.xp + xpReward;
      const newLevelNum = calculateLevelFromXp(newXp);
      const isLevelUp = !isOnboarding && newLevelNum > state.levelNumber;

      // Calculate new health
      const newTxs = [mappedNewTx, ...state.transactions];
      const newHealth = calculateHealthFromTransactions(newTxs, state.budgetResetDate, state.monthlyIncomeTarget, state.monthlySavingsTarget);

      // 3. Update state di DB Supabase
      await supabase
        .from('gamification_state')
        .update({
          xp: newXp,
          level: newLevelNum,
          forest_health: newHealth
        })
        .eq('user_id', userId);

      // 4. Update Zustand State lokal
      set({
        transactions: newTxs,
        xp: newXp,
        levelNumber: newLevelNum,
        level: getLevelName(newLevelNum),
        forestHealth: newHealth
      });

      // If not onboarding, run gamification triggers
      if (!isOnboarding) {
        // Floating status bar XP notification
        get().showStatusBarMessage("+10 ✨");

        // Trigger streak & activity update
        get().checkStreakAndActivity(userId);

        // Check for Level Up
        if (isLevelUp) {
          get().showToast("Level Up! 👑", "levelUp", `Selamat! Tamanmu berkembang ke level baru: ${getLevelName(newLevelNum)}.`);
        }

        // Check health warning
        if (newHealth < 50 && state.forestHealth >= 50) {
          get().showToast("Kesehatan Kritis! ⚠️", "warning", "Kesehatan hutanmu turun di bawah 50%. Kurangi pengeluaran non-primer agar tamanmu tetap subur!");
        }

        // Check category budget warnings
        if (mappedNewTx.type === 'expense') {
          const totalBudget = Math.max(0, state.monthlyIncomeTarget - state.monthlySavingsTarget);
          if (totalBudget > 0) {
            const budgets: Record<string, number> = {
              'Makanan': Math.round(totalBudget * 0.4),
              'Transport': Math.round(totalBudget * 0.15),
              'Belanja': Math.round(totalBudget * 0.15),
              'Hiburan': Math.round(totalBudget * 0.1),
              'Tagihan': Math.round(totalBudget * 0.15),
              'Lainnya': Math.round(totalBudget * 0.05)
            };

            const catLimit = budgets[mappedNewTx.category];
            if (catLimit > 0) {
              // Sum current category spent
              const catSpent = newTxs
                .filter(t => t.type === 'expense' && t.category === mappedNewTx.category)
                .reduce((sum, t) => sum + t.amount, 0);

              const previousSpent = catSpent - mappedNewTx.amount;
              const previousPct = (previousSpent / catLimit) * 100;
              const currentPct = (catSpent / catLimit) * 100;

              if (currentPct > 100 && previousPct <= 100) {
                get().showToast("Anggaran Melebihi Batas! ⚠️", "warning", `Pengeluaran untuk kategori ${mappedNewTx.category} telah melebihi budget bulanan!`);
              } else if (currentPct > 80 && previousPct <= 80) {
                get().showToast("Anggaran Hampir Habis! ⚠️", "warning", `Pengeluaran untuk kategori ${mappedNewTx.category} sudah terpakai lebih dari 80%!`);
              }
            }
          }
        }
      }

    } catch (err) {
      console.error("Error saving transaction to DB:", err);
    }
  },

  updateTransaction: async (txId: string, updatedFields: Partial<Transaction>, userId: string) => {
    const state = get();
    if (state.isDemo) {
      const newTxs = state.transactions.map(t => 
        t.id === txId ? { ...t, ...updatedFields } : t
      );
      set({
        transactions: newTxs,
        forestHealth: calculateHealthFromTransactions(newTxs, state.budgetResetDate)
      });
      return;
    }

    const supabase = createClient();
    try {
      const { data: updatedTx } = await supabase
        .from('transactions')
        .update({
          title: updatedFields.title,
          amount: updatedFields.amount,
          category: updatedFields.category,
          type: updatedFields.type,
          date: updatedFields.date,
        })
        .eq('id', txId)
        .eq('user_id', userId)
        .select()
        .single();

      if (!updatedTx) return;

      const mappedUpdatedTx: Transaction = {
        id: updatedTx.id,
        title: updatedTx.title,
        amount: Number(updatedTx.amount),
        category: updatedTx.category,
        type: updatedTx.type as any,
        date: updatedTx.date,
        is_auto_sync: updatedTx.is_auto_sync
      };

      const newTxs = state.transactions.map(t => 
        t.id === txId ? mappedUpdatedTx : t
      );

      set({
        transactions: newTxs,
        forestHealth: calculateHealthFromTransactions(newTxs, state.budgetResetDate)
      });
    } catch (err) {
      console.error("Error updating transaction in DB:", err);
    }
  },

  deleteTransaction: async (txId: string, userId: string) => {
    const state = get();
    if (state.isDemo) {
      const newTxs = state.transactions.filter(t => t.id !== txId);
      set({
        transactions: newTxs,
        forestHealth: calculateHealthFromTransactions(newTxs, state.budgetResetDate)
      });
      return;
    }

    const supabase = createClient();
    try {
      await supabase
        .from('transactions')
        .delete()
        .eq('id', txId)
        .eq('user_id', userId);

      const newTxs = state.transactions.filter(t => t.id !== txId);
      set({
        transactions: newTxs,
        forestHealth: calculateHealthFromTransactions(newTxs, state.budgetResetDate)
      });
    } catch (err) {
      console.error("Error deleting transaction from DB:", err);
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
  },

  showToast: (message, type, subtext) => {
    set({ activeToast: { message, type, subtext } });
  },

  clearToast: () => {
    set({ activeToast: null });
  },

  showStatusBarMessage: (msg, duration = 3000) => {
    set({ statusBarMessage: msg });
    setTimeout(() => {
      if (get().statusBarMessage === msg) {
        set({ statusBarMessage: null });
      }
    }, duration);
  },

  triggerOnboardingSequence: async (userId: string) => {
    if (!userId) return;
    const supabase = createClient();
    const state = get();
    const currentXp = state.xp;
    const newXp = currentXp + 70;
    const newLevelNum = calculateLevelFromXp(newXp);

    try {
      await supabase
        .from('gamification_state')
        .update({
          xp: newXp,
          level: newLevelNum
        })
         .eq('user_id', userId);
    } catch (err) {
      console.error("Error updating gamification state in onboarding:", err);
    }

    set({
      xp: newXp,
      levelNumber: newLevelNum,
      level: getLevelName(newLevelNum)
    });

    get().showToast(
      "Selamat Datang! 🌳",
      "onboarding",
      "Akunmu berhasil dibuat dan hutanmu siap untuk tumbuh bersama finansialmu!"
    );

    get().showStatusBarMessage("🌱 Hutan dibuat... +50 XP");

    setTimeout(() => {
      get().showStatusBarMessage("🎯 Target diset... +20 XP");
    }, 3000);

    setTimeout(() => {
      get().showStatusBarMessage("🔥 Streak dimulai!");
    }, 6000);
  },

  checkDailyLoginXP: async (userId?: string) => {
    const supabase = createClient();
    let activeUserId = userId;
    if (!activeUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      activeUserId = user?.id || '';
    }
    if (!activeUserId) return;

    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let lastLoginXpDate: string | null = null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('last_login_xp_date')
        .eq('id', activeUserId)
        .single();
      if (!error && data) {
        lastLoginXpDate = data.last_login_xp_date;
      }
    } catch (e) {
      console.warn("Could not query last_login_xp_date from DB", e);
    }

    if (!lastLoginXpDate) {
      lastLoginXpDate = localStorage.getItem(`firest_last_login_xp_${activeUserId}`);
    }

    if (lastLoginXpDate !== todayStr) {
      const state = get();
      const newXp = state.xp + 5;
      const newLevelNum = calculateLevelFromXp(newXp);
      const isLevelUp = newLevelNum > state.levelNumber;

      try {
        await supabase
          .from('gamification_state')
          .update({
            xp: newXp,
            level: newLevelNum
          })
          .eq('user_id', activeUserId);

        await supabase
          .from('profiles')
          .update({ last_login_xp_date: todayStr })
          .eq('id', activeUserId);
      } catch (err) {
        console.error("Error updating daily login state:", err);
      }

      localStorage.setItem(`firest_last_login_xp_${activeUserId}`, todayStr);

      set({
        xp: newXp,
        levelNumber: newLevelNum,
        level: getLevelName(newLevelNum)
      });

      get().showStatusBarMessage("+5 XP Login Harian ☀️");

      if (isLevelUp) {
        get().showToast("Level Up! 👑", "levelUp", `Selamat! Tamanmu berkembang ke level baru: ${getLevelName(newLevelNum)}.`);
      }
    }
  },

  triggerWeeklyReviewXP: async (userId?: string) => {
    const supabase = createClient();
    let activeUserId = userId;
    if (!activeUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      activeUserId = user?.id || '';
    }
    if (!activeUserId) return;

    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0,0,0,0);
    const currentWeekStr = monday.toISOString().split('T')[0];

    const lastWeeklyReview = localStorage.getItem(`firest_last_weekly_review_${activeUserId}`);

    if (lastWeeklyReview !== currentWeekStr) {
      const state = get();
      const newXp = state.xp + 15;
      const newLevelNum = calculateLevelFromXp(newXp);
      const isLevelUp = newLevelNum > state.levelNumber;

      try {
        await supabase
          .from('gamification_state')
          .update({
            xp: newXp,
            level: newLevelNum
          })
          .eq('user_id', activeUserId);
      } catch (err) {
        console.error("Error updating weekly review state in DB:", err);
      }

      localStorage.setItem(`firest_last_weekly_review_${activeUserId}`, currentWeekStr);

      set({
        xp: newXp,
        levelNumber: newLevelNum,
        level: getLevelName(newLevelNum)
      });

      get().showStatusBarMessage("+15 XP Weekly Review 📈");

      get().showToast(
        "Weekly Review! 📈",
        "success",
        "Selamat! Kamu mendapatkan +15 XP karena menganalisis keuanganmu minggu ini."
      );

      if (isLevelUp) {
        get().showToast("Level Up! 👑", "levelUp", `Selamat! Tamanmu berkembang ke level baru: ${getLevelName(newLevelNum)}.`);
      }
    }
  },

  checkStreakAndActivity: async (userId?: string) => {
    const supabase = createClient();
    let activeUserId = userId;
    if (!activeUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      activeUserId = user?.id || '';
    }
    if (!activeUserId) return;

    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const yesterday = new Date(d);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    let lastActivityDate: string | null = null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('last_activity_date')
        .eq('id', activeUserId)
        .single();
      if (!error && data) {
        lastActivityDate = data.last_activity_date;
      }
    } catch (e) {
      console.warn("Could not query last_activity_date from DB", e);
    }

    if (!lastActivityDate) {
      lastActivityDate = localStorage.getItem(`firest_last_activity_${activeUserId}`);
    }

    const state = get();
    let newStreak = state.currentStreak;
    let newShield = state.streakShield;
    let updateStreak = false;

    if (!lastActivityDate) {
      newStreak = 1;
      updateStreak = true;
    } else if (lastActivityDate === todayStr) {
      return;
    } else if (lastActivityDate === yesterdayStr) {
      newStreak = state.currentStreak + 1;
      updateStreak = true;
    } else {
      if (state.streakShield > 0) {
        newShield = state.streakShield - 1;
        updateStreak = true;
        get().showToast(
          "Streak Shield Digunakan! 🛡️",
          "streak",
          "Hampir saja! Streak kamu diselamatkan oleh Streak Shield."
        );
      } else {
        newStreak = 1;
        updateStreak = true;
      }
    }

    if (updateStreak) {
      try {
        await supabase
          .from('gamification_state')
          .update({
            current_streak: newStreak,
            streak_shield: newShield
          })
          .eq('user_id', activeUserId);

        await supabase
          .from('profiles')
          .update({ last_activity_date: todayStr })
          .eq('id', activeUserId);
      } catch (err) {
        console.error("Error updating streak/activity state in DB:", err);
      }

      localStorage.setItem(`firest_last_activity_${activeUserId}`, todayStr);

      set({
        currentStreak: newStreak,
        streakShield: newShield
      });

      get().showStatusBarMessage("Streak Terjaga! 🔥");

      if (newStreak > 1 && newStreak % 7 === 0) {
        get().showToast(
          "Milestone Streak! 🔥",
          "streak",
          `Hebat! Kamu telah mempertahankan streak selama ${newStreak} hari berturut-turut! Keep it up!`
        );
      }
    }
  }
}));