/**
 * Phase 1 Integration Tests - Auth & ClinicInfo + Media Pipeline
 * Tests the 10 test cases from the specification
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { app, startServer } = require('../../src/app');
const { User, RefreshToken, ClinicInfo, MediaAsset } = require('../../src/models');
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

describe('Phase 1 - Foundation: Auth & ClinicInfo + Media Pipeline', () => {
  let testUser;
  let accessToken;
  let refreshToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    const loginRes = await loginAndGetTokens(app, testUser.email, 'TestPass123!');
    accessToken = loginRes.accessToken;
    refreshToken = loginRes.refreshToken;
  });

  // Test 1.1: POST /auth/login with correct credentials, no 2FA enabled
  test('1.1 - Login with correct credentials returns 200 with access + refresh tokens', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: testUser.email, password: 'TestPass123!' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
  });

  // Test 1.2: POST /auth/login with wrong password (R2: audit log removed - assert lockout counter instead)
  test('1.2 - Login with wrong password returns 401 and increments lockout counter', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword' })
      .expect(401);

    expect(res.body.error).toBe('Invalid credentials');

    // Failed attempt is tracked in the DB (lockout counter persists without audit log)
    const user = await User.findById(testUser._id).select('+loginAttempts +lockUntil');
    expect(user.loginAttempts).toBe(1);
  });

  // Test 1.3: 5 consecutive failed logins triggers lockout
  test('1.3 - 5 consecutive failed logins triggers account lockout', async () => {
    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/admin/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword' })
        .expect(401);
    }

    // 6th attempt should be locked (returns 429 for rate limiting)
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword' })
      .expect(429);

    expect(res.body.error).toMatch(/locked/i);

    // Verify user is locked in database
    const lockedUser = await User.findById(testUser._id).select('+lockUntil');
    expect(lockedUser.isLocked).toBe(true);
  });

  // Test 1.4: Call any /api/admin/* route with no token
  test('1.4 - Accessing admin route without token returns 401', async () => {
    const res = await request(app)
      .get('/api/admin/clinic-info')
      .expect(401);

    expect(res.body.error).toBe('Authentication required');
  });

  // Test 1.5: Expired access token + refresh flow
  test('1.5 - Expired access token rejected, refresh returns new valid token', async () => {
    // Create an expired access token
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { sub: testUser._id.toString(), email: testUser.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '-1s' } // Already expired
    );

    // Try to use expired token
    await request(app)
      .get('/api/admin/clinic-info')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    // Refresh should work
    const refreshRes = await request(app)
      .post('/api/admin/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(refreshRes.body).toHaveProperty('accessToken');
    expect(refreshRes.body).toHaveProperty('refreshToken');

    // New access token should work
    const newAccessToken = refreshRes.body.accessToken;
    await request(app)
      .get('/api/admin/clinic-info')
      .set('Authorization', `Bearer ${newAccessToken}`)
      .expect(200);
  });

  // Test 1.6: Revoked refresh token rejected
  test('1.6 - Revoked refresh token cannot be used', async () => {
    // Revoke the refresh token
    await request(app)
      .post('/api/admin/auth/logout')
      .send({ refreshToken })
      .expect(200);

    // Try to use revoked token
    const res = await request(app)
      .post('/api/admin/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    expect(res.body.error).toMatch(/revoked|expired|invalid/i);
  });

  // Test 1.7: PUT /admin/clinic-info with valid session (R2: audit log removed)
  test('1.7 - PUT clinic-info updates document', async () => {
    const updateData = {
      practiceName: 'Updated Practice Name',
      address: {
        street: '123 New Street',
        city: 'New City',
        state: 'New State',
        pincode: '110001'
      },
      phones: ['+91-9876543210'],
      email: 'updated@example.com'
    };

    const res = await request(app)
      .put('/api/admin/clinic-info')
      .set(authHeaders(accessToken))
      .send(updateData)
      .expect(200);

    expect(res.body.practiceName).toBe('Updated Practice Name');
    expect(res.body.address.city).toBe('New City');

    // Verify persisted value reads back via admin GET
    const reRead = await request(app)
      .get('/api/admin/clinic-info')
      .set(authHeaders(accessToken))
      .expect(200);
    expect(reRead.body.practiceName).toBe('Updated Practice Name');
  });

  // Test 1.8: Public clinic info reflects updates immediately (cache invalidation)
  test('1.8 - Public clinic info reflects updates immediately after admin update', async () => {
    // Get initial public clinic info
    const initialRes = await request(app)
      .get('/api/public/clinic-info')
      .expect(200);
    
    const initialName = initialRes.body.practiceName;

    // Update via admin
    await request(app)
      .put('/api/admin/clinic-info')
      .set(authHeaders(accessToken))
      .send({ practiceName: 'Cache Test Practice' })
      .expect(200);

    // Get public clinic info again - should reflect new value
    const updatedRes = await request(app)
      .get('/api/public/clinic-info')
      .expect(200);

    expect(updatedRes.body.practiceName).toBe('Cache Test Practice');
    expect(updatedRes.body.practiceName).not.toBe(initialName);
  });

  // Test 1.9: POST /admin/media/upload rejects oversized/disallowed file types
  test('1.9 - Media upload rejects oversized or disallowed file types', async () => {
    // Test disallowed file type
    const res1 = await request(app)
      .post('/api/admin/media/upload')
      .set(authHeaders(accessToken))
      .send({
        filename: 'test.exe',
        mimeType: 'application/x-executable',
        size: 1024
      })
      .expect(422);

    expect(res1.body.error).toMatch(/file type not allowed/i);

    // Test oversized file (6MB JPEG, limit is 5MB)
    const res2 = await request(app)
      .post('/api/admin/media/upload')
      .set(authHeaders(accessToken))
      .send({
        filename: 'large.jpg',
        mimeType: 'image/jpeg',
        size: 6 * 1024 * 1024
      })
      .expect(422);

    expect(res2.body.error).toMatch(/file size exceeds/i);
  });

  // Test 1.10: Delete MediaAsset with usedIn references
  test('1.10 - Deleting MediaAsset with usedIn references is blocked', async () => {
    // Create a media asset
    const asset = await createTestMediaAsset(testUser._id);

    // Mark it referenced (usedIn entries are written directly by content writes)
    await MediaAsset.updateOne(
      { _id: asset._id },
      { $addToSet: { usedIn: { collection: 'Treatment', documentId: new mongoose.Types.ObjectId(), field: 'heroImage' } } }
    );

    // Try to delete - should be blocked
    const res = await request(app)
      .delete(`/api/admin/media/${asset._id}`)
      .set(authHeaders(accessToken))
      .expect(409);

    expect(res.body.error).toMatch(/referenced by other content/i);
    expect(res.body.inUse).toBe(true);

    // Verify asset still exists
    const stillExists = await MediaAsset.findById(asset._id);
    expect(stillExists).toBeTruthy();
  });

  // Test 1.11: Signed upload params include image-optimization transforms (pipeline)
  test('1.11 - Media upload params include eager transforms + variant URLs for images', async () => {
    const res = await request(app)
      .post('/api/admin/media/upload')
      .set(authHeaders(accessToken))
      .send({ filename: 'smile.jpg', mimeType: 'image/jpeg', size: 1024 })
      .expect(200);

    // Eager responsive transforms are part of the signed params as a
    // Cloudinary pipe-delimited string (NOT a JSON array — Cloudinary
    // rejects array format with "Invalid transformation component")
    expect(typeof res.body.paramsToSign.eager).toBe('string');
    const widths = [...res.body.paramsToSign.eager.matchAll(/w_(\d+)/g)].map((m) => Number(m[1])).sort((a, b) => a - b);
    expect(widths).toEqual([400, 800, 1600]);

    // Deterministic optimized delivery URLs are returned
    expect(res.body.optimizedUrl).toMatch(/f_auto,q_auto/);
    expect(res.body.variants).toHaveLength(3);
    expect(res.body.variants.map(v => v.width).sort((a, b) => a - b)).toEqual([400, 800, 1600]);

    // Non-images get no eager transforms and no variants
    const pdfRes = await request(app)
      .post('/api/admin/media/upload')
      .set(authHeaders(accessToken))
      .send({ filename: 'form.pdf', mimeType: 'application/pdf', size: 1024 })
      .expect(200);

    expect(pdfRes.body.paramsToSign.eager).toBeUndefined();
    expect(pdfRes.body.variants).toHaveLength(0);
  });

  // Test 1.12: Confirm stores server-derived optimized variants (pipeline)
  test('1.12 - Media confirm persists optimizedUrl + variants', async () => {
    const signRes = await request(app)
      .post('/api/admin/media/upload')
      .set(authHeaders(accessToken))
      .send({ filename: 'smile.jpg', mimeType: 'image/jpeg', size: 2048 })
      .expect(200);

    const confirmRes = await request(app)
      .post('/api/admin/media/confirm')
      .set(authHeaders(accessToken))
      .send({
        key: signRes.body.publicId,
        publicId: signRes.body.publicId,
        url: signRes.body.publicUrl,
        filename: 'smile.jpg',
        mimeType: 'image/jpeg',
        size: 2048
      })
      .expect(201);

    expect(confirmRes.body.optimizedUrl).toMatch(/f_auto,q_auto/);
    expect(confirmRes.body.variants).toHaveLength(3);

    const stored = await MediaAsset.findById(confirmRes.body._id);
    expect(stored.optimizedUrl).toBe(confirmRes.body.optimizedUrl);
    expect(stored.variants).toHaveLength(3);
  });
});