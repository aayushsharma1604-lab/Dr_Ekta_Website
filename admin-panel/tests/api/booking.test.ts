import { describe, it, expect, beforeEach } from 'vitest';
import { setTokens, clearTokens, patch, get } from '@/services/api';
import { getBookingProvider, updateBookingProvider, getPractoClicks } from '@/services/booking.service';
import { mockTokens } from '../mocks/data';

describe('Booking Provider API', () => {
  beforeEach(() => {
    clearTokens();
    localStorage.clear();
  });
  const auth = () => setTokens({ accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken });

  describe('GET /api/booking-provider', () => {
    it('should fetch singleton (200)', async () => {
      auth();
      const res = await getBookingProvider();
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('providerName', 'practo');
      expect(res.data).toHaveProperty('bookingUrl');
    });
    it('should return 401 without auth', async () => {
      await expect(getBookingProvider()).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('PUT /api/booking-provider', () => {
    it('should upsert with PUT (200)', async () => {
      auth();
      const res = await updateBookingProvider({ bookingUrl: 'https://practo.com/new', isActive: false });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('bookingUrl', 'https://practo.com/new');
      expect(res.data).toHaveProperty('isActive', false);
      // providerName defaults to practo when omitted
      expect((res.data as any).providerName).toBe('practo');
    });

    it('should allow full payload with providerName override', async () => {
      auth();
      const res = await updateBookingProvider({ providerName: 'practo', profileUrl: 'https://practo.com/x', bookingUrl: 'https://practo.com/y' });
      expect(res.status).toBe(200);
      expect(res.data.profileUrl).toBe('https://practo.com/x');
    });

    it('should return 401 without auth', async () => {
      await expect(updateBookingProvider({ bookingUrl: 'https://x.com' })).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('PATCH /api/booking-provider', () => {
    it('should support PATCH partial update (200)', async () => {
      auth();
      const res = await patch('/api/booking-provider', { isActive: true });
      expect(res.status).toBe(200);
      expect((res.data as any).isActive).toBe(true);
    });
    it('should return 401 without auth for PATCH', async () => {
      await expect(patch('/api/booking-provider', { isActive: true })).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('GET /api/practo-clicks', () => {
    it('should fetch clicks stats (200)', async () => {
      auth();
      const res = await getPractoClicks();
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('totalClicks');
      expect(res.data).toHaveProperty('dailyStats');
      expect(Array.isArray((res.data as any).dailyStats)).toBe(true);
    });

    it('should support date range params', async () => {
      auth();
      const res = await getPractoClicks({ startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(res.status).toBe(200);
    });

    it('should return 401 without auth', async () => {
      await expect(getPractoClicks()).rejects.toMatchObject({ response: { status: 401 } });
    });

    it('should also be accessible via generic get helper', async () => {
      auth();
      const res = await get('/api/practo-clicks', { startDate: '2026-01-01' });
      expect(res.status).toBe(200);
    });
  });
});
