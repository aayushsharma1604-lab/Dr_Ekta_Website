/**
 * Phase 7 Integration Tests - Hardening & Launch Readiness
 * Automated subset: 7.1 (NoSQL injection), 7.2 (XSS), 7.6 (locationId audit).
 * 7.3 (backup restore) and 7.5 (load test) are manual - see docs/HANDOVER.md.
 * 7.4 (legal pages) dropped by owner decision: served statically by the frontend.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { app, startServer } = require('../../src/app');
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

describe('Phase 7 - Hardening', () => {
  let testUser;
  let accessToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    const loginRes = await loginAndGetTokens(app, testUser.email, 'TestPass123!');
    accessToken = loginRes.accessToken;
  });

  // Test 7.1: NoSQL operator injection is neutralised before the query layer
  test('7.1 - NoSQL injection payload in query does not break or bypass filters', async () => {
    // Operator object in a filterable query param must not throw or match everything blindly
    await request(app)
      .get('/api/admin/leads?search[$gt]=')
      .set(authHeaders(accessToken))
      .expect(200);

    // Object-typed credentials must fail validation, not reach the query layer
    await request(app)
      .post('/api/admin/auth/login')
      .send({ email: { $gt: '' }, password: 'x' })
      .expect(422);
  });

  // Test 7.2: Rich-text script tags are stripped on save, never stored raw
  test('7.2 - Article body script tags are stripped, safe markup survives', async () => {
    const createRes = await request(app)
      .post('/api/admin/articles')
      .set(authHeaders(accessToken))
      .send({
        title: 'XSS Article',
        slug: 'xss-article',
        category: 'patient-education',
        body: '<script>alert(1)</script><p>Safe paragraph</p>',
        author: 'Dr. Ekta',
        status: 'published'
      })
      .expect(201);

    expect(createRes.body.body).not.toContain('<script');

    const publicRes = await request(app)
      .get('/api/public/articles/xss-article')
      .expect(200);

    expect(publicRes.body.body).not.toContain('<script');
    expect(publicRes.body.body).toContain('Safe paragraph');
  });

  // Test 7.6: locationId present on every clinic-bound collection
  test('7.6 - Every clinic-bound schema has a locationId field', async () => {
    const models = require('../../src/models');
    const clinicBound = [
      'Treatment', 'Article', 'Testimonial', 'GalleryItem',
      'Lead', 'Video', 'CuratedPost', 'ClinicInfo', 'Profile'
    ];

    for (const name of clinicBound) {
      expect(models[name].schema.path('locationId')).toBeTruthy();
    }
  });
});
