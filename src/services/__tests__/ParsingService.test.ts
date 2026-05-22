import { describe, it, expect } from 'vitest';
import { ParsingService } from '../ParsingService';

describe('ParsingService Keyword Mapping Tests', () => {
  describe('detectCategoryFromKeywords', () => {
    it('should map food-related keywords to Makanan (case-insensitive)', () => {
      expect(ParsingService.detectCategoryFromKeywords('Pembelian Alfamart', '')).toBe('Makanan');
      expect(ParsingService.detectCategoryFromKeywords('indomaret point', '')).toBe('Makanan');
      expect(ParsingService.detectCategoryFromKeywords('Makan siang di KFC', '')).toBe('Makanan');
      expect(ParsingService.detectCategoryFromKeywords('gofood order', '')).toBe('Makanan');
      expect(ParsingService.detectCategoryFromKeywords('Ice Tea Kelapa Gading', '')).toBe('Makanan');
      expect(ParsingService.detectCategoryFromKeywords('kopi susu senja', '')).toBe('Makanan');
    });

    it('should map transport-related keywords to Transport (case-insensitive)', () => {
      expect(ParsingService.detectCategoryFromKeywords('Gojek Ride', '')).toBe('Transport');
      expect(ParsingService.detectCategoryFromKeywords('grabcar billing', '')).toBe('Transport');
      expect(ParsingService.detectCategoryFromKeywords('Perjalanan Grab', '')).toBe('Transport');
    });

    it('should default to Lainnya for unmapped keywords', () => {
      expect(ParsingService.detectCategoryFromKeywords('Netflix Subscription', '')).toBe('Lainnya');
      expect(ParsingService.detectCategoryFromKeywords('Steam Wallet', '')).toBe('Lainnya');
    });

    it('should NOT map "invoice" or "service" to Makanan due to substring "ice"', () => {
      expect(ParsingService.detectCategoryFromKeywords('Invoice Pembayaran Mandiri', '')).toBe('Lainnya');
      expect(ParsingService.detectCategoryFromKeywords('Mandiri Service Charge', '')).toBe('Lainnya');
      expect(ParsingService.detectCategoryFromKeywords('Device activation', '')).toBe('Lainnya');
      expect(ParsingService.detectCategoryFromKeywords('Price discount', '')).toBe('Lainnya');
    });
  });
});
