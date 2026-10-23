/**
 * Phase 4 Integration Tests - Trust & Proof Content
 * Single-admin draft/published model (R1+R3): no consent fields, no review workflow
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { app, startServer } = require('../../src/app');
const { User, Profile, Testimonial, GalleryItem, Treatment, MediaAsset } = require('../../src/models');
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

describe('Phase 4 - Trust & Proof Content', () => {
  let testUser;
  let accessToken;
  let refreshToken;
  let testTreatment;
  let testMediaAsset;

  beforeEach(async () => {
    testUser = await createTestUser();
    const loginRes = await loginAndGetTokens(app, testUser.email, 'TestPass123!');
    accessToken = loginRes.accessToken;
    refreshToken = loginRes.refreshToken;

    // Create a test treatment
    testTreatment = await Treatment.create({
      title: 'Test Treatment',
      slug: `test-treatment-${Date.now()}`,
      status: 'published',
      sections: { what: 'Test' },
      createdBy: testUser._id
    });

    // Create a test media asset
    testMediaAsset = await MediaAsset.create({
      filename: 'test.jpg',
      originalName: 'test.jpg',
      storageKey: 'test/test.jpg',
      url: 'https://example.com/test.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      uploadedBy: testUser._id
    });
  });

  // Test 4.1: Profile CRUD
  test('4.1 - PUT /admin/profile with new credentials, then GET /public/profile', async () => {
    // Update profile
    const updateRes = await request(app)
      .put('/api/admin/profile')
      .set(authHeaders(accessToken))
      .send({
        bio: 'Dr. Ekta Narula is a renowned dentist...',
        qualifications: [{ degree: 'BDS', institution: 'AIIMS', year: 2010 }]
      })
      .expect(200);

    expect(updateRes.body.bio).toBe('Dr. Ekta Narula is a renowned dentist...');
    expect(updateRes.body.qualifications).toHaveLength(1);

    // Get public profile
    const publicRes = await request(app)
      .get('/api/public/profile')
      .expect(200);

    expect(publicRes.body.bio).toBe('Dr. Ekta Narula is a renowned dentist...');
    expect(publicRes.body.qualifications).toHaveLength(1);
  });

  // Test 4.2: Testimonial creates without any consent fields (R1)
  test('4.2 - Create a Testimonial with no consent fields succeeds', async () => {
    const res = await request(app)
      .post('/api/admin/testimonials')
      .set(authHeaders(accessToken))
      .send({
        patientDisplayName: 'Patient A',
        content: 'Great experience!',
        treatmentTag: testTreatment._id.toString()
      })
      .expect(201);

    expect(res.body.status).toBe('draft');
    expect(res.body.consent).toBeUndefined();
  });

  // Test 4.3: Testimonial publishes via direct status update (R3)
  test('4.3 - Publish a Testimonial via direct status update', async () => {
    const createRes = await request(app)
      .post('/api/admin/testimonials')
      .set(authHeaders(accessToken))
      .send({
        patientDisplayName: 'Patient B',
        content: 'Great experience!',
        treatmentTag: testTreatment._id.toString()
      })
      .expect(201);

    const updateRes = await request(app)
      .put(`/api/admin/testimonials/${createRes.body._id}`)
      .set(authHeaders(accessToken))
      .send({
        patientDisplayName: 'Patient B',
        content: 'Great experience!',
        status: 'published'
      })
      .expect(200);

    expect(updateRes.body.status).toBe('published');
    expect(updateRes.body.publishedAt).toBeTruthy();

    // Visible publicly
    const publicRes = await request(app)
      .get('/api/public/testimonials')
      .expect(200);
    expect(publicRes.body.items.some(t => t._id.toString() === createRes.body._id.toString())).toBe(true);
  });

  // Test 4.4: Gallery item creates without any consent fields (R1)
  test('4.4 - Create a GalleryItem with no consent fields succeeds', async () => {
    const res = await request(app)
      .post('/api/admin/gallery')
      .set(authHeaders(accessToken))
      .send({
        beforeImg: testMediaAsset._id.toString(),
        afterImg: testMediaAsset._id.toString(),
        treatmentTag: testTreatment._id.toString()
      })
      .expect(201);

    expect(res.body.status).toBe('draft');
    expect(res.body.consent).toBeUndefined();
  });

  // Test 4.5: Gallery item publishes via direct status update (R3)
  test('4.5 - Publish a GalleryItem via direct status update', async () => {
    const createRes = await request(app)
      .post('/api/admin/gallery')
      .set(authHeaders(accessToken))
      .send({
        beforeImg: testMediaAsset._id.toString(),
        afterImg: testMediaAsset._id.toString(),
        treatmentTag: testTreatment._id.toString()
      })
      .expect(201);

    const updateRes = await request(app)
      .put(`/api/admin/gallery/${createRes.body._id}`)
      .set(authHeaders(accessToken))
      .send({ status: 'published' })
      .expect(200);

    expect(updateRes.body.status).toBe('published');

    // Visible publicly
    const publicRes = await request(app)
      .get('/api/public/gallery')
      .expect(200);
    expect(publicRes.body.items.length).toBe(1);
  });

  // Test 4.6: Public testimonials filter by treatment
  test('4.6 - GET /public/testimonials?treatment=root-canal', async () => {
    await Testimonial.create([
      {
        patientDisplayName: 'Patient 1',
        content: 'Great root canal!',
        treatmentTag: testTreatment._id,
        status: 'published'
      },
      {
        patientDisplayName: 'Patient 2',
        content: 'Great cleaning!',
        status: 'published'
      }
    ]);

    const res = await request(app)
      .get('/api/public/testimonials')
      .query({ treatmentTag: testTreatment._id.toString() })
      .expect(200);

    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].treatmentTag._id.toString()).toBe(testTreatment._id.toString());
  });

  // Test 4.7: Draft gallery item not returned publicly
  test('4.7 - GET /public/gallery for item still in draft', async () => {
    await GalleryItem.create({
      beforeImg: testMediaAsset._id,
      afterImg: testMediaAsset._id,
      treatmentTag: testTreatment._id,
      status: 'draft'
    });

    const res = await request(app)
      .get('/api/public/gallery')
      .expect(200);

    expect(res.body.items.length).toBe(0);
  });
});
