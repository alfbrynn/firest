import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage globally
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock Supabase client
vi.mock('../../utils/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      update: () => ({
        eq: async () => ({ error: null })
      })
    })
  })
}));

import { useAppStore } from '../useAppStore';

describe('useAppStore checkCycleRollover', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset store state
    useAppStore.setState({
      transactions: [],
      mainGoal: null,
      monthlyIncomeTarget: 10000000,
      monthlySavingsTarget: 2000000,
      budgetResetDate: 1,
      isDemo: true
    });
  });

  it('should accumulate leftover budget and savings to mainGoal.current on cycle rollover', async () => {
    // Set a main goal
    useAppStore.setState({
      mainGoal: {
        id: '1',
        name: 'Beli Rumah',
        target: 1000000000,
        current: 5000000
      }
    });

    // Create dates for the previous cycle.
    // Assuming today is 2026-05-26 and budgetResetDate is 1.
    // Previous cycle: 2026-04-01 to 2026-05-01
    const prevCycleDate = new Date();
    prevCycleDate.setMonth(prevCycleDate.getMonth() - 1);
    prevCycleDate.setDate(15);
    const dateStr = prevCycleDate.toISOString();

    // Add transactions for previous cycle:
    // Income: 10,000,000
    // Regular expense: 4,000,000
    // Saving (Tabungan) expense: 2,000,000
    // Net leftover: 10,000,000 - 4,000,000 = 6,000,000 (which is 4,000,000 leftover cash + 2,000,000 savings)
    useAppStore.setState({
      transactions: [
        { title: 'Gaji', amount: 10000000, category: 'Gaji', type: 'income', date: dateStr },
        { title: 'Belanja Bulanan', amount: 4000000, category: 'Belanja', type: 'expense', date: dateStr },
        { title: 'Tabungan Impian', amount: 2000000, category: 'Tabungan', type: 'expense', date: dateStr }
      ]
    });

    // Call checkCycleRollover
    await useAppStore.getState().checkCycleRollover('test-user');

    // The rollover should have run. Let's inspect the main goal current value.
    // Initial current: 5,000,000
    // sisaUang should be: 10,000,000 - 4,000,000 = 6,000,000 (excluding Tabungan)
    // New mainGoal.current should be: 5,000,000 + 6,000,000 = 11,000,000
    const updatedGoal = useAppStore.getState().mainGoal;
    expect(updatedGoal?.current).toBe(11000000);
  });

  it('should deduct target cost from total savings, convert Tabungan transactions, and carry over excess savings on claiming completed goal', async () => {
    // Set a main goal with target 10,000,000 and current 8,000,000
    useAppStore.setState({
      mainGoal: {
        id: '1',
        name: 'Laptop Gaming',
        target: 10000000,
        current: 8000000
      },
      xp: 1200,
      levelNumber: 3,
      level: 'Tunas',
      forestHealth: 50,
      budgetResetDate: 1
    });

    const nowStr = new Date().toISOString();
    // Add transactions for current cycle:
    // Tabungan expense: 3,000,000
    // Total savings = 8,000,000 + 3,000,000 = 11,000,000 (which exceeds target 10,000,000)
    useAppStore.setState({
      transactions: [
        { title: 'Menabung Laptop', amount: 3000000, category: 'Tabungan', type: 'expense', date: nowStr }
      ]
    });

    // Claim completed goal
    await useAppStore.getState().claimCompletedGoal('test-user');

    // Expected changes:
    // 1. mainGoal.name should be '' (reset)
    // 2. mainGoal.target should be 0 (reset)
    // 3. mainGoal.current should be excess savings: 11,000,000 - 10,000,000 = 1,000,000
    // 4. xp should increase by +200 to 1400
    // 5. levelNumber should be calculateLevelFromXp(1400) = 8
    // 6. forestHealth should be restored to 100
    // 7. transactions category should be converted from 'Tabungan' to 'Tabungan Terpakai'
    const finalState = useAppStore.getState();
    expect(finalState.mainGoal?.name).toBe('');
    expect(finalState.mainGoal?.target).toBe(0);
    expect(finalState.mainGoal?.current).toBe(1000000);
    expect(finalState.xp).toBe(1400);
    expect(finalState.levelNumber).toBe(8);
    expect(finalState.forestHealth).toBe(100);
    expect(finalState.transactions[0].category).toBe('Tabungan Terpakai');
  });
});
