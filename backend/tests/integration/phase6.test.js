/**
 * Phase 6 Integration Tests - SEO & Analytics
 * Covers spec IDs 6.1-6.5 (sitemap, redirects, robots, monthly report, index use)
 */
const request = require('supertest');
const { app, startServer } = require('../../src/app');
const { Treatment, Article, RedirectMap, AnalyticsEvent, Lead } = require('../../src/models');
const { createTestUser, authHeaders, loginAndGetTokens } = require('../setup/fixtures');
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

describe('Phase 6 - SEO & Analytics', () => {
  let testUser;
  let accessToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    const loginRes = await loginAndGetTokens(app, testUser.email, 'TestPass123!');
    accessToken = loginRes.accessToken;
  });

  // Test 6.1: Sitemap lists published slugs only
  test('6.1 - GET /sitemap.xml lists published treatments, not drafts', async () => {
    await Treatment.create([
      { title: 'Live T1', slug: 'live-t1', status: 'published', sections: {}, createdBy: testUser._id },
      { title: 'Live T2', slug: 'live-t2', status: 'published', sections: {}, createdBy: testUser._id },
      { title: 'Draft T', slug: 'draft-t', status: 'draft', sections: {}, createdBy: testUser._id }
    ]);

    const res = await request(app)
      .get('/api/public/sitemap.xml')
      .expect(200);

    expect(res.header['content-type']).toMatch(/xml/);
    expect(res.text).toContain('/treatments/live-t1');
    expect(res.text).toContain('/treatments/live-t2');
    expect(res.text).not.toContain('draft-t');
  });

  // Test 6.2: Redirect map resolves with configured status code
  test('6.2 - POST /admin/redirects then request old path redirects', async () => {
    await request(app)
      .post('/api/admin/redirects')
      .set(authHeaders(accessToken))
      .send({ fromPath: '/old-page', toPath: '/treatments/live-t1', statusCode: 301 })
      .expect(201);

    const res = await request(app)
      .get('/api/public/redirect/old-page')
      .expect(301);

    expect(res.header.location).toBe('/treatments/live-t1');
  });

  // Test 6.3: robots.txt references the sitemap
  test('6.3 - GET /robots.txt references the sitemap URL', async () => {
    const res = await request(app)
      .get('/api/public/robots.txt')
      .expect(200);

    expect(res.header['content-type']).toMatch(/plain/);
    expect(res.text).toMatch(/Sitemap:.*sitemap\.xml/);
  });

  // Test 6.4: Enquiry is reflected in the monthly report
  test('6.4 - Submit an enquiry, then GET /admin/reports/monthly reflects it', async () => {
    await request(app)
      .post('/api/public/enquiry')
      .send({ name: 'Report User', phone: '+91-9876543210' })
      .expect(201);

    const res = await request(app)
      .get('/api/admin/analytics/reports/monthly')
      .set(authHeaders(accessToken))
      .expect(200);

    expect(res.body.byEventType.enquiry_submit).toBeGreaterThanOrEqual(1);
  });

  // Test 6.5: Slug lookup uses the index (IXSCAN, not COLLSCAN)
  test('6.5 - Treatment slug query uses IXSCAN', async () => {
    const plan = await Treatment.find({ slug: 'anything', status: 'published' })
      .explain('executionStats');

    expect(JSON.stringify(plan)).toContain('IXSCAN');
    expect(JSON.stringify(plan.queryPlanner.winningPlan)).not.toContain('COLLSCAN');
  });
});
