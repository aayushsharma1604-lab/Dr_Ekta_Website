import { describe, it, expect, beforeEach } from 'vitest';
import { setTokens, clearTokens } from '@/services/api';
import { getGallery, getGalleryItem, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/services/gallery.service';
import { mockTokens } from '../mocks/data';

describe('Gallery API', () => {
  beforeEach(() => {
    clearTokens();
    localStorage.clear();
  });
  const auth = () => setTokens({ accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken });

  describe('GET /api/gallery', () => {
    it('should fetch paginated gallery (200)', async () => {
      auth();
      const res = await getGallery();
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('items');
      expect(res.data).toHaveProperty('pagination');
      expect(res.data.items[0]).toHaveProperty('_id');
      expect(res.data.items[0]).toHaveProperty('beforeImg');
      expect(res.data.items[0]).toHaveProperty('afterImg');
    });

    it('should return 401 without auth', async () => {
      await expect(getGallery()).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('GET /api/gallery/:id', () => {
    it('should fetch single item (200)', async () => {
      auth();
      const res = await getGalleryItem('gal_001');
      expect(res.status).toBe(200);
      expect(res.data._id).toBe('gal_001');
    });
    it('should return 404 for unknown', async () => {
      auth();
      await expect(getGalleryItem('nope')).rejects.toMatchObject({ response: { status: 404 } });
    });
    it('should return 401 without auth', async () => {
      await expect(getGalleryItem('gal_001')).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('POST /api/gallery', () => {
    it('should create with beforeImg and afterImg (201)', async () => {
      auth();
      const res = await createGalleryItem({ beforeImg: 'media_001', afterImg: 'media_002', treatmentTag: 'dental-implant' });
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('_id');
      expect(res.data).toHaveProperty('beforeImg', 'media_001');
    });
    it('should return 422 when beforeImg missing', async () => {
      auth();
      await expect(createGalleryItem({ afterImg: 'media_002' } as any)).rejects.toMatchObject({ response: { status: 422 } });
    });
    it('should return 422 when afterImg missing', async () => {
      auth();
      await expect(createGalleryItem({ beforeImg: 'media_001' } as any)).rejects.toMatchObject({ response: { status: 422 } });
    });
    it('should return 401 without auth', async () => {
      await expect(createGalleryItem({ beforeImg: 'a', afterImg: 'b' })).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('PUT /api/gallery/:id', () => {
    it('should update gallery item (200)', async () => {
      auth();
      const res = await updateGalleryItem('gal_001', { content: 'Updated content' });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('content', 'Updated content');
    });
    it('should return 404 for unknown', async () => {
      auth();
      await expect(updateGalleryItem('ghost', { content: 'x' })).rejects.toMatchObject({ response: { status: 404 } });
    });
    it('should return 401 without auth', async () => {
      await expect(updateGalleryItem('gal_001', { content: 'x' })).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('DELETE /api/gallery/:id', () => {
    it('should delete (200)', async () => {
      auth();
      const res = await deleteGalleryItem('gal_001');
      expect(res.status).toBe(200);
    });
    it('should return 404 for unknown', async () => {
      auth();
      await expect(deleteGalleryItem('nope')).rejects.toMatchObject({ response: { status: 404 } });
    });
    it('should return 401 without auth', async () => {
      await expect(deleteGalleryItem('gal_001')).rejects.toMatchObject({ response: { status: 401 } });
    });
  });
});
