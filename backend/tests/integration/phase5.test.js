/**
 * Phase 5 Integration Tests - Discovery & Homepage
 * Tests for Video (YouTube), CuratedPost (Instagram), Homepage aggregate
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { app, startServer } = require('../../src/app');
const { User, Video, CuratedPost, Treatment, Article, Testimonial, MediaAsset } = require('../../src/models');
const { createTestUser, authHeaders, loginAndGetTokens } = require('../setup/fixtures');
const { clearCollections } = require('../setup/testUtils');
const { resetRateLimiterStore } = require('../../src/middlewares/rateLimit.middleware');

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

describe('Phase 5 - Discovery & Homepage', () => {
  let testUser;
  let accessToken;
  let refreshToken;
  let testTreatment;
  let testArticle;
  let testTestimonial;
  let testMediaAsset;

  beforeEach(async () => {
    resetRateLimiterStore();
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

    // Create a test article
    testArticle = await require('../../src/models').Article.create({
      title: 'Test Article',
      slug: `test-article-${Date.now()}`,
      category: 'preventive-care',
      body: 'Article body content',
      author: 'Dr. Ekta',
      credentialsDisplay: 'BDS, MDS',
      status: 'published',
      createdBy: testUser._id
    });

    // Create a test testimonial
    testMediaAsset = await MediaAsset.create({
      filename: 'test.jpg',
      originalName: 'test.jpg',
      storageKey: 'test/test.jpg',
      url: 'https://example.com/test.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      uploadedBy: testUser._id
    });

    testTestimonial = await require('../../src/models').Testimonial.create({
      patientDisplayName: 'Patient 1',
      content: 'Great experience!',
      treatmentTag: testTreatment._id,
      status: 'published'
    });
  });

  // Test 5.1: GET /public/videos?category=implants
  test('5.1 - GET /public/videos?category=implants returns only published videos in that category', async () => {
    await Video.create([
      {
        url: 'https://youtube.com/watch?v=1',
        title: 'Implant Video 1',
        category: 'implants',
        status: 'published',
        order: 1
      },
      {
        url: 'https://youtube.com/watch?v=2',
        title: 'Implant Video 2',
        category: 'implants',
        status: 'published',
        order: 2
      },
      {
        url: 'https://youtube.com/watch?v=3',
        title: 'Cosmetic Video',
        category: 'cosmetic',
        status: 'published',
        order: 3
      },
      {
        url: 'https://youtube.com/watch?v=4',
        title: 'Hidden Video',
        category: 'implants',
        status: 'hidden',
        order: 4
      }
    ]);

    const res = await request(app)
      .get('/api/public/videos')
      .query({ category: 'implants' })
      .expect(200);

    expect(res.body.items.length).toBe(2);
    expect(res.body.items.every(v => v.category === 'implants')).toBe(true);
    expect(res.body.items.every(v => v.status === 'published')).toBe(true);
  });

  // Test 5.2: Video with transcript + captionsUrl
  test('5.2 - Create a Video with transcript + captionsUrl, fetch it back', async () => {
    const captionsAsset = await MediaAsset.create({
      filename: 'captions.vtt',
      originalName: 'captions.vtt',
      storageKey: 'captions/test.vtt',
      url: 'https://example.com/captions/test.vtt',
      mimeType: 'text/vtt',
      size: 512,
      uploadedBy: testUser._id
    });

    const createRes = await request(app)
      .post('/api/admin/videos')
      .set(authHeaders(accessToken))
      .send({
        url: 'https://youtube.com/watch?v=test123',
        title: 'Test Video with Captions',
        category: 'implants',
        transcript: 'This is the transcript content',
        captionsUrl: captionsAsset._id.toString(),
        status: 'published'
      })
      .expect(201);

    expect(createRes.body.transcript).toBe('This is the transcript content');
    expect(createRes.body.captionsUrl._id.toString()).toBe(captionsAsset._id.toString());

    // Fetch back
    const getRes = await request(app)
      .get(`/api/admin/videos/${createRes.body._id}`)
      .set(authHeaders(accessToken))
      .expect(200);

    expect(getRes.body.transcript).toBe('This is the transcript content');
    expect(getRes.body.captionsUrl._id.toString()).toBe(captionsAsset._id.toString());
  });

  // Test 5.3: Instagram posts reorder
  test('5.3 - GET /public/instagram-posts, reorder via admin PUT, GET again', async () => {
    await CuratedPost.create([
      {
        image: testMediaAsset._id,
        caption: 'Post 1',
        permalink: 'https://instagram.com/p/1',
        order: 1
      },
      {
        image: testMediaAsset._id,
        caption: 'Post 2',
        permalink: 'https://instagram.com/p/2',
        order: 2
      }
    ]);

    // Get initial order
    const getRes1 = await request(app)
      .get('/api/public/instagram-posts')
      .expect(200);

    expect(getRes1.body.items[0].caption).toBe('Post 1');
    expect(getRes1.body.items[1].caption).toBe('Post 2');

    // Reorder: swap order
    await request(app)
      .put('/api/admin/instagram-posts/' + getRes1.body.items[0]._id)
      .set(authHeaders(accessToken))
      .send({ order: 2 })
      .expect(200);

    await request(app)
      .put('/api/admin/instagram-posts/' + getRes1.body.items[1]._id)
      .set(authHeaders(accessToken))
      .send({ order: 1 })
      .expect(200);

    // Get new order
    const getRes2 = await request(app)
      .get('/api/public/instagram-posts')
      .expect(200);

    expect(getRes2.body.items[0].caption).toBe('Post 2');
    expect(getRes2.body.items[1].caption).toBe('Post 1');
  });

  // Test 5.4: Homepage aggregate
  test('5.4 - GET /public/home with seeded content returns all four types', async () => {
    // Create a video
    await Video.create({
      url: 'https://youtube.com/watch?v=home1',
      title: 'Homepage Video',
      category: 'implants',
      status: 'published',
      order: 1
    });

    // Create an instagram post
    await CuratedPost.create({
      image: testMediaAsset._id,
      caption: 'Homepage Instagram',
      permalink: 'https://instagram.com/p/home',
      order: 1
    });

    const res = await request(app)
      .get('/api/public/home')
      .expect(200);

    expect(res.body).toHaveProperty('treatments');
    expect(res.body).toHaveProperty('articles');
    expect(res.body).toHaveProperty('videos');
    expect(res.body).toHaveProperty('testimonials');
    
    expect(res.body.treatments.length).toBeGreaterThan(0);
    expect(res.body.articles.length).toBeGreaterThan(0);
    expect(res.body.videos.length).toBeGreaterThan(0);
    expect(res.body.testimonials.length).toBeGreaterThan(0);
  });

  // Test 5.5: Homepage cache invalidation
  test('5.5 - Publish new Treatment, GET /public/home again reflects it', async () => {
    // Get initial homepage
    const res1 = await request(app)
      .get('/api/public/home')
      .expect(200);
    
    const initialTreatmentCount = res1.body.treatments.length;

    // Create and publish new treatment
    const newTreatment = await Treatment.create({
      title: 'New Treatment for Homepage',
      slug: `new-treatment-homepage-${Date.now()}`,
      status: 'published',
      sections: { what: 'New treatment' },
      createdBy: testUser._id
    });

    // Get homepage again
    const res2 = await request(app)
      .get('/api/public/home')
      .expect(200);

    expect(res2.body.treatments.length).toBe(initialTreatmentCount + 1);
    expect(res2.body.treatments.some(t => t._id.toString() === newTreatment._id.toString())).toBe(true);
  });

  // Test 5.6: Homepage with zero content
  test('5.6 - GET /public/home with zero content seeded', async () => {
    // Clear all content
    await Treatment.deleteMany({});
    await Article.deleteMany({});
    await Video.deleteMany({});
    await Testimonial.deleteMany({});
    await CuratedPost.deleteMany({});

    const res = await request(app)
      .get('/api/public/home')
      .expect(200);

    expect(res.body).toHaveProperty('treatments');
    expect(res.body).toHaveProperty('articles');
    expect(res.body).toHaveProperty('videos');
    expect(res.body).toHaveProperty('testimonials');
    expect(Array.isArray(res.body.treatments)).toBe(true);
    expect(Array.isArray(res.body.articles)).toBe(true);
    expect(Array.isArray(res.body.videos)).toBe(true);
    expect(Array.isArray(res.body.testimonials)).toBe(true);
  });
});