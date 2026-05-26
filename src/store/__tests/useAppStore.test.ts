import { describe, it, expect, vi } from 'vitest';

// Mock Supabase client to prevent network issues during unit tests
vi.mock('../../utils/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: async () => ({ data: [], error: null })
        })
      })
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    }
  })
}));

import { 
  calculateLevelFromXp, 
  getLevelName, 
  calculateHealthFromTransactions,
  Transaction 
} from '../useAppStore';

describe('Firest Gamification & Core Financial Logic Unit Tests', () => {

  describe('calculateLevelFromXp', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevelFromXp(0)).toBe(1);
    });

    it('should return level 1 for 199 XP (just below threshold)', () => {
      expect(calculateLevelFromXp(199)).toBe(1);
    });

    it('should return level 2 for exactly 200 XP (threshold met)', () => {
      expect(calculateLevelFromXp(200)).toBe(2);
    });

    it('should return level 2 for 399 XP', () => {
      expect(calculateLevelFromXp(399)).toBe(2);
    });

    it('should return level 3 for exactly 400 XP', () => {
      expect(calculateLevelFromXp(400)).toBe(3);
    });

    it('should return level 3 for realistic student XP (e.g., 500 XP)', () => {
      expect(calculateLevelFromXp(500)).toBe(3);
    });

    it('should cap at level 12 for high XP amounts (e.g., 2500 XP)', () => {
      expect(calculateLevelFromXp(2500)).toBe(12);
    });

    it('should cap at level 12 even for extremely high XP amounts (e.g., 10000 XP)', () => {
      expect(calculateLevelFromXp(10000)).toBe(12);
    });
  });

  describe('getLevelName', () => {
    it('should return Bibit for level 1 and 2', () => {
      expect(getLevelName(1)).toBe('Bibit');
      expect(getLevelName(2)).toBe('Bibit');
    });

    it('should return Tunas for level 3 and 4', () => {
      expect(getLevelName(3)).toBe('Tunas');
      expect(getLevelName(4)).toBe('Tunas');
    });

    it('should return Pohon Muda for level 5 and 6', () => {
      expect(getLevelName(5)).toBe('Pohon Muda');
      expect(getLevelName(6)).toBe('Pohon Muda');
    });

    it('should return Hutan for level 7 and 8', () => {
      expect(getLevelName(7)).toBe('Hutan');
      expect(getLevelName(8)).toBe('Hutan');
    });

    it('should return Hutan Hujan for level 9 and 10', () => {
      expect(getLevelName(9)).toBe('Hutan Hujan');
      expect(getLevelName(10)).toBe('Hutan Hujan');
    });

    it('should return Ekosistem for level 11 and 12', () => {
      expect(getLevelName(11)).toBe('Ekosistem');
      expect(getLevelName(12)).toBe('Ekosistem');
    });
  });

  describe('calculateHealthFromTransactions (Forest Health Rules)', () => {
    it('should return 100% health when there are no transactions', () => {
      const transactions: Transaction[] = [];
      const health = calculateHealthFromTransactions(transactions, 1);
      expect(health).toBe(100);
    });

    it('should return 100% health when expenses are below the monthly budget threshold (2,250,000)', () => {
      const now = new Date().toISOString();
      const transactions: Transaction[] = [
        { title: 'Beli Buku Kuliah', amount: 250000, category: 'Edukasi', type: 'expense', date: now },
        { title: 'Makan Siang', amount: 50000, category: 'Makanan', type: 'expense', date: now },
        { title: 'Bensin', amount: 100000, category: 'Transport', type: 'expense', date: now }
      ];
      const health = calculateHealthFromTransactions(transactions, 1);
      expect(health).toBe(100);
    });

    it('should return 100% health when there are only income transactions', () => {
      const now = new Date().toISOString();
      const transactions: Transaction[] = [
        { title: 'Bulanan Ortu', amount: 1500000, category: 'Lainnya', type: 'income', date: now },
        { title: 'Gaji Part-time', amount: 1000000, category: 'Lainnya', type: 'income', date: now }
      ];
      const health = calculateHealthFromTransactions(transactions, 1);
      expect(health).toBe(100);
    });

    it('should return 50% health (forest starts to dry) when expenses exceed the monthly budget threshold', () => {
      const now = new Date().toISOString();
      const transactions: Transaction[] = [
        { title: 'Beli HP Baru', amount: 2500000, category: 'Elektronik', type: 'expense', date: now }
      ];
      const health = calculateHealthFromTransactions(transactions, 1);
      expect(health).toBe(50);
    });

    it('should ignore expenses from previous periods when calculating current health status', () => {
      const now = new Date();
      
      // Calculate a date that is clearly in the previous budget cycle month
      const pastDate = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString();
      const currentDate = now.toISOString();

      const transactions: Transaction[] = [
        // Huge expense in the past cycle - should be ignored now
        { title: 'Laptop Gaming (Bulan Lalu)', amount: 15000000, category: 'Elektronik', type: 'expense', date: pastDate },
        // Moderate expense in current cycle - should keep forest healthy
        { title: 'Belanja Bulanan', amount: 200000, category: 'Belanja', type: 'expense', date: currentDate }
      ];

      // Assuming budget reset date is 1st of the month
      const health = calculateHealthFromTransactions(transactions, 1);
      expect(health).toBe(100);
    });
  });
});
