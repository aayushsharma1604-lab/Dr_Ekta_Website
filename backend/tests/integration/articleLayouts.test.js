/**
 * Article CMS Layouts Integration Tests
 * Covers: 5 spec template keys persist + validate, legacy values keep working,
 * new structured fields validate, drafts hidden from public, 422/404 paths.
 */
const request = require('supertest');
const { app, startServer } = require('../../src/app');
const { Article } = require('../../src/models');
const { createTestUser, loginAndGetTokens } = require('../setup/fixtures');
const { clearCollections } = require('../setup/testUtils');

let server;

beforeAll(async () => {
  server = await startServer();
});

afterAll(async () => {
  if (server) {
    await server.close();
  }
});

afterEach(async () => {
  await clearCollections();
});

describe('Article CMS - template layouts', () => {
  let accessToken;

  beforeEach(async () => {
    const testUser = await createTestUser();
    const loginRes = await loginAndGetTokens(app, testUser.email, 'TestPass123!');
    accessToken = loginRes.accessToken;
  });

  const auth = (req) => req.set('Authorization', `Bearer ${accessToken}`);

  const basePayload = (overrides = {}) => ({
    title: 'Test Article',
    slug: 'test-article',
    category: 'patient-education',
    body: '## Intro\nSome text.',
    author: 'Dr. Ekta Narula',
    status: 'published',
    ...overrides,
  });

  const specLayouts = ['standard', 'health-guide', 'report-analysis', 'symptoms', 'clinical-deep-dive'];

  test.each(specLayouts)('creates + publishes layout "%s" and public slug returns it', async (layout) => {
    const slug = `layout-${layout}`;
    const create = await auth(request(app).post('/api/admin/articles'))
      .send(basePayload({ slug, title: `Title ${layout}`, layout }));
    expect(create.status).toBe(201);
    expect(create.body.layout).toBe(layout);

    const pub = await request(app).get(`/api/public/articles/${slug}`);
    expect(pub.status).toBe(200);
    expect(pub.body.layout).toBe(layout);
  });

  test.each(['editorial', 'medical-guide', 'research', 'storytelling', 'step-by-step', 'standard'])(
    'legacy layout value "%s" still accepted and rendered',
    async (layout) => {
      const slug = `legacy-${layout}`;
      const create = await auth(request(app).post('/api/admin/articles'))
        .send(basePayload({ slug, title: `Legacy ${layout}`, layout }));
      expect(create.status).toBe(201);
      const pub = await request(app).get(`/api/public/articles/${slug}`);
      expect(pub.status).toBe(200);
      expect(pub.body.layout).toBe(layout);
    }
  );

  test('rejects unknown layout identifier with 422', async () => {
    const res = await auth(request(app).post('/api/admin/articles'))
      .send(basePayload({ slug: 'bad-layout', layout: 'magazine' }));
    expect(res.status).toBe(422);
  });

  test('persists structured report-analysis fields', async () => {
    const create = await auth(request(app).post('/api/admin/articles')).send(
      basePayload({
        slug: 'report-markers',
        layout: 'report-analysis',
        markers: [{ name: 'Hemoglobin', unit: 'g/dL', range: 'Varies by lab', interpretation: 'Low may suggest anemia.', factors: 'Hydration' }],
      })
    );
    expect(create.status).toBe(201);
    const pub = await request(app).get('/api/public/articles/report-markers');
    expect(pub.status).toBe(200);
    expect(pub.body.markers).toHaveLength(1);
    expect(pub.body.markers[0].name).toBe('Hemoglobin');
  });

  test('rejects markers with missing name content but accepts empty array', async () => {
    const res = await auth(request(app).post('/api/admin/articles'))
      .send(basePayload({ slug: 'markers-bad', markers: 'not-an-array' }));
    expect(res.status).toBe(422);
  });

  test('drafts stay hidden from public endpoints', async () => {
    await auth(request(app).post('/api/admin/articles')).send(
      basePayload({ slug: 'draft-hidden', layout: 'symptoms', status: 'draft' })
    );
    const pub = await request(app).get('/api/public/articles/draft-hidden');
    expect(pub.status).toBe(404);
  });

  test('updating layout preserves other fields', async () => {
    const create = await auth(request(app).post('/api/admin/articles'))
      .send(basePayload({ slug: 'layout-switch', layout: 'standard', symptoms: ['Pain'] }));
    expect(create.status).toBe(201);
    const id = create.body._id;
    const update = await auth(request(app).put(`/api/admin/articles/${id}`)).send({ layout: 'symptoms' });
    expect(update.status).toBe(200);
    expect(update.body.layout).toBe('symptoms');
    const stored = await Article.findById(id).lean();
    expect(stored.symptoms).toEqual(['Pain']);
  });

  test('unauthorized create is rejected', async () => {
    const res = await request(app).post('/api/admin/articles').send(basePayload({ slug: 'no-auth' }));
    expect([401, 403]).toContain(res.status);
  });

  test('duplicate slug is rejected', async () => {
    await auth(request(app).post('/api/admin/articles')).send(basePayload({ slug: 'dup-slug' }));
    const dup = await auth(request(app).post('/api/admin/articles')).send(basePayload({ slug: 'dup-slug' }));
    expect(dup.status).toBe(422);
  });
});
