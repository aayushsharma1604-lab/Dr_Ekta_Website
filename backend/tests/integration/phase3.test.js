/**
 * Phase 3 Integration Tests - Lead Funnel
 * Tests for Lead DB, Enquiry forms, and Practo integration
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { app, startServer } = require('../../src/app');
const { User, Lead, Treatment, BookingProviderConfig } = require('../../src/models');
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

describe('Phase 3 - Lead Funnel', () => {
  let testUser;
  let accessToken;
  let refreshToken;
  let testTreatment;

  beforeEach(async () => {
    testUser = await createTestUser();
    const loginRes = await loginAndGetTokens(app, testUser.email, 'TestPass123!');
    accessToken = loginRes.accessToken;
    refreshToken = loginRes.refreshToken;

    // Create a test treatment
    testTreatment = await require('../../src/models').Treatment.create({
      title: 'Test Treatment',
      slug: `test-treatment-${Date.now()}`,
      status: 'published',
      sections: { what: 'Test' },
      createdBy: testUser._id
    });
  });

  // Test 3.1: POST /public/enquiry with valid data
  test('3.1 - POST /public/enquiry creates lead with source=enquiry_form', async () => {
    const res = await request(app)
      .post('/api/public/enquiry')
      .send({
        name: 'John Doe',
        phone: '+91-9876543210',
        treatmentInterest: testTreatment._id.toString()
      })
      .expect(201);

    expect(res.body).toHaveProperty('leadId');
    expect(res.body.message).toBe('Enquiry submitted successfully');

    const lead = await Lead.findById(res.body.leadId);
    expect(lead).toBeTruthy();
    expect(lead.name).toBe('John Doe');
    expect(lead.phone).toBe('+91-9876543210');
    expect(lead.treatmentInterest.toString()).toBe(testTreatment._id.toString());
    expect(lead.source).toBe('enquiry_form');
    expect(lead.leadStatus).toBe('new');
    expect(lead.appointmentStatus).toBe('none');
  });

  // Test 3.2: POST /public/enquiry with honeypot filled
  test('3.2 - POST /public/enquiry with honeypot filled is silently rejected', async () => {
    const res = await request(app)
      .post('/api/public/enquiry')
      .send({
        name: 'Bot',
        phone: '+91-9876543210',
        honeypot: 'filled-by-bot'
      })
      .expect(200);

    // Should appear successful to bot
    expect(res.body.message).toBe('Enquiry submitted successfully');

    // But no lead should be created
    const leads = await Lead.find({ phone: '+91-9876543210' });
    expect(leads.length).toBe(0);
  });

  // Test 3.3: POST /public/enquiry with invalid captcha
  test('3.3 - POST /public/enquiry with invalid captcha returns 422', async () => {
    const res = await request(app)
      .post('/api/public/enquiry')
      .send({
        name: 'John Doe',
        phone: '+91-9876543210',
        captchaToken: 'invalid-token'
      })
      .expect(422);

    expect(res.body.error).toBe('Validation failed');
  });

  // Test 3.4: POST /public/enquiry rate limiting
  test('3.4 - POST /public/enquiry rate limited after 20 requests/minute', async () => {
    const validData = {
      name: 'Rate Limit Test',
      phone: '+91-9876543210'
    };

    // Make 20 requests (should succeed) - enable rate limiting for this test
    for (let i = 0; i < 20; i++) {
      await request(app)
        .post('/api/public/enquiry')
        .set('x-enable-rate-limit', 'true')
        .send(validData)
        .expect(201);
    }

    // 21st request should be rate limited
    const res = await request(app)
      .post('/api/public/enquiry')
      .set('x-enable-rate-limit', 'true')
      .send(validData)
      .expect(429);

    expect(res.body.error).toMatch(/too many requests/i);
  });

  // Test 3.5: POST /public/enquiry rejects medical fields
  test('3.5 - POST /public/enquiry rejects medical/symptom fields', async () => {
    const res = await request(app)
      .post('/api/public/enquiry')
      .send({
        name: 'John Doe',
        phone: '+91-9876543210',
        symptoms: 'tooth pain' // Not allowed field
      })
      .expect(422);

    expect(res.body.error).toBe('Validation failed');
  });

  // Test 3.6: Admin leads CRUD
  test('3.6 - Admin leads CRUD operations', async () => {
    // Create lead directly
    const lead = await Lead.create({
      name: 'Test Lead',
      phone: '+91-9876543210',
      source: 'enquiry_form',
      leadStatus: 'new'
    });

    // Get leads
    const getRes = await request(app)
      .get('/api/admin/leads')
      .set(authHeaders(accessToken))
      .expect(200);

    expect(getRes.body.items.length).toBe(1);
    expect(getRes.body.items[0].name).toBe('Test Lead');

    // Update lead
    const updateRes = await request(app)
      .put(`/api/admin/leads/${lead._id}`)
      .set(authHeaders(accessToken))
      .send({ leadStatus: 'contacted', notes: 'Called customer' })
      .expect(200);

    expect(updateRes.body.leadStatus).toBe('contacted');
    expect(updateRes.body.notes).toBe('Called customer');

    // Get single lead
    const getOneRes = await request(app)
      .get(`/api/admin/leads/${lead._id}`)
      .set(authHeaders(accessToken))
      .expect(200);

    expect(getOneRes.body.notes).toBe('Called customer');

    // Delete lead
    await request(app)
      .delete(`/api/admin/leads/${lead._id}`)
      .set(authHeaders(accessToken))
      .expect(200);

    const deleted = await Lead.findById(lead._id);
    expect(deleted).toBeNull();
  });

  // Test 3.7: Lead export
  test('3.7 - GET /admin/leads/export returns CSV', async () => {
    await Lead.create([
      { name: 'Lead 1', phone: '+91-1111111111', source: 'enquiry_form', leadStatus: 'new' },
      { name: 'Lead 2', phone: '+91-2222222222', source: 'practo_click', leadStatus: 'contacted' }
    ]);

    const res = await request(app)
      .get('/api/admin/leads/export')
      .set(authHeaders(accessToken))
      .expect(200);

    expect(res.header['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('Lead 1');
    expect(res.text).toContain('Lead 2');
  });

  // Test 3.13 (new): CSV export escapes formula-injection characters (F11)
  test('3.13 - GET /admin/leads/export escapes formula-injection characters', async () => {
    await Lead.create({
      name: '=HYPERLINK("https://evil.example","click")',
      phone: '+91-9999999999',
      source: 'enquiry_form',
      leadStatus: 'new',
      notes: '+cmd|calc'
    });

    const res = await request(app)
      .get('/api/admin/leads/export')
      .set(authHeaders(accessToken))
      .expect(200);

    expect(res.header['content-type']).toMatch(/text\/csv/);
    // Escaped with a leading single quote inside the quoted cell
    expect(res.text).toContain(`"'=HYPERLINK`);
    expect(res.text).toContain(`"'+cmd|calc"`);
    // Raw unescaped formula cells must not appear
    expect(res.text).not.toContain('"=HYPERLINK');
  });

  // Test 3.8: Lead stats
  test('3.8 - GET /admin/leads/stats returns statistics', async () => {
    await Lead.create([
      { name: 'L1', phone: '+91-111', source: 'enquiry_form', leadStatus: 'new' },
      { name: 'L2', phone: '+91-222', source: 'practo_click', leadStatus: 'contacted' },
      { name: 'L3', phone: '+91-333', source: 'enquiry_form', leadStatus: 'scheduled' }
    ]);

    const res = await request(app)
      .get('/api/admin/leads/stats')
      .set(authHeaders(accessToken))
      .expect(200);

    expect(res.body.byStatus).toHaveProperty('new');
    expect(res.body.byStatus).toHaveProperty('contacted');
    expect(res.body.byStatus).toHaveProperty('scheduled');
    expect(res.body.bySource).toHaveProperty('enquiry_form');
    expect(res.body.bySource).toHaveProperty('practo_click');
  });

  // Test 3.9: Practo booking CTA
  test('3.9 - GET /public/booking-cta returns active provider', async () => {
    await BookingProviderConfig.create({
      providerName: 'practo',
      profileUrl: 'https://practo.com/dr-ekta',
      bookingUrl: 'https://practo.com/book/dr-ekta',
      isActive: true
    });

    const res = await request(app)
      .get('/api/public/booking-cta')
      .expect(200);

    expect(res.body.provider).toBe('practo');
    expect(res.body.profileUrl).toBe('https://practo.com/dr-ekta');
    expect(res.body.bookingUrl).toBe('https://practo.com/book/dr-ekta');
  });

  // Test 3.10: Practo click logging
  test('3.10 - POST /public/leads/practo-click logs click', async () => {
    const res = await request(app)
      .post('/api/public/leads/practo-click')
      .expect(200);

    expect(res.body.message).toBe('Click logged');

    const leads = await Lead.find({ source: 'practo_click' });
    expect(leads.length).toBe(1);
    expect(leads[0].source).toBe('practo_click');
  });

  // Test 3.11: Admin booking provider config
  test('3.11 - Admin booking provider CRUD', async () => {
    // Get initial (should be 404)
    await request(app)
      .get('/api/admin/booking-provider')
      .set(authHeaders(accessToken))
      .expect(404);

    // Create config
    const createRes = await request(app)
      .put('/api/admin/booking-provider')
      .set(authHeaders(accessToken))
      .send({
        providerName: 'practo',
        profileUrl: 'https://practo.com/dr-ekta',
        bookingUrl: 'https://practo.com/book/dr-ekta',
        isActive: true
      })
      .expect(200);

    expect(createRes.body.profileUrl).toBe('https://practo.com/dr-ekta');

    // Update config
    const updateRes = await request(app)
      .put('/api/admin/booking-provider')
      .set(authHeaders(accessToken))
      .send({ bookingUrl: 'https://new-url.com/book' })
      .expect(200);

    expect(updateRes.body.bookingUrl).toBe('https://new-url.com/book');

    // Public endpoint should reflect change
    const publicRes = await request(app)
      .get('/api/public/booking-cta')
      .expect(200);

    expect(publicRes.body.bookingUrl).toBe('https://new-url.com/book');
  });

  // Test 3.12: Admin Practo clicks analytics
  test('3.12 - GET /admin/practo-clicks returns analytics', async () => {
    // Create some practo click leads
    await Lead.create([
      { name: 'Click 1', phone: 'unknown', source: 'practo_click', date: new Date('2024-01-15') },
      { name: 'Click 2', phone: 'unknown', source: 'practo_click', date: new Date('2024-01-15') },
      { name: 'Click 3', phone: 'unknown', source: 'practo_click', date: new Date('2024-01-16') }
    ]);

    const res = await request(app)
      .get('/api/admin/practo-clicks')
      .set(authHeaders(accessToken))
      .expect(200);

    expect(res.body.totalClicks).toBe(3);
    expect(res.body.dailyStats.length).toBeGreaterThan(0);
    const day15 = res.body.dailyStats.find(d => d._id === '2024-01-15');
    expect(day15.count).toBe(2);
  });
});