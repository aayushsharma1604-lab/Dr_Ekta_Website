/**
 * Team Integration Tests - "Our Team" doctors
 * Covers CRUD, draft/published visibility, category filter, validation, ordering
 */
const request = require('supertest');
const { app, startServer } = require('../../src/app');
const { TeamMember } = require('../../src/models');
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

describe('Team - Our Team doctors', () => {
  let accessToken;

  beforeEach(async () => {
    const testUser = await createTestUser();
    const loginRes = await loginAndGetTokens(app, testUser.email, 'TestPass123!');
    accessToken = loginRes.accessToken;
  });

  const memberPayload = (overrides = {}) => ({
    name: 'Dr. Jane Doe',
    slug: 'dr-jane-doe',
    role: 'Orthodontist',
    category: 'orthodontics',
    bio: 'Straightens smiles.',
    experienceYears: 10,
    ...overrides
  });

  test('T1 - Draft member is admin-visible but not public', async () => {
    const createRes = await request(app)
      .post('/api/admin/team')
      .set(authHeaders(accessToken))
      .send(memberPayload())
      .expect(201);

    expect(createRes.body.status).toBe('draft');

    const publicRes = await request(app)
      .get('/api/public/team')
      .expect(200);
    expect(publicRes.body.items.length).toBe(0);

    const adminRes = await request(app)
      .get('/api/admin/team')
      .set(authHeaders(accessToken))
      .expect(200);
    expect(adminRes.body.items.length).toBe(1);
  });

  test('T2 - Publish goes public with publishedAt; fetchable by slug', async () => {
    const createRes = await request(app)
      .post('/api/admin/team')
      .set(authHeaders(accessToken))
      .send(memberPayload({ status: 'published' }))
      .expect(201);

    expect(createRes.body.publishedAt).toBeTruthy();

    const publicRes = await request(app)
      .get('/api/public/team')
      .expect(200);
    expect(publicRes.body.items.length).toBe(1);

    const bySlug = await request(app)
      .get('/api/public/team/dr-jane-doe')
      .expect(200);
    expect(bySlug.body.name).toBe('Dr. Jane Doe');
  });

  test('T3 - Public list filters by category and respects order', async () => {
    await TeamMember.create([
      memberPayload({ name: 'Second', slug: 'second', category: 'endodontics', status: 'published', order: 2 }),
      memberPayload({ name: 'First', slug: 'first', category: 'endodontics', status: 'published', order: 1 }),
      memberPayload({ name: 'Other', slug: 'other', category: 'orthodontics', status: 'published', order: 0 })
    ]);

    const filtered = await request(app)
      .get('/api/public/team?category=endodontics')
      .expect(200);
    expect(filtered.body.items.length).toBe(2);
    expect(filtered.body.items[0].slug).toBe('first');
    expect(filtered.body.items[1].slug).toBe('second');
  });

  test('T4 - Missing name/role and bad category are rejected', async () => {
    await request(app)
      .post('/api/admin/team')
      .set(authHeaders(accessToken))
      .send({ role: 'Orthodontist', category: 'orthodontics' })
      .expect(422);

    await request(app)
      .post('/api/admin/team')
      .set(authHeaders(accessToken))
      .send(memberPayload({ category: 'cardiology' }))
      .expect(422);
  });

  test('T5 - Unknown id/slug 404s; delete removes the document', async () => {
    const mongoose = require('mongoose');
    const fakeId = new mongoose.Types.ObjectId().toString();

    await request(app)
      .get(`/api/admin/team/${fakeId}`)
      .set(authHeaders(accessToken))
      .expect(404);

    await request(app)
      .get('/api/public/team/no-such-doctor')
      .expect(404);

    const createRes = await request(app)
      .post('/api/admin/team')
      .set(authHeaders(accessToken))
      .send(memberPayload())
      .expect(201);

    await request(app)
      .delete(`/api/admin/team/${createRes.body._id}`)
      .set(authHeaders(accessToken))
      .expect(200);

    expect(await TeamMember.findById(createRes.body._id)).toBeNull();
  });
});
