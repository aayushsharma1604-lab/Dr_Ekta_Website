import { describe, it, expect, beforeEach } from 'vitest';
import { setTokens, clearTokens, patch } from '@/services/api';
import { getClinicInfo, updateClinicInfo } from '@/services/clinicInfo.service';
import { mockTokens } from '../mocks/data';

describe('Clinic Info API (singleton)', () => {
  beforeEach(() => {
    clearTokens();
    localStorage.clear();
  });
  const auth = () => setTokens({ accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken });

  describe('GET /api/clinic-info', () => {
    it('should fetch clinic info singleton (200)', async () => {
      auth();
      const res = await getClinicInfo();
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('practiceName');
      expect(res.data).toHaveProperty('address');
      expect(res.data).toHaveProperty('phones');
      expect(res.data).toHaveProperty('email');
      expect(res.data.address).toMatchObject({ city: expect.any(String) });
      expect(Array.isArray(res.data.phones)).toBe(true);
    });

    it('should return object, not paginated list', async () => {
      auth();
      const res = await getClinicInfo();
      expect(res.data).not.toHaveProperty('items');
      expect(res.data).not.toHaveProperty('pagination');
      expect(res.data).toHaveProperty('practiceName', 'Dr Ekta Dental Clinic');
    });

    it('should return 401 without auth', async () => {
      await expect(getClinicInfo()).rejects.toMatchObject({ response: { status: 401 } });
    });

    it('should be retrievable with different token values after setTokens', async () => {
      setTokens({ accessToken: 'any-valid-token', refreshToken: 'any' });
      const res = await getClinicInfo();
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/clinic-info', () => {
    it('should update clinic info with full payload (200)', async () => {
      auth();
      const payload = {
        practiceName: 'Updated Clinic',
        email: 'new@example.com',
        phones: ['+911111111111'],
      };
      const res = await updateClinicInfo(payload);
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('practiceName', 'Updated Clinic');
      expect(res.data).toHaveProperty('email', 'new@example.com');
      expect(res.data).toHaveProperty('phones', ['+911111111111']);
      expect(res.data).toHaveProperty('updatedAt');
    });

    it('should support partial update (single field)', async () => {
      auth();
      const res = await updateClinicInfo({ practiceName: 'Partial Update' });
      expect(res.status).toBe(200);
      expect(res.data.practiceName).toBe('Partial Update');
      // other fields preserved from mock
      expect(res.data).toHaveProperty('address');
    });

    it('should persist address updates', async () => {
      auth();
      const res = await updateClinicInfo({ address: { city: 'Mumbai', pincode: '400001' } });
      expect(res.status).toBe(200);
      expect(res.data.address).toMatchObject({ city: 'Mumbai', pincode: '400001' });
    });

    it('should handle empty payload (backend is lenient, returns 200 with merged mock)', async () => {
      auth();
      const res = await updateClinicInfo({});
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('practiceName');
    });

    it('should support socialLinks update', async () => {
      auth();
      const res = await updateClinicInfo({ socialLinks: [{ platform: 'facebook', url: 'https://fb.com/test' }] });
      expect(res.status).toBe(200);
      expect(res.data.socialLinks).toEqual([{ platform: 'facebook', url: 'https://fb.com/test' }]);
    });

    it('should return 401 without auth', async () => {
      await expect(updateClinicInfo({ practiceName: 'NoAuth' })).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('PATCH /api/clinic-info (if any)', () => {
    it('should support PATCH for partial update', async () => {
      auth();
      const res = await patch('/api/clinic-info', { practiceName: 'Patched Name' });
      expect(res.status).toBe(200);
      expect((res.data as any).practiceName).toBe('Patched Name');
    });

    it('PATCH without auth -> 401', async () => {
      await expect(patch('/api/clinic-info', { practiceName: 'NoAuth' })).rejects.toMatchObject({
        response: { status: 401 },
      });
    });
  });

  describe('Authorization cases', () => {
    it('GET with token succeeds, without fails', async () => {
      auth();
      expect((await getClinicInfo()).status).toBe(200);
      clearTokens();
      await expect(getClinicInfo()).rejects.toMatchObject({ response: { status: 401 } });
    });

    it('PUT with token succeeds, without fails', async () => {
      auth();
      expect((await updateClinicInfo({ practiceName: 'Ok' })).status).toBe(200);
      clearTokens();
      await expect(updateClinicInfo({ practiceName: 'Fail' })).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('Response structure validation', () => {
    it('should have stable shape after update', async () => {
      auth();
      const before = await getClinicInfo();
      const after = await updateClinicInfo({ email: 'stable@example.com' });
      // Keys should be superset
      expect(Object.keys(after.data)).toEqual(expect.arrayContaining(Object.keys(before.data)));
      expect(after.data).toHaveProperty('updatedAt');
    });
  });
});
