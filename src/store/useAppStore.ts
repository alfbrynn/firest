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

interface AppState {
  xp: number;
  levelNumber: number;
  level: string;
  forestHealth: number;
  currentStreak: number;
  streakShield: number;
  transactions: Transaction[];
  forestGrid: ForestTile[];
  isLoading: boolean;
  isDemo: boolean;
  
  fetchUserData: (userId: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>, userId: string) => Promise<void>;
  updateGamificationState: (userId: string, updates: Partial<{ xp: number; levelNumber: number; forestHealth: number; currentStreak: number; streakShield: number }>) => Promise<void>;
  syncForestTile: (tile: Omit<ForestTile, 'id'>, userId: string) => Promise<void>;
  loadDemoData: () => void;
}

const LEVEL_NAMES = ['Seedling', 'Sprout', 'Sapling', 'Forest', 'Rainforest', 'Ecosystem'];
export const getLevelName = (levelNum: number) => LEVEL_NAMES[Math.min(Math.max(levelNum - 1, 0), 5)];

export const calculateLevelFromXp = (xp: number) => {
  if (xp >= 3000) return 6; // Ecosystem
  if (xp >= 2000) return 5; // Rainforest
  if (xp >= 1500) return 4; // Forest
  if (xp >= 1000) return 3; // Sapling
  if (xp >= 500) return 2;  // Sprout
  return 1;                 // Seedling
};

export const useAppStore = create<AppState>((set, get) => ({
  xp: 1240,
  levelNumber: 5,
  level: 'Rainforest',
  forestHealth: 72,
  currentStreak: 7,
  streakShield: 1,
  transactions: [],
  forestGrid: [],
  isLoading: false,
  isDemo: false,

  loadDemoData: () => {
    // Generate a rich 3x3 ecosystem grid
    const demoGrid: ForestTile[] = [
      { grid_x: 0, grid_y: 0, item_type: 'tree_6', status: 'healthy' },
      { grid_x: 1, grid_y: 0, item_type: 'tree_5', status: 'healthy' },
      { grid_x: 0, grid_y: 1, item_type: 'tree_4', status: 'healthy' },
      { grid_x: -1, grid_y: 0, item_type: 'tree_3', status: 'healthy' },
      { grid_x: 0, grid_y: -1, item_type: 'tree_2', status: 'healthy' },
      { grid_x: 1, grid_y: 1, item_type: 'tree_6', status: 'healthy' },
      { grid_x: -1, grid_y: -1, item_type: 'tree_4', status: 'healthy' },
      { grid_x: 1, grid_y: -1, item_type: 'tree_5', status: 'healthy' },
      { grid_x: -1, grid_y: 1, item_type: 'tree_3', status: 'healthy' },
    ];

    // Generate rich transactions
    const now = new Date();
    const demoTxs: Transaction[] = [
      { id: '1', title: 'Gaji Bulanan', amount: 8500000, category: 'Lainnya', type: 'income', date: new Date(now.getTime() - 1000*60*60*2).toISOString(), is_auto_sync: true },
      { id: '2', title: 'Makan Siang Resto', amount: 150000, category: 'Makanan', type: 'expense', date: new Date(now.getTime() - 1000*60*60*5).toISOString(), is_auto_sync: false },
      { id: '3', title: 'Belanja Bulanan', amount: 800000, category: 'Belanja', type: 'expense', date: new Date(now.getTime() - 1000*60*60*24).toISOString(), is_auto_sync: true },
      { id: '4', title: 'Tagihan Listrik', amount: 350000, category: 'Tagihan', type: 'expense', date: new Date(now.getTime() - 1000*60*60*48).toISOString(), is_auto_sync: true },
      { id: '5', title: 'Bensin Kendaraan', amount: 200000, category: 'Transport', type: 'expense', date: new Date(now.getTime() - 1000*60*60*72).toISOString(), is_auto_sync: false },
      { id: '6', title: 'Langganan Netflix', amount: 120000, category: 'Hiburan', type: 'expense', date: new Date(now.getTime() - 1000*60*60*120).toISOString(), is_auto_sync: true },
    ];

    set({
      isDemo: true,
      isLoading: false,
      xp: 4500,
      levelNumber: 6,
      level: 'Ecosystem',
      forestHealth: 98,
      currentStreak: 12,
      transactions: demoTxs,
      forestGrid: demoGrid
    });
  },

  fetchUserData: async (userId: string) => {
    set({ isLoading: true });
    const supabase = createClient();

    try {
      // 1. Fetch Gamification State
      let { data: gameState, error: gameError } = await supabase
        .from('gamification_state')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (gameError || !gameState) {
        // Jika belum ada gamification state, buat baru (seed default)
        const defaultState = {
          user_id: userId,
          level: 1,
          xp: 0,
          forest_health: 100,
          current_streak: 1,
          streak_shield: 1
        };
        const { data: insertedState } = await supabase
          .from('gamification_state')
          .insert(defaultState)
          .select()
          .single();
        gameState = insertedState || defaultState;
      }

      // 2. Fetch Transactions
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      const mappedTxs: Transaction[] = (txs || []).map(t => ({
        id: t.id,
        title: t.title,
        amount: Number(t.amount),
        category: t.category,
        type: t.type as 'income' | 'expense' | 'transfer',
        date: t.date,
        is_auto_sync: t.is_auto_sync
      }));

      // 3. Fetch Forest Grid
      let { data: grid } = await supabase
        .from('forest_grid')
        .select('*')
        .eq('user_id', userId);

      if (!grid || grid.length === 0) {
        // Seed default 1 tree seedling untuk level 1
        const defaultTile = {
          user_id: userId,
          grid_x: 0,
          grid_y: 0,
          item_type: 'tree_1',
          status: 'healthy'
        };
        const { data: insertedTile } = await supabase
          .from('forest_grid')
          .insert(defaultTile)
          .select();
        grid = insertedTile || [defaultTile];
      }

      const mappedGrid: ForestTile[] = (grid || []).map(tile => ({
        id: tile.id,
        grid_x: tile.grid_x,
        grid_y: tile.grid_y,
        item_type: tile.item_type,
        status: tile.status
      }));

      set({
        xp: gameState.xp,
        levelNumber: gameState.level,
        level: getLevelName(gameState.level),
        forestHealth: gameState.forest_health,
        currentStreak: gameState.current_streak,
        streakShield: gameState.streak_shield,
        transactions: mappedTxs,
        forestGrid: mappedGrid,
        isLoading: false
      });

    } catch (err) {
      console.error("Error fetching user data from Supabase:", err);
      set({ isLoading: false });
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

      // 2. Beri bonus XP per transaksi (+150 XP) untuk evolusi
      const state = get();
      const newXp = state.xp + 150;
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
      set({
        transactions: [mappedNewTx, ...state.transactions],
        xp: newXp,
        levelNumber: newLevelNum,
        level: getLevelName(newLevelNum)
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
  }
}));