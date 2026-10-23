/**
 * Announcement Integration Tests - Clinic notices
 * Covers CRUD, draft/published visibility, validation, sanitization, ordering
 */
const request = require('supertest');
const { app, startServer } = require('../../src/app');
const { Announcement } = require('../../src/models');
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

describe('Announcements - Clinic notices', () => {
  let testUser;
  let accessToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    const loginRes = await loginAndGetTokens(app, testUser.email, 'TestPass123!');
    accessToken = loginRes.accessToken;
  });

  // Test 8.1: Draft announcements are hidden from public, visible to admin
  test('8.1 - Draft announcement is admin-visible but not public', async () => {
    const createRes = await request(app)
      .post('/api/admin/announcements')
      .set(authHeaders(accessToken))
      .send({ title: 'Diwali Closure', body: 'Closed on Nov 1.' })
      .expect(201);

    expect(createRes.body.status).toBe('draft');

    const publicRes = await request(app)
      .get('/api/public/announcements')
      .expect(200);
    expect(publicRes.body.items.length).toBe(0);

    const adminRes = await request(app)
      .get('/api/admin/announcements')
      .set(authHeaders(accessToken))
      .expect(200);
    expect(adminRes.body.items.length).toBe(1);
  });

  // Test 8.2: Publishing makes the announcement public with a timestamp
  test('8.2 - Publish via direct status update goes public with publishedAt', async () => {
    const createRes = await request(app)
      .post('/api/admin/announcements')
      .set(authHeaders(accessToken))
      .send({ title: 'New Dentist', body: 'Welcome aboard.' })
      .expect(201);

    const updateRes = await request(app)
      .put(`/api/admin/announcements/${createRes.body._id}`)
      .set(authHeaders(accessToken))
      .send({ status: 'published' })
      .expect(200);

    expect(updateRes.body.status).toBe('published');
    expect(updateRes.body.publishedAt).toBeTruthy();

    const publicRes = await request(app)
      .get('/api/public/announcements')
      .expect(200);
    expect(publicRes.body.items.some(a => a._id.toString() === createRes.body._id.toString())).toBe(true);
  });

  // Test 8.3: Validation rejects bad payloads
  test('8.3 - Missing title, bad status, and bad linkUrl are rejected', async () => {
    await request(app)
      .post('/api/admin/announcements')
      .set(authHeaders(accessToken))
      .send({ body: 'No title here.' })
      .expect(422);

    await request(app)
      .post('/api/admin/announcements')
      .set(authHeaders(accessToken))
      .send({ title: 'T', body: 'B', status: 'approved' })
      .expect(422);

    await request(app)
      .post('/api/admin/announcements')
      .set(authHeaders(accessToken))
      .send({ title: 'T', body: 'B', linkUrl: 'not-a-url' })
      .expect(422);
  });

  // Test 8.4: Script tags are stripped from the body
  test('8.4 - Announcement body script tags are stripped, safe markup survives', async () => {
    const createRes = await request(app)
      .post('/api/admin/announcements')
      .set(authHeaders(accessToken))
      .send({
        title: 'XSS Notice',
        body: '<script>alert(1)</script><p>Holiday hours</p>',
        status: 'published'
      })
      .expect(201);

    expect(createRes.body.body).not.toContain('<script');

    const publicRes = await request(app)
      .get('/api/public/announcements')
      .expect(200);
    expect(publicRes.body.items[0].body).not.toContain('<script');
    expect(publicRes.body.items[0].body).toContain('Holiday hours');
  });

  // Test 8.5: Public list respects the order field
  test('8.5 - Public announcements come back in order', async () => {
    await Announcement.create([
      { title: 'Second', body: 'B', status: 'published', order: 2 },
      { title: 'First', body: 'B', status: 'published', order: 1 }
    ]);

    const res = await request(app)
      .get('/api/public/announcements')
      .expect(200);

    expect(res.body.items.length).toBe(2);
    expect(res.body.items[0].title).toBe('First');
    expect(res.body.items[1].title).toBe('Second');
  });

  // Test 8.6: Unknown ids 404; delete removes the document
  test('8.6 - Unknown announcement id 404s; delete removes it', async () => {
    const mongoose = require('mongoose');
    const fakeId = new mongoose.Types.ObjectId().toString();

    await request(app)
      .get(`/api/admin/announcements/${fakeId}`)
      .set(authHeaders(accessToken))
      .expect(404);

    const createRes = await request(app)
      .post('/api/admin/announcements')
      .set(authHeaders(accessToken))
      .send({ title: 'Temp', body: 'Delete me.' })
      .expect(201);

    await request(app)
      .delete(`/api/admin/announcements/${createRes.body._id}`)
      .set(authHeaders(accessToken))
      .expect(200);

    expect(await Announcement.findById(createRes.body._id)).toBeNull();
  });
});
