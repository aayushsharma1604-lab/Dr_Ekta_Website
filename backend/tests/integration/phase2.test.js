/**
 * Phase 2 Integration Tests - Primary Content (draft/published)
 * Single-admin model (R3): status is set directly via create/update, no review workflow
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { app, startServer } = require('../../src/app');
const { User, Treatment, Article } = require('../../src/models');
const { createTestUser, authHeaders, loginAndGetTokens, createTestMediaAsset } = require('../setup/fixtures');
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

describe('Phase 2 - Primary Content (draft/published)', () => {
  let testUser;
  let accessToken;
  let refreshToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    const loginRes = await loginAndGetTokens(app, testUser.email, 'TestPass123!');
    accessToken = loginRes.accessToken;
    refreshToken = loginRes.refreshToken;
  });

  // Test 2.1: Draft becomes published via direct status update
  test('2.1 - Treatment moves from draft to published via direct status update', async () => {
    // Create a treatment (defaults to draft)
    const treatmentData = {
      title: 'Test Treatment',
      slug: 'test-treatment',
      sections: { what: 'What is it?', who: 'Who needs it?' },
      faqs: [{ question: 'Q1?', answer: 'A1' }]
    };

    const createRes = await request(app)
      .post('/api/admin/treatments')
      .set(authHeaders(accessToken))
      .send(treatmentData)
      .expect(201);

    const treatmentId = createRes.body._id;
    expect(createRes.body.status).toBe('draft');

    // Not publicly visible while draft
    await request(app)
      .get(`/api/public/treatments/${treatmentData.slug}`)
      .expect(404);

    // Publish via direct status update
    const updateRes = await request(app)
      .put(`/api/admin/treatments/${treatmentId}`)
      .set(authHeaders(accessToken))
      .send({ ...treatmentData, status: 'published' })
      .expect(200);

    expect(updateRes.body.status).toBe('published');
    expect(updateRes.body.publishedAt).toBeTruthy();

    // Now publicly visible
    await request(app)
      .get(`/api/public/treatments/${treatmentData.slug}`)
      .expect(200);
  });

  // Test 2.2: Invalid status values are rejected
  test('2.2 - Setting a non draft/published status fails', async () => {
    const treatmentData = {
      title: 'Test Treatment 2',
      slug: `test-treatment-2-${Date.now()}`,
      sections: { what: 'What is it?' }
    };

    const createRes = await request(app)
      .post('/api/admin/treatments')
      .set(authHeaders(accessToken))
      .send(treatmentData)
      .expect(201);

    const treatmentId = createRes.body._id;

    // Old workflow statuses no longer exist
    await request(app)
      .put(`/api/admin/treatments/${treatmentId}`)
      .set(authHeaders(accessToken))
      .send({ ...treatmentData, status: 'approved' })
      .expect(422);

    // Verify status is still draft
    const treatment = await Treatment.findById(treatmentId);
    expect(treatment.status).toBe('draft');
  });

  // Test 2.3: GET /public/treatments/:slug for a treatment still in draft
  test('2.3 - GET /public/treatments/:slug for draft treatment returns 404', async () => {
    const treatmentData = {
      title: 'Draft Treatment',
      slug: 'draft-treatment',
      sections: { what: 'What is it?' }
    };

    const createRes = await request(app)
      .post('/api/admin/treatments')
      .set(authHeaders(accessToken))
      .send(treatmentData)
      .expect(201);

    const treatmentId = createRes.body._id;

    // Try to access via public API - should 404
    await request(app)
      .get(`/api/public/treatments/${treatmentData.slug}`)
      .expect(404);
  });

  // Test 2.4: GET /public/treatments/:slug for a published treatment
  test('2.4 - GET /public/treatments/:slug for published treatment returns 200', async () => {
    const treatmentData = {
      title: 'Published Treatment',
      slug: 'published-treatment',
      status: 'published',
      sections: { what: 'What is it?', who: 'Who needs it?' },
      faqs: [{ question: 'Q1?', answer: 'A1' }]
    };

    await request(app)
      .post('/api/admin/treatments')
      .set(authHeaders(accessToken))
      .send(treatmentData)
      .expect(201);

    // Access via public API - should 200
    const res = await request(app)
      .get(`/api/public/treatments/${treatmentData.slug}`)
      .expect(200);

    expect(res.body.title).toBe('Published Treatment');
    expect(res.body.sections.what).toBe('What is it?');
    expect(res.body.faqs).toHaveLength(1);
    // Internal fields are excluded from public payloads (F8)
    expect(res.body.createdBy).toBeUndefined();
  });

  // Test 2.5: POST a treatment with a duplicate slug
  test('2.5 - POST treatment with duplicate slug fails', async () => {
    const treatmentData = {
      title: 'Treatment 1',
      slug: `unique-treatment-${Date.now()}`,
      sections: { what: 'What is it?' }
    };

    // Create first treatment
    await request(app)
      .post('/api/admin/treatments')
      .set(authHeaders(accessToken))
      .send(treatmentData)
      .expect(201);

    // Try to create second with same slug
    const treatmentData2 = {
      title: 'Treatment 2',
      slug: treatmentData.slug,
      sections: { what: 'What is it?' }
    };

    const res = await request(app)
      .post('/api/admin/treatments')
      .set(authHeaders(accessToken))
      .send(treatmentData2)
      .expect(422);

    expect(res.body.error).toMatch(/duplicate|already exists/i);
  });

  // Test 2.6: GET /public/articles?q=root+canal
  test('2.6 - GET /public/articles?q=root+canal returns published articles', async () => {
    // Create articles directly as published
    const article1 = {
      title: 'Root Canal Treatment Guide',
      slug: 'root-canal-guide',
      category: 'restorative',
      body: 'Root canal treatment is a procedure...',
      author: 'Dr. Ekta',
      tags: ['root-canal', 'endodontics'],
      status: 'published'
    };

    const article2 = {
      title: 'Crown After Root Canal',
      slug: 'crown-after-root-canal',
      category: 'restorative',
      body: 'After a root canal, a crown is often needed...',
      author: 'Dr. Ekta',
      tags: ['crown', 'restorative'],
      status: 'published'
    };

    for (const art of [article1, article2]) {
      await request(app)
        .post('/api/admin/articles')
        .set(authHeaders(accessToken))
        .send(art)
        .expect(201);
    }

    // Search
    const res = await request(app)
      .get('/api/public/articles?q=root+canal')
      .expect(200);

    expect(res.body.items.length).toBeGreaterThanOrEqual(2);
    // Should only return published articles
    expect(res.body.items.every(a => a.status === 'published')).toBe(true);
  });

  // Test 2.7: Published article keeps its credentialsDisplay byline
  test('2.7 - Published article returns its credentialsDisplay byline', async () => {
    const articleData = {
      title: 'Test Article',
      slug: 'test-article',
      category: 'restorative',
      body: 'Test body content',
      author: 'Dr. Ekta',
      reviewer: testUser._id,
      credentialsDisplay: 'BDS, MDS (Orthodontics)',
      status: 'published'
    };

    await request(app)
      .post('/api/admin/articles')
      .set(authHeaders(accessToken))
      .send(articleData)
      .expect(201);

    // Fetch published article - check credentialsDisplay
    const publishedRes = await request(app)
      .get(`/api/public/articles/${articleData.slug}`)
      .expect(200);

    expect(publishedRes.body.credentialsDisplay).toBe('BDS, MDS (Orthodontics)');
  });

  // Test 2.8: Admin list filters by draft/published status
  test('2.8 - GET /api/admin/treatments filters by draft/published status', async () => {
    // Create one draft and one published treatment
    await request(app)
      .post('/api/admin/treatments')
      .set(authHeaders(accessToken))
      .send({ title: 'Draft T', slug: 'draft-t', sections: { what: 'x' } })
      .expect(201);

    await request(app)
      .post('/api/admin/treatments')
      .set(authHeaders(accessToken))
      .send({ title: 'Live T', slug: 'live-t', sections: { what: 'x' }, status: 'published' })
      .expect(201);

    const pubRes = await request(app)
      .get('/api/admin/treatments')
      .query({ status: 'published' })
      .set(authHeaders(accessToken))
      .expect(200);

    expect(pubRes.body.items.length).toBe(1);
    expect(pubRes.body.items[0].slug).toBe('live-t');

    const draftRes = await request(app)
      .get('/api/admin/treatments')
      .query({ status: 'draft' })
      .set(authHeaders(accessToken))
      .expect(200);

    expect(draftRes.body.items.length).toBe(1);
    expect(draftRes.body.items[0].slug).toBe('draft-t');
  });
});
