import { describe, it, expect, beforeEach } from 'vitest';
import { setTokens, clearTokens } from '@/services/api';
import { getArticles, getArticle, createArticle, updateArticle, deleteArticle } from '@/services/article.service';
import { mockTokens } from '../mocks/data';

describe('Articles API', () => {
  beforeEach(() => {
    clearTokens();
    localStorage.clear();
  });
  const auth = () => setTokens({ accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken });

  describe('GET /api/articles', () => {
    it('should fetch paginated articles (200)', async () => {
      auth();
      const res = await getArticles();
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('items');
      expect(res.data).toHaveProperty('pagination');
      expect(Array.isArray(res.data.items)).toBe(true);
      expect(res.data.pagination).toMatchObject({ page: expect.any(Number), total: expect.any(Number), pages: expect.any(Number) });
    });

    it('should validate article shape in list', async () => {
      auth();
      const res = await getArticles();
      const a = res.data.items[0];
      expect(a).toHaveProperty('_id');
      expect(a).toHaveProperty('title');
      expect(a).toHaveProperty('slug');
      expect(a).toHaveProperty('category');
      expect(a).toHaveProperty('body');
      expect(a).toHaveProperty('author');
      expect(a).toHaveProperty('status');
      // list may omit body length check, but we have it
    });

    it('should support filters: status and category', async () => {
      auth();
      const byStatus = await getArticles({ status: 'published' });
      byStatus.data.items.forEach((a) => expect(a.status).toBe('published'));
      const byCat = await getArticles({ category: 'cosmetic' });
      byCat.data.items.forEach((a) => expect(a.category).toBe('cosmetic'));
    });

    it('should return 401 without auth', async () => {
      await expect(getArticles()).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should fetch single article (200)', async () => {
      auth();
      const res = await getArticle('art_001');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('_id', 'art_001');
      expect(res.data).toHaveProperty('body');
      expect(typeof res.data.body).toBe('string');
    });

    it('should return 404 for unknown id', async () => {
      auth();
      await expect(getArticle('not_found')).rejects.toMatchObject({ response: { status: 404 } });
    });

    it('should return 401 without auth', async () => {
      await expect(getArticle('art_001')).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('POST /api/articles', () => {
    const valid = { title: 'New Article', category: 'preventive-care', body: 'Content body', author: 'Dr Ekta' };

    it('should create article with valid payload (201)', async () => {
      auth();
      const res = await createArticle(valid);
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('_id');
      expect(res.data).toHaveProperty('title', valid.title);
      expect(res.data).toHaveProperty('category', valid.category);
      expect(res.data).toHaveProperty('body', valid.body);
    });

    it.each([
      [{ category: 'preventive-care', body: 'b', author: 'a' }, 'title'],
      [{ title: 'T', body: 'b', author: 'a' }, 'category'],
      [{ title: 'T', category: 'preventive-care', author: 'a' }, 'body'],
      [{ title: 'T', category: 'preventive-care', body: 'b' }, 'author'],
    ])('should return 422 when %s missing', async (payload: any, field) => {
      auth();
      try {
        await createArticle(payload);
        expect.fail('should throw');
      } catch (e: any) {
        expect(e.response.status).toBe(422);
        expect(e.response.data.details.some((d: any) => d.field === field)).toBe(true);
      }
    });

    it('should return 422 when all required missing', async () => {
      auth();
      try {
        await createArticle({} as any);
        expect.fail('should throw');
      } catch (e: any) {
        expect(e.response.status).toBe(422);
        expect(e.response.data.details.length).toBe(4);
      }
    });

    it('should return 401 without auth', async () => {
      await expect(createArticle(valid)).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('PUT /api/articles/:id', () => {
    it('should update article (200)', async () => {
      auth();
      const res = await updateArticle('art_001', { title: 'Updated Title' });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('title', 'Updated Title');
      expect(res.data).toHaveProperty('updatedAt');
    });

    it('should allow partial update with status', async () => {
      auth();
      const res = await updateArticle('art_001', { status: 'published' });
      expect(res.status).toBe(200);
      expect(res.data.status).toBe('published');
    });

    it('should return 404 for unknown id', async () => {
      auth();
      await expect(updateArticle('nope', { title: 'X' })).rejects.toMatchObject({ response: { status: 404 } });
    });

    it('should return 422 when title is empty', async () => {
      auth();
      await expect(updateArticle('art_001', { title: '' } as any)).rejects.toMatchObject({ response: { status: 422 } });
    });

    it('should return 401 without auth', async () => {
      await expect(updateArticle('art_001', { title: 'NoAuth' })).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('DELETE /api/articles/:id', () => {
    it('should delete article (200)', async () => {
      auth();
      const res = await deleteArticle('art_001');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('message');
    });

    it('should return 404 for unknown id', async () => {
      auth();
      await expect(deleteArticle('ghost')).rejects.toMatchObject({ response: { status: 404 } });
    });

    it('should return 401 without auth', async () => {
      await expect(deleteArticle('art_001')).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('Authorization matrix', () => {
    it.each([
      ['GET list', () => getArticles()],
      ['GET one', () => getArticle('art_001')],
      ['POST', () => createArticle({ title: 'T', category: 'preventive-care', body: 'b', author: 'a' })],
      ['PUT', () => updateArticle('art_001', { title: 'T' })],
      ['DELETE', () => deleteArticle('art_001')],
    ])('%s without token -> 401', async (_label, fn) => {
      clearTokens();
      await expect(fn()).rejects.toMatchObject({ response: { status: 401 } });
    });

    it.each([
      ['GET list', () => getArticles()],
      ['POST', () => createArticle({ title: 'Auth T', category: 'preventive-care', body: 'b', author: 'a' })],
    ])('%s with token -> 2xx', async (_label, fn) => {
      auth();
      const res = await fn();
      expect([200, 201]).toContain(res.status);
    });
  });
});
