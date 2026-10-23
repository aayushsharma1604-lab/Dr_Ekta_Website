import { http, HttpResponse } from 'msw';
import {
  mockUser,
  mockTokens,
  mockTreatments,
  mockArticles,
  mockMediaAssets,
  mockClinicInfo,
  mockGalleryItems,
  mockBookingProvider,
  paginated,
} from './data';

const API = ''; // api.ts uses baseURL '' so requests are /api/...

function isAuthorized(request: Request): boolean {
  const auth = request.headers.get('Authorization') || request.headers.get('authorization');
  return !!auth && auth.startsWith('Bearer ') && auth.split(' ')[1] !== '';
}

function unauthorized() {
  return HttpResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
}

function validationError(details: Array<{ field: string; message: string }>) {
  return HttpResponse.json(
    { error: 'Validation Error', message: 'Validation failed', details, code: 'VALIDATION_ERROR' },
    { status: 422 }
  );
}

export const handlers = [
  // ---------------------------------------------------------------------------
  // Auth — /api/auth/*
  // ---------------------------------------------------------------------------
  http.post(`${API}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return validationError([
        ...(!body.email ? [{ field: 'email', message: 'email is required' }] : []),
        ...(!body.password ? [{ field: 'password', message: 'password is required' }] : []),
      ]);
    }
    if (body.email === 'admin@example.com' && body.password === 'correctpassword') {
      return HttpResponse.json({ user: mockUser, ...mockTokens }, { status: 200 });
    }
    if (body.email !== 'admin@example.com') {
      return HttpResponse.json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, { status: 401 });
    }
    return HttpResponse.json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, { status: 401 });
  }),

  http.post(`${API}/api/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string };
    if (!body.refreshToken) {
      return validationError([{ field: 'refreshToken', message: 'refreshToken is required' }]);
    }
    if (body.refreshToken === mockTokens.refreshToken || body.refreshToken === 'valid-refresh-token') {
      return HttpResponse.json(
        { accessToken: 'new.mock.access.token', refreshToken: 'new.mock.refresh.token' },
        { status: 200 }
      );
    }
    return HttpResponse.json({ error: 'Invalid refresh token', code: 'INVALID_TOKEN' }, { status: 401 });
  }),

  http.post(`${API}/api/auth/logout`, async () => {
    // Always 200 per spec, even without token
    return HttpResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  }),

  http.get(`${API}/api/auth/me`, ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    return HttpResponse.json({ user: mockUser, data: mockUser }, { status: 200 });
  }),

  // ---------------------------------------------------------------------------
  // Treatments — /api/treatments
  // ---------------------------------------------------------------------------
  http.get(`${API}/api/treatments`, ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    let items = [...mockTreatments];
    if (status) items = items.filter((t) => t.status === status);
    if (search) items = items.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);
    return HttpResponse.json(paginated(items, page, limit), { status: 200 });
  }),

  http.get(`${API}/api/treatments/:id`, ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const item = mockTreatments.find((t) => t._id === params.id);
    if (!item) return HttpResponse.json({ error: 'Not Found', message: 'Treatment not found', code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json(item, { status: 200 });
  }),

  http.post(`${API}/api/treatments`, async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const body = (await request.json()) as { title?: string };
    if (!body.title || body.title.trim() === '') {
      return validationError([{ field: 'title', message: 'title is required' }]);
    }
    const created = {
      _id: 'treat_new_' + Date.now(),
      slug: body.title.toLowerCase().replace(/\s+/g, '-'),
      title: body.title,
      status: 'draft' as const,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put(`${API}/api/treatments/:id`, async ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const exists = mockTreatments.find((t) => t._id === params.id);
    if (!exists) return HttpResponse.json({ error: 'Not Found', message: 'Treatment not found', code: 'NOT_FOUND' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    // If title provided but empty => 422
    if ('title' in body && (!body.title || (typeof body.title === 'string' && body.title.trim() === ''))) {
      return validationError([{ field: 'title', message: 'title must not be empty' }]);
    }
    const updated = { ...exists, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(updated, { status: 200 });
  }),

  http.delete(`${API}/api/treatments/:id`, ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const exists = mockTreatments.find((t) => t._id === params.id);
    if (!exists) return HttpResponse.json({ error: 'Not Found', message: 'Treatment not found', code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json({ message: 'Treatment deleted' }, { status: 200 });
  }),

  // ---------------------------------------------------------------------------
  // Articles — /api/articles
  // ---------------------------------------------------------------------------
  http.get(`${API}/api/articles`, ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    let items = [...mockArticles];
    if (status) items = items.filter((a) => a.status === status);
    if (category) items = items.filter((a) => a.category === category);
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);
    return HttpResponse.json(paginated(items, page, limit), { status: 200 });
  }),

  http.get(`${API}/api/articles/:id`, ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const item = mockArticles.find((a) => a._id === params.id);
    if (!item) return HttpResponse.json({ error: 'Not Found', message: 'Article not found', code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json(item, { status: 200 });
  }),

  http.post(`${API}/api/articles`, async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const body = (await request.json()) as { title?: string; category?: string; body?: string; author?: string };
    const details: Array<{ field: string; message: string }> = [];
    if (!body.title) details.push({ field: 'title', message: 'title is required' });
    if (!body.category) details.push({ field: 'category', message: 'category is required' });
    if (!body.body) details.push({ field: 'body', message: 'body is required' });
    if (!body.author) details.push({ field: 'author', message: 'author is required' });
    if (details.length) return validationError(details);
    const created = {
      _id: 'art_new_' + Date.now(),
      slug: (body.title as string).toLowerCase().replace(/\s+/g, '-'),
      ...body,
      status: (body as Record<string, unknown>).status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put(`${API}/api/articles/:id`, async ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const exists = mockArticles.find((a) => a._id === params.id);
    if (!exists) return HttpResponse.json({ error: 'Not Found', message: 'Article not found', code: 'NOT_FOUND' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    if ('title' in body && !body.title) return validationError([{ field: 'title', message: 'title must not be empty' }]);
    return HttpResponse.json({ ...exists, ...body, updatedAt: new Date().toISOString() }, { status: 200 });
  }),

  http.delete(`${API}/api/articles/:id`, ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const exists = mockArticles.find((a) => a._id === params.id);
    if (!exists) return HttpResponse.json({ error: 'Not Found', message: 'Article not found', code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json({ message: 'Article deleted' }, { status: 200 });
  }),

  // ---------------------------------------------------------------------------
  // Media — /api/media
  // ---------------------------------------------------------------------------
  http.get(`${API}/api/media`, ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const url = new URL(request.url);
    const mimeType = url.searchParams.get('mimeType');
    let items = [...mockMediaAssets];
    if (mimeType) items = items.filter((m) => m.mimeType === mimeType);
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);
    return HttpResponse.json(paginated(items, page, limit), { status: 200 });
  }),

  http.get(`${API}/api/media/:id`, ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const item = mockMediaAssets.find((m) => m._id === params.id);
    if (!item) return HttpResponse.json({ error: 'Not Found', message: 'Media not found', code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json(item, { status: 200 });
  }),

  http.post(`${API}/api/media/upload`, async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const mockScenario = request.headers.get('x-mock-scenario');
    if (mockScenario === 'no-file' || mockScenario === 'empty-file') {
      return validationError([{ field: 'file', message: 'file is required' }]);
    }
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data') || mockScenario?.startsWith('multipart')) {
      const mockFilename = request.headers.get('x-mock-filename') || 'via-upload.jpg';
      const mockMime = request.headers.get('x-mock-mimetype') || 'image/jpeg';
      const mockSize = Number(request.headers.get('x-mock-size') || 100);
      return HttpResponse.json(
        {
          _id: 'media_new_' + Date.now(),
          filename: mockFilename,
          url: `https://res.cloudinary.com/demo/image/upload/${mockFilename}`,
          mimeType: mockMime,
          size: mockSize,
        },
        { status: 201 }
      );
    }
    // JSON signed upload flow
    let body: { filename?: string; mimeType?: string; size?: number } = {};
    try {
      body = (await request.json()) as typeof body;
    } catch {
      // empty
    }
    if (!body.filename || !body.mimeType || !body.size) {
      const details: Array<{ field: string; message: string }> = [];
      if (!body.filename) details.push({ field: 'filename', message: 'filename is required' });
      if (!body.mimeType) details.push({ field: 'mimeType', message: 'mimeType is required' });
      if (!body.size) details.push({ field: 'size', message: 'size is required' });
      return validationError(details);
    }
    return HttpResponse.json(
      {
        uploadUrl: 'https://api.cloudinary.com/v1_1/demo/image/upload',
        publicId: `demo/${body.filename}`,
        apiKey: 'test_api_key',
        timestamp: Date.now(),
        signature: 'mock_signature',
        paramsToSign: { timestamp: Date.now() },
      },
      { status: 200 }
    );
  }),

  // Also handle direct multipart POST to /api/media (used by uploadFile helper)
  // NOTE: This handler avoids reading FormData body to prevent jsdom/XHR hangs.
  // It returns deterministic success for authorized requests. Tests that need
  // precise file-name assertions should mock `api.post` directly (see media.test.ts).
  http.post(`${API}/api/media`, ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const mockScenario = request.headers.get('x-mock-scenario');
    if (mockScenario === 'no-file' || mockScenario === 'empty-file') {
      return validationError([{ field: 'file', message: 'file is required' }]);
    }
    const mockFilename = request.headers.get('x-mock-filename') || 'photo.jpg';
    const mockMime = request.headers.get('x-mock-mimetype') || 'image/jpeg';
    const mockSize = Number(request.headers.get('x-mock-size') || 1024);
    // Return immediately without parsing body — avoids XHR/FormData hang in jsdom
    return HttpResponse.json(
      {
        _id: 'media_new_' + Date.now(),
        filename: mockFilename,
        url: `https://res.cloudinary.com/demo/image/upload/${mockFilename}`,
        mimeType: mockMime,
        size: mockSize,
      },
      { status: 201 }
    );
  }),

  http.post(`${API}/api/media/confirm`, async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const body = (await request.json()) as {
      key?: string;
      publicId?: string;
      url?: string;
      filename?: string;
      mimeType?: string;
      size?: number;
    };
    const details: Array<{ field: string; message: string }> = [];
    if (!body.key) details.push({ field: 'key', message: 'key is required' });
    if (!body.publicId) details.push({ field: 'publicId', message: 'publicId is required' });
    if (!body.url) details.push({ field: 'url', message: 'url is required' });
    if (!body.filename) details.push({ field: 'filename', message: 'filename is required' });
    if (!body.mimeType) details.push({ field: 'mimeType', message: 'mimeType is required' });
    if (!body.size) details.push({ field: 'size', message: 'size is required' });
    if (details.length) return validationError(details);
    if (body.key !== body.publicId) {
      return validationError([{ field: 'key', message: 'key must equal publicId' }]);
    }
    return HttpResponse.json(
      {
        _id: 'media_new_' + Date.now(),
        filename: body.filename,
        url: body.url,
        mimeType: body.mimeType,
        size: body.size,
        storageKey: body.key,
      },
      { status: 201 }
    );
  }),

  http.delete(`${API}/api/media/:id`, ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const exists = mockMediaAssets.find((m) => m._id === params.id);
    if (!exists) return HttpResponse.json({ error: 'Not Found', message: 'Media not found', code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json({ message: 'Media deleted' }, { status: 200 });
  }),

  // ---------------------------------------------------------------------------
  // Clinic Info — /api/clinic-info (singleton)
  // ---------------------------------------------------------------------------
  http.get(`${API}/api/clinic-info`, ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    return HttpResponse.json(mockClinicInfo, { status: 200 });
  }),

  http.put(`${API}/api/clinic-info`, async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const body = (await request.json()) as Record<string, unknown>;
    // Accept any partial; merge and return
    const updated = { ...mockClinicInfo, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(updated, { status: 200 });
  }),

  // PATCH variant for clinic-info if ever used (task says PATCH if any)
  http.patch(`${API}/api/clinic-info`, async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const body = (await request.json()) as Record<string, unknown>;
    const updated = { ...mockClinicInfo, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(updated, { status: 200 });
  }),

  // ---------------------------------------------------------------------------
  // Gallery — /api/gallery
  // ---------------------------------------------------------------------------
  http.get(`${API}/api/gallery`, ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);
    return HttpResponse.json(paginated(mockGalleryItems, page, limit), { status: 200 });
  }),

  http.get(`${API}/api/gallery/:id`, ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const item = mockGalleryItems.find((g) => g._id === params.id);
    if (!item) return HttpResponse.json({ error: 'Not Found', message: 'Gallery item not found', code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json(item, { status: 200 });
  }),

  http.post(`${API}/api/gallery`, async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const body = (await request.json()) as { beforeImg?: string; afterImg?: string };
    const details: Array<{ field: string; message: string }> = [];
    if (!body.beforeImg) details.push({ field: 'beforeImg', message: 'beforeImg is required' });
    if (!body.afterImg) details.push({ field: 'afterImg', message: 'afterImg is required' });
    if (details.length) return validationError(details);
    return HttpResponse.json({ _id: 'gal_new_' + Date.now(), ...body, status: 'draft', createdAt: new Date().toISOString() }, { status: 201 });
  }),

  http.put(`${API}/api/gallery/:id`, async ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const exists = mockGalleryItems.find((g) => g._id === params.id);
    if (!exists) return HttpResponse.json({ error: 'Not Found', message: 'Gallery item not found', code: 'NOT_FOUND' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...exists, ...body, updatedAt: new Date().toISOString() }, { status: 200 });
  }),

  http.delete(`${API}/api/gallery/:id`, ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const exists = mockGalleryItems.find((g) => g._id === params.id);
    if (!exists) return HttpResponse.json({ error: 'Not Found', message: 'Gallery item not found', code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json({ message: 'Gallery item deleted' }, { status: 200 });
  }),

  // ---------------------------------------------------------------------------
  // Booking Provider — singleton
  // ---------------------------------------------------------------------------
  http.get(`${API}/api/booking-provider`, ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    return HttpResponse.json(mockBookingProvider, { status: 200 });
  }),

  http.put(`${API}/api/booking-provider`, async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...mockBookingProvider, ...body, updatedAt: new Date().toISOString() }, { status: 200 });
  }),

  // PATCH for booking-provider partial update
  http.patch(`${API}/api/booking-provider`, async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...mockBookingProvider, ...body, updatedAt: new Date().toISOString() }, { status: 200 });
  }),

  http.get(`${API}/api/practo-clicks`, ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    return HttpResponse.json({ totalClicks: 42, dailyStats: [{ _id: '2026-01-01', count: 5 }] }, { status: 200 });
  }),

  // ---------------------------------------------------------------------------
  // Extra: Analytics, Leads, etc — minimal handlers for completeness
  // ---------------------------------------------------------------------------
  http.get(`${API}/api/leads`, ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    return HttpResponse.json(paginated([], 1, 10), { status: 200 });
  }),
];
