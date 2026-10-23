import { describe, it, expect, beforeEach } from 'vitest';
import { setTokens, clearTokens } from '@/services/api';
import { getTreatments, getTreatment, createTreatment, updateTreatment, deleteTreatment } from '@/services/treatment.service';
import { mockTokens } from '../mocks/data';

describe('Treatments API', () => {
  beforeEach(() => {
    clearTokens();
    localStorage.clear();
  });

  const auth = () => setTokens({ accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken });

  describe('GET /api/treatments', () => {
    it('should fetch paginated list with auth (200)', async () => {
      auth();
      const res = await getTreatments();
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('items');
      expect(res.data).toHaveProperty('pagination');
      expect(Array.isArray(res.data.items)).toBe(true);
      expect(res.data.items.length).toBeGreaterThan(0);
      expect(res.data.pagination).toMatchObject({ page: expect.any(Number), limit: expect.any(Number), total: expect.any(Number), pages: expect.any(Number) });
    });

    it('should return treatment objects with expected shape', async () => {
      auth();
      const res = await getTreatments();
      const item = res.data.items[0];
      expect(item).toHaveProperty('_id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('slug');
      expect(item).toHaveProperty('status');
      expect(['draft', 'published']).toContain(item.status);
    });

    it('should support pagination params', async () => {
      auth();
      const res = await getTreatments({ page: 1, limit: 1 });
      expect(res.status).toBe(200);
      expect(res.data.pagination.page).toBe(1);
      expect(res.data.pagination.limit).toBe(1);
    });

    it('should filter by status', async () => {
      auth();
      const res = await getTreatments({ status: 'published' });
      expect(res.status).toBe(200);
      res.data.items.forEach((t) => expect(t.status).toBe('published'));
    });

    it('should filter by search', async () => {
      auth();
      const res = await getTreatments({ search: 'Dental' });
      expect(res.status).toBe(200);
      expect(res.data.items.length).toBeGreaterThan(0);
    });

    it('should return 401 without Bearer token', async () => {
      clearTokens();
      await expect(getTreatments()).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('GET /api/treatments/:id', () => {
    it('should fetch single treatment when authorized (200)', async () => {
      auth();
      const res = await getTreatment('treat_001');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('_id', 'treat_001');
      expect(res.data).toHaveProperty('title');
      expect(res.data).toHaveProperty('slug');
    });

    it('should return 404 for unknown id', async () => {
      auth();
      await expect(getTreatment('nonexistent_id')).rejects.toMatchObject({ response: { status: 404 } });
      try {
        await getTreatment('nonexistent_id');
      } catch (e: any) {
        expect(e.response.data).toHaveProperty('code', 'NOT_FOUND');
        expect(e.response.data).toHaveProperty('error');
      }
    });

    it('should return 401 without auth', async () => {
      await expect(getTreatment('treat_001')).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('POST /api/treatments', () => {
    it('should create treatment with valid payload (201)', async () => {
      auth();
      const res = await createTreatment({ title: 'New Treatment', status: 'draft' });
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('_id');
      expect(res.data).toHaveProperty('title', 'New Treatment');
      expect(res.data).toHaveProperty('slug');
      expect(res.data.slug).toMatch(/new-treatment/);
    });

    it('should accept full payload with sections and seo', async () => {
      auth();
      const res = await createTreatment({
        title: 'Full Treatment',
        slug: 'full-treatment',
        status: 'published',
        sections: { what: 'desc', who: 'everyone' },
        faqs: [{ question: 'Q?', answer: 'A' }],
        seo: { metaTitle: 'SEO title' },
      });
      expect(res.status).toBe(201);
      expect(res.data.sections).toMatchObject({ what: 'desc' });
    });

    it('should return 422 when title missing', async () => {
      auth();
      await expect(createTreatment({ title: '' } as any)).rejects.toMatchObject({ response: { status: 422 } });
      try {
        await createTreatment({ title: '' } as any);
      } catch (e: any) {
        expect(e.response.data.details[0].field).toBe('title');
        expect(e.response.data.details[0]).toHaveProperty('message');
      }
    });

    it('should return 422 when payload empty', async () => {
      auth();
      await expect(createTreatment({} as any)).rejects.toMatchObject({ response: { status: 422 } });
    });

    it('should return 401 without auth', async () => {
      await expect(createTreatment({ title: 'Should Fail' })).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('PUT /api/treatments/:id', () => {
    it('should update treatment when authorized (200)', async () => {
      auth();
      const res = await updateTreatment('treat_001', { title: 'Updated Title' });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('_id', 'treat_001');
      expect(res.data).toHaveProperty('title', 'Updated Title');
      expect(res.data).toHaveProperty('updatedAt');
    });

    it('should support partial update (status only)', async () => {
      auth();
      const res = await updateTreatment('treat_001', { status: 'draft' });
      expect(res.status).toBe(200);
      expect(res.data.status).toBe('draft');
    });

    it('should return 404 for unknown id', async () => {
      auth();
      await expect(updateTreatment('unknown_id', { title: 'X' })).rejects.toMatchObject({ response: { status: 404 } });
    });

    it('should return 422 when title is empty string', async () => {
      auth();
      await expect(updateTreatment('treat_001', { title: '' } as any)).rejects.toMatchObject({ response: { status: 422 } });
    });

    it('should return 401 without auth', async () => {
      await expect(updateTreatment('treat_001', { title: 'No Auth' })).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('DELETE /api/treatments/:id', () => {
    it('should delete treatment when authorized (200)', async () => {
      auth();
      const res = await deleteTreatment('treat_001');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('message');
    });

    it('should return 404 for unknown id', async () => {
      auth();
      await expect(deleteTreatment('does_not_exist')).rejects.toMatchObject({ response: { status: 404 } });
    });

    it('should return 401 without auth', async () => {
      await expect(deleteTreatment('treat_001')).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('Authorization matrix', () => {
    it.each([
      ['GET list', () => getTreatments()],
      ['GET one', () => getTreatment('treat_001')],
      ['POST', () => createTreatment({ title: 'T' })],
      ['PUT', () => updateTreatment('treat_001', { title: 'T' })],
      ['DELETE', () => deleteTreatment('treat_001')],
    ])('%s without token -> 401', async (_label, fn) => {
      clearTokens();
      await expect(fn()).rejects.toMatchObject({ response: { status: 401 } });
    });

    it.each([
      ['GET list', () => getTreatments()],
      ['GET one', () => getTreatment('treat_001')],
      ['POST', () => createTreatment({ title: 'Auth Test' })],
      ['PUT', () => updateTreatment('treat_001', { title: 'Auth Test' })],
      ['DELETE', () => deleteTreatment('treat_001')],
    ])('%s with token -> success (2xx)', async (_label, fn) => {
      auth();
      const res = await fn();
      expect([200, 201]).toContain(res.status);
    });
  });
});
