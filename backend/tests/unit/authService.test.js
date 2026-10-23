/**
 * Phase 1 Unit Tests - Auth Service (no 2FA: removed by owner decision)
 * Calls service functions directly with the same DB bootstrap as integration tests
 */
const authService = require('../../src/services/authService');
const { app, startServer } = require('../../src/app');
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

describe('Phase 1 - Auth Service Unit Tests', () => {
  let User, RefreshToken;
  let createTestUser;

  beforeAll(() => {
    // Lazy-load models and fixtures after database is connected
    ({ User, RefreshToken } = require('../../src/models'));
    ({ createTestUser } = require('../setup/fixtures'));
  });

  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  test('verifyAccessToken returns null for invalid token', () => {
    const result = authService.verifyAccessToken('invalid.token.here');
    expect(result).toBeNull();
  });

  test('verifyAccessToken returns payload for valid token', () => {
    const token = authService.generateTokens(testUser).accessToken;
    const result = authService.verifyAccessToken(token);
    expect(result).toBeTruthy();
    expect(result.sub).toBe(testUser._id.toString());
  });

  test('verifyRefreshToken returns null for invalid token', () => {
    const result = authService.verifyRefreshToken('invalid.token.here');
    expect(result).toBeNull();
  });

  test('hashToken produces consistent hash', () => {
    const token = 'test_token_123';
    const hash1 = authService.hashToken(token);
    const hash2 = authService.hashToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA256 hex
  });

  test('login increments attempts on wrong password', async () => {
    await expect(authService.login(testUser.email, 'WrongPassword', '127.0.0.1', 'test'))
      .rejects.toThrow('Invalid credentials');

    const user = await User.findById(testUser._id).select('+loginAttempts +lockUntil');
    expect(user.loginAttempts).toBe(1);
  });

  test('login locks account after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await expect(authService.login(testUser.email, 'WrongPassword', '127.0.0.1', 'test'))
        .rejects.toThrow('Invalid credentials');
    }

    const user = await User.findById(testUser._id).select('+loginAttempts +lockUntil');
    expect(user.loginAttempts).toBe(5);
    expect(user.isLocked).toBe(true);
  });

  test('login succeeds with correct password', async () => {
    const result = await authService.login(testUser.email, 'TestPass123!', '127.0.0.1', 'test');

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe(testUser.email);
  });

  test('refreshAccessToken rotates refresh token', async () => {
    const loginResult = await authService.login(testUser.email, 'TestPass123!', '127.0.0.1', 'test');
    const oldRefreshToken = loginResult.refreshToken;

    const newTokens = await authService.refreshAccessToken(oldRefreshToken, '127.0.0.1', 'test');

    expect(newTokens).toHaveProperty('accessToken');
    expect(newTokens).toHaveProperty('refreshToken');
    expect(newTokens.refreshToken).not.toBe(oldRefreshToken);

    // Old token should be revoked
    const storedToken = await RefreshToken.findOne({
      tokenHash: authService.hashToken(oldRefreshToken)
    });
    expect(storedToken.revoked).toBe(true);
  });

  test('refreshAccessToken rejects revoked token', async () => {
    const loginResult = await authService.login(testUser.email, 'TestPass123!', '127.0.0.1', 'test');
    await authService.logout(loginResult.refreshToken);

    await expect(authService.refreshAccessToken(loginResult.refreshToken, '127.0.0.1', 'test'))
      .rejects.toThrow('Refresh token revoked or expired');
  });
});
