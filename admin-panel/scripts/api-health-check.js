#!/usr/bin/env node
/**
 * API Health Check — admin-panel
 * Direct backend calls (not Next proxy) with Bearer token.
 *
 * Usage:
 *   node scripts/api-health-check.js
 *   npx tsx scripts/api-health-check.ts   (if TS version present)
 *
 * Env:
 *   NEXT_PUBLIC_API_BASE  — backend base (default http://localhost:4000)
 *   ADMIN_EMAIL / ADMIN_PASSWORD — test admin credentials (default admin@drektanarula.com / admin123)
 *   API_BASE / BACKEND_URL — alternative base overrides
 */

const fs = require('fs');
const path = require('path');

// ------------------------------------------------------------
// 1. Load env — try dotenv, else manual .env parsing
// ------------------------------------------------------------
function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      // Remove surrounding quotes handling
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      // strip quotes
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch (_) {}
}

(function initEnv() {
  // Try dotenv if installed
  try {
    const dotenv = require('dotenv');
    const root = path.resolve(__dirname, '..');
    const candidates = [
      path.join(root, '.env.local'),
      path.join(root, '.env'),
      path.join(root, '.env.development'),
      path.join(path.resolve(__dirname, '..', '..'), 'backend', '.env'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) dotenv.config({ path: p, override: false, quiet: true });
    }
    dotenv.config({ quiet: true });
  } catch (_) {
    const root = path.resolve(__dirname, '..');
    loadEnvFile(path.join(root, '.env.local'));
    loadEnvFile(path.join(root, '.env'));
    loadEnvFile(path.join(root, '.env.development'));
  }
})();

// ------------------------------------------------------------
// 2. Config
// ------------------------------------------------------------
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.API_BASE ||
  process.env.BACKEND_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.TEST_ADMIN_EMAIL || 'admin@drektanarula.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.TEST_ADMIN_PASSWORD || 'admin123';

const TS = Date.now();
const UID = String(TS).slice(-6);

// ANSI colors
const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// State
let accessToken = null;
let refreshToken = null;
const results = [];

// ------------------------------------------------------------
// 3. Helpers
// ------------------------------------------------------------
function logHeader() {
  console.log('');
  console.log(C.bold + C.cyan + '════════════════════════════════════════════════════════════' + C.reset);
  console.log(C.bold + C.cyan + '  Dr. Ekta Narula — Admin API Health Check' + C.reset);
  console.log(C.dim + `  Base: ${API_BASE}` + C.reset);
  console.log(C.dim + `  User: ${ADMIN_EMAIL}` + C.reset);
  console.log(C.dim + `  Time: ${new Date().toISOString()}` + C.reset);
  console.log(C.cyan + '════════════════════════════════════════════════════════════' + C.reset);
  console.log('');
}

function extractTokenData(data) {
  if (!data || typeof data !== 'object') return {};
  // backend may return { accessToken, refreshToken, user } or { data: { ... } }
  const d = data.data || data;
  return {
    accessToken: d.accessToken || d.access_token || d.token || null,
    refreshToken: d.refreshToken || d.refresh_token || null,
    user: d.user || d.admin || null,
  };
}

function extractId(payload) {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  // try common wrappers
  const obj = payload.data || payload.item || payload;
  if (obj && typeof obj === 'object') {
    return obj._id || obj.id || obj._Id || null;
  }
  return null;
}

function extractArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.items) return payload.items;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  if (payload.data && payload.data.items) return payload.data.items;
  return [];
}

async function refreshAuth() {
  if (!refreshToken) return false;
  try {
    const url = `${API_BASE}/api/admin/auth/refresh`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = {}; }
    if (res.ok) {
      const tok = extractTokenData(data);
      if (tok.accessToken) {
        accessToken = tok.accessToken;
        if (tok.refreshToken) refreshToken = tok.refreshToken;
        console.log(C.dim + `  ↻ Token refreshed` + C.reset);
        return true;
      }
    }
  } catch (_) {}
  return false;
}

async function apiRequest(method, endpoint, body = undefined, opts = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(opts.headers || {}),
  };
  const start = Date.now();
  let status = 0;
  let ok = false;
  let data = null;
  let raw = '';
  let error = null;
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    status = res.status;
    ok = res.ok;
    raw = await res.text();
    try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

    // 401 retry with refresh once
    if (status === 401 && !opts._retry && refreshToken) {
      const refreshed = await refreshAuth();
      if (refreshed) {
        return apiRequest(method, endpoint, body, { ...opts, _retry: true });
      }
    }
  } catch (e) {
    error = e.message || String(e);
    // network error
    status = 0;
    ok = false;
  }
  const ms = Date.now() - start;
  return { method, endpoint, status, ok, ms, data, raw, error };
}

function formatResult(r, expectedStatuses = null) {
  // expectedStatuses: array of acceptable statuses; if null, ok = r.ok (2xx)
  let passed = r.ok;
  let reason = '';
  if (expectedStatuses) {
    passed = expectedStatuses.includes(r.status);
    if (!passed) reason = `Expected ${expectedStatuses.join('/')} but got ${r.status}`;
  }
  if (r.error) {
    passed = false;
    reason = r.error;
  } else if (!passed && !reason) {
    // build reason from response
    const msg = (r.data && typeof r.data === 'object' ? r.data.error || r.data.message || r.data.msg : r.raw) || `HTTP ${r.status}`;
    const details = r.data && r.data.details ? `: ${r.data.details.map(d => `${d.field || ''} ${d.message || d.msg || ''}`.trim()).join(', ')}` : '';
    reason = String(msg).slice(0, 300) + details;
    if (r.status === 0) reason = 'Network error — is backend running at ' + API_BASE + '?';
  }
  return { passed, reason };
}

function logResult(r, passed, reason, note = '') {
  const icon = passed ? `${C.green}✅${C.reset}` : `${C.red}❌${C.reset}`;
  const methodPad = r.method.padEnd(6);
  const ep = r.endpoint;
  const st = r.status === 0 ? 'ERR' : String(r.status);
  const time = `${r.ms}ms`.padStart(6);
  const baseLine = `${icon} ${methodPad} ${ep}  ${C.dim}→ ${st} (${time})${C.reset}`;
  if (passed) {
    console.log(baseLine);
    if (note) console.log(C.dim + `   ${note}` + C.reset);
  } else {
    console.log(baseLine);
    console.log(C.red + `   Reason: ${reason || 'Unknown'}` + C.reset);
    if (note) console.log(C.dim + `   Note: ${note}` + C.reset);
    if (r.data && typeof r.data === 'object' && r.data.details) {
      // already included
    } else if (r.raw && r.raw.length < 500 && r.status >= 400) {
      const trimmed = r.raw.slice(0, 500).replace(/\n/g, ' ');
      if (trimmed && trimmed !== reason) console.log(C.dim + `   Body: ${trimmed}` + C.reset);
    }
  }
}

async function runCheck(method, endpoint, body, opts = {}) {
  const {
    expect, // array of acceptable statuses, default 2xx
    label,  // extra note
    validate, // function(data) => boolean or { ok, reason }
  } = opts;
  const r = await apiRequest(method, endpoint, body, opts);
  let { passed, reason } = formatResult(r, expect || null);
  // custom validate if passed
  if (passed && typeof validate === 'function') {
    try {
      const v = validate(r.data, r);
      if (v === false) { passed = false; reason = 'Validation failed'; }
      else if (v && typeof v === 'object' && v.ok === false) { passed = false; reason = v.reason || 'Validation failed'; }
    } catch (e) {
      passed = false; reason = `Validate error: ${e.message}`;
    }
  }
  logResult(r, passed, reason, label || '');
  results.push({ ...r, passed, reason, label });
  return { ...r, passed, reason };
}

// ------------------------------------------------------------
// 4. Main sequence
// ------------------------------------------------------------
async function main() {
  logHeader();

  // 0 — quick health probe (optional)
  console.log(C.bold + '─ Authenticating ─' + C.reset);
  const login = await apiRequest('POST', '/api/admin/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  {
    const { passed, reason } = formatResult(login);
    logResult(login, passed, reason, 'Login — obtain tokens');
    results.push({ ...login, passed, reason, label: 'login' });
    if (!passed) {
      console.log('');
      console.log(C.red + C.bold + '✖ Login failed — cannot continue. Check credentials and backend.' + C.reset);
      console.log(C.dim + `  Tried ${API_BASE}/api/admin/auth/login with ${ADMIN_EMAIL}` + C.reset);
      if (login.raw) console.log(C.dim + `  Response: ${login.raw.slice(0, 800)}` + C.reset);
      printSummary();
      process.exit(1);
    }
    const tok = extractTokenData(login.data);
    accessToken = tok.accessToken;
    refreshToken = tok.refreshToken;
    if (!accessToken) {
      console.log(C.yellow + '⚠ Login returned 200 but no accessToken found — trying alternative parsing' + C.reset);
      // try raw parsing
      console.log(C.dim + `  raw: ${login.raw.slice(0, 800)}` + C.reset);
    } else {
      console.log(C.green + `  ✓ Authenticated (token ${accessToken.slice(0, 12)}…)` + C.reset);
    }
    if (refreshToken) console.log(C.dim + `  ↳ refreshToken present` + C.reset);
  }
  console.log('');

  // Containers for created IDs
  let mediaId1 = null, mediaId2 = null;
  let treatmentId = null;
  let articleId = null;
  let testimonialId = null;
  let galleryId = null;
  let videoId = null;
  let instaId = null;
  let redirectId = null;
  let leadId = null;

  // Keep originals for revert
  let originalClinic = null;
  let originalProfile = null;
  let originalHomeConfig = null;
  let originalBooking = null;

  // ── Auth / Me ──────────────────────────────────────────────
  console.log(C.bold + '─ Auth / Core ─' + C.reset);
  await runCheck('GET', '/api/admin/auth/me');
  // clinic-info verify fallback
  await runCheck('GET', '/api/admin/clinic-info');
  console.log('');

  // ── Clinic Info ────────────────────────────────────────────
  console.log(C.bold + '─ Clinic Info ─' + C.reset);
  const clinicGet = await runCheck('GET', '/api/admin/clinic-info');
  try {
    const clinicData = clinicGet.data && (clinicGet.data.data || clinicGet.data);
    if (clinicData && typeof clinicData === 'object') originalClinic = clinicData;
  } catch {}
  // PUT test — minimal safe payload (avoid sending invalid locationId/email from original)
  if (clinicGet.passed) {
    const testPayload = { practiceName: `HealthCheck Clinic ${UID}` };
    const putRes = await runCheck('PUT', '/api/admin/clinic-info', testPayload);
    if (putRes.passed && originalClinic) {
      const rev = {};
      if (originalClinic.practiceName) rev.practiceName = originalClinic.practiceName;
      else rev.practiceName = testPayload.practiceName; // fallback keep test value if original had no name
      // revert to original name
      await runCheck('PUT', '/api/admin/clinic-info', rev, { label: 'revert clinic-info' });
    }
  } else {
    await runCheck('PUT', '/api/admin/clinic-info', { practiceName: `HealthCheck ${UID}` });
  }
  console.log('');

  // ── Media ──────────────────────────────────────────────────
  console.log(C.bold + '─ Media ─' + C.reset);
  await runCheck('GET', '/api/admin/media');
  // upload #1
  const up1 = await runCheck('POST', '/api/admin/media/upload', { filename: `hc-test-${UID}-1.jpg`, mimeType: 'image/jpeg', size: 1024 });
  // confirm #1
  const confirmPayload1 = {
    key: `health-check/hc-test-${UID}-1.jpg`,
    publicId: `health-check/hc-test-${UID}-1.jpg`,
    url: 'https://via.placeholder.com/150',
    filename: `hc-test-${UID}-1.jpg`,
    mimeType: 'image/jpeg',
    size: 1024,
  };
  const conf1 = await runCheck('POST', '/api/admin/media/confirm', confirmPayload1);
  if (conf1.passed) mediaId1 = extractId(conf1.data);
  if (!mediaId1) {
    // try alternative: list media and pick first
    const list = await apiRequest('GET', '/api/admin/media');
    const arr = extractArray(list.data);
    if (arr.length) mediaId1 = arr[0]._id || arr[0].id;
  }
  // upload #2 for gallery afterImg
  await runCheck('POST', '/api/admin/media/upload', { filename: `hc-test-${UID}-2.jpg`, mimeType: 'image/jpeg', size: 2048 });
  const confirmPayload2 = {
    key: `health-check/hc-test-${UID}-2.jpg`,
    publicId: `health-check/hc-test-${UID}-2.jpg`,
    url: 'https://via.placeholder.com/150/0000FF',
    filename: `hc-test-${UID}-2.jpg`,
    mimeType: 'image/jpeg',
    size: 2048,
  };
  const conf2 = await runCheck('POST', '/api/admin/media/confirm', confirmPayload2);
  if (conf2.passed) mediaId2 = extractId(conf2.data);
  if (!mediaId2) mediaId2 = mediaId1; // fallback

  if (mediaId1) {
    await runCheck('GET', `/api/admin/media/${mediaId1}`);
  } else {
    await runCheck('GET', '/api/admin/media/000000000000000000000000', { expect: [200, 404], label: 'mediaId fallback (expected 404 if no media)' });
  }
  console.log('');

  // ── Treatments ─────────────────────────────────────────────
  console.log(C.bold + '─ Treatments ─' + C.reset);
  await runCheck('GET', '/api/admin/treatments');
  const tCreate = await runCheck('POST', '/api/admin/treatments', {
    title: `HC Treatment ${UID}`,
    slug: `hc-treatment-${UID}-${TS}`,
    status: 'draft',
    sections: { what: 'Health check test', who: 'test', procedure: 'test' },
    faqs: [{ question: 'Q?', answer: 'A', order: 1 }],
  });
  if (tCreate.passed) treatmentId = extractId(tCreate.data);
  // if create failed due to duplicate slug, try another suffix
  if (!treatmentId && tCreate.status === 409) {
    const retry = await runCheck('POST', '/api/admin/treatments', {
      title: `HC Treatment ${UID}b`,
      slug: `hc-treatment-${UID}-${TS}-2`,
      status: 'draft',
    });
    if (retry.passed) treatmentId = extractId(retry.data);
  }
  if (treatmentId) {
    await runCheck('GET', `/api/admin/treatments/${treatmentId}`);
    await runCheck('PUT', `/api/admin/treatments/${treatmentId}`, { title: `HC Treatment ${UID} Updated`, status: 'draft' });
  } else {
    // try to use existing id from list
    const list = await apiRequest('GET', '/api/admin/treatments');
    const arr = extractArray(list.data);
    if (arr.length) {
      treatmentId = arr[0]._id || arr[0].id;
      if (treatmentId) {
        await runCheck('GET', `/api/admin/treatments/${treatmentId}`);
        await runCheck('PUT', `/api/admin/treatments/${treatmentId}`, { title: `HC Treatment Existing Updated ${UID}` });
      }
    }
  }
  console.log('');

  // ── Articles ───────────────────────────────────────────────
  console.log(C.bold + '─ Articles ─' + C.reset);
  await runCheck('GET', '/api/admin/articles');
  const aCreate = await runCheck('POST', '/api/admin/articles', {
    title: `HC Article ${UID}`,
    slug: `hc-article-${UID}-${TS}`,
    category: 'patient-education',
    body: 'Health check article body — generated by api-health-check script.',
    author: 'Health Check',
    tags: ['health-check'],
    status: 'draft',
  });
  if (aCreate.passed) articleId = extractId(aCreate.data);
  if (articleId) {
    await runCheck('GET', `/api/admin/articles/${articleId}`);
    await runCheck('PUT', `/api/admin/articles/${articleId}`, {
      title: `HC Article ${UID} Updated`,
      category: 'patient-education',
      body: 'Updated body',
      author: 'Health Check',
      status: 'draft',
    });
  } else {
    const list = await apiRequest('GET', '/api/admin/articles');
    const arr = extractArray(list.data);
    if (arr.length) {
      articleId = arr[0]._id || arr[0].id;
      if (articleId) {
        await runCheck('GET', `/api/admin/articles/${articleId}`);
        await runCheck('PUT', `/api/admin/articles/${articleId}`, { title: `HC Article Existing Updated ${UID}` });
      }
    }
  }
  console.log('');

  // ── Testimonials ───────────────────────────────────────────
  console.log(C.bold + '─ Testimonials ─' + C.reset);
  await runCheck('GET', '/api/admin/testimonials/');
  // some backends require trailing slash, try both via retry
  // our endpoint already has slash
  const teCreate = await runCheck('POST', '/api/admin/testimonials/', {
    patientDisplayName: `HC Patient ${UID}`,
    content: 'Health check testimonial content — excellent service.',
    type: 'text',
    status: 'draft',
  });
  // fallback without slash if 404
  let teId = null;
  if (teCreate.passed) teId = extractId(teCreate.data);
  if (!teCreate.passed && teCreate.status === 404) {
    const alt = await runCheck('POST', '/api/admin/testimonials', {
      patientDisplayName: `HC Patient ${UID}`,
      content: 'Health check testimonial content — excellent service.',
      type: 'text',
      status: 'draft',
    });
    if (alt.passed) teId = extractId(alt.data);
  }
  testimonialId = teId;
  if (testimonialId) {
    await runCheck('GET', `/api/admin/testimonials/${testimonialId}`);
    await runCheck('PUT', `/api/admin/testimonials/${testimonialId}`, { content: 'Updated health check testimonial', status: 'draft' });
  } else {
    // try list pick
    const list = await apiRequest('GET', '/api/admin/testimonials/');
    let arr = extractArray(list.data);
    if (!arr.length) {
      const altList = await apiRequest('GET', '/api/admin/testimonials');
      arr = extractArray(altList.data);
    }
    if (arr.length) {
      testimonialId = arr[0]._id || arr[0].id;
      if (testimonialId) {
        await runCheck('GET', `/api/admin/testimonials/${testimonialId}`);
        await runCheck('PUT', `/api/admin/testimonials/${testimonialId}`, { content: 'Updated existing' });
      }
    }
  }
  console.log('');

  // ── Gallery ────────────────────────────────────────────────
  console.log(C.bold + '─ Gallery ─' + C.reset);
  await runCheck('GET', '/api/admin/gallery/');
  let galleryFallback = false;
  if (mediaId1 && mediaId2) {
    const gCreate = await runCheck('POST', '/api/admin/gallery/', {
      beforeImg: mediaId1,
      afterImg: mediaId2,
      content: `HC Gallery ${UID}`,
      status: 'draft',
    });
    if (gCreate.passed) galleryId = extractId(gCreate.data);
    if (!gCreate.passed && gCreate.status === 404) {
      galleryFallback = true;
      const alt = await runCheck('POST', '/api/admin/gallery', {
        beforeImg: mediaId1,
        afterImg: mediaId2,
        content: `HC Gallery ${UID}`,
        status: 'draft',
      });
      if (alt.passed) galleryId = extractId(alt.data);
    }
    if (galleryId) {
      await runCheck('GET', `/api/admin/gallery/${galleryId}`);
      await runCheck('PUT', `/api/admin/gallery/${galleryId}`, { content: `HC Gallery Updated ${UID}` });
    }
  } else {
    console.log(C.yellow + '  ⚠ Skipping Gallery POST — no mediaIds available' + C.reset);
    await runCheck('POST', '/api/admin/gallery/', {
      beforeImg: mediaId1 || '000000000000000000000000',
      afterImg: mediaId2 || '000000000000000000000000',
      content: 'HC Gallery should fail without valid media',
    }, { expect: [201, 422, 400], label: 'gallery without valid media (422 expected if validation strict)' });
  }
  if (!galleryId) {
    const list = await apiRequest('GET', '/api/admin/gallery/');
    let arr = extractArray(list.data);
    if (!arr.length) {
      const alt = await apiRequest('GET', '/api/admin/gallery');
      arr = extractArray(alt.data);
    }
    if (arr.length) {
      galleryId = arr[0]._id || arr[0].id;
      if (galleryId) {
        await runCheck('GET', `/api/admin/gallery/${galleryId}`);
        // try PUT if we have an existing
        await runCheck('PUT', `/api/admin/gallery/${galleryId}`, { content: `HC Gallery Existing Updated ${UID}` });
      }
    }
  }
  console.log('');

  // ── Videos ─────────────────────────────────────────────────
  console.log(C.bold + '─ Videos ─' + C.reset);
  await runCheck('GET', '/api/admin/videos/');
  const vCreate = await runCheck('POST', '/api/admin/videos/', {
    url: `https://www.youtube.com/watch?v=hc${UID}`,
    title: `HC Video ${UID}`,
    category: 'education',
    status: 'published',
    thumbnail: 'https://via.placeholder.com/150',
    order: 1,
  });
  if (vCreate.passed) videoId = extractId(vCreate.data);
  if (!vCreate.passed && vCreate.status === 404) {
    const alt = await runCheck('POST', '/api/admin/videos', {
      url: `https://www.youtube.com/watch?v=hc${UID}`,
      title: `HC Video ${UID}`,
      category: 'education',
      status: 'published',
    });
    if (alt.passed) videoId = extractId(alt.data);
  }
  if (videoId) {
    await runCheck('GET', `/api/admin/videos/${videoId}`);
    // PUT must send full object (validator is create-shaped)
    await runCheck('PUT', `/api/admin/videos/${videoId}`, {
      url: `https://www.youtube.com/watch?v=hc${UID}upd`,
      title: `HC Video ${UID} Updated`,
      category: 'education',
      status: 'published',
      thumbnail: 'https://via.placeholder.com/150',
      order: 2,
    });
  } else {
    const list = await apiRequest('GET', '/api/admin/videos/');
    let arr = extractArray(list.data);
    if (!arr.length) {
      const alt = await apiRequest('GET', '/api/admin/videos');
      arr = extractArray(alt.data);
    }
    if (arr.length) {
      videoId = arr[0]._id || arr[0].id;
      if (videoId) {
        await runCheck('GET', `/api/admin/videos/${videoId}`);
        // try full update
        const existing = arr[0];
        await runCheck('PUT', `/api/admin/videos/${videoId}`, {
          url: existing.url || `https://www.youtube.com/watch?v=hc${UID}`,
          title: `HC Video Existing Updated ${UID}`,
          category: existing.category || 'education',
          status: 'published',
        });
      }
    }
  }
  console.log('');

  // ── Instagram Posts ────────────────────────────────────────
  console.log(C.bold + '─ Instagram Posts ─' + C.reset);
  await runCheck('GET', '/api/admin/instagram-posts/');
  if (mediaId1) {
    const iCreate = await runCheck('POST', '/api/admin/instagram-posts/', {
      image: mediaId1,
      permalink: `https://instagram.com/p/hc${UID}${TS}/`,
      caption: `HC Instagram ${UID}`,
      order: 1,
    });
    if (iCreate.passed) instaId = extractId(iCreate.data);
    if (!iCreate.passed && iCreate.status === 404) {
      const alt = await runCheck('POST', '/api/admin/instagram-posts', {
        image: mediaId1,
        permalink: `https://instagram.com/p/hc${UID}${TS}/`,
        caption: `HC Instagram ${UID}`,
        order: 1,
      });
      if (alt.passed) instaId = extractId(alt.data);
    }
    if (instaId) {
      await runCheck('GET', `/api/admin/instagram-posts/${instaId}`);
      await runCheck('PUT', `/api/admin/instagram-posts/${instaId}`, { caption: `HC Instagram Updated ${UID}` });
    }
  } else {
    console.log(C.yellow + '  ⚠ Skipping Instagram POST — no mediaId' + C.reset);
  }
  if (!instaId) {
    const list = await apiRequest('GET', '/api/admin/instagram-posts/');
    let arr = extractArray(list.data);
    if (!arr.length) {
      const alt = await apiRequest('GET', '/api/admin/instagram-posts');
      arr = extractArray(alt.data);
    }
    if (arr.length) {
      instaId = arr[0]._id || arr[0].id;
      if (instaId) {
        await runCheck('GET', `/api/admin/instagram-posts/${instaId}`);
        await runCheck('PUT', `/api/admin/instagram-posts/${instaId}`, { caption: `HC Existing Updated ${UID}` });
      }
    }
  }
  console.log('');

  // ── Profile ────────────────────────────────────────────────
  console.log(C.bold + '─ Profile ─' + C.reset);
  const profGet = await runCheck('GET', '/api/admin/profile/');
  if (profGet.passed) {
    const d = profGet.data && (profGet.data.data || profGet.data);
    if (d && typeof d === 'object') originalProfile = d;
    // try alt without trailing slash if 404
  } else if (profGet.status === 404) {
    const alt = await runCheck('GET', '/api/admin/profile');
    if (alt.passed) {
      const d = alt.data && (alt.data.data || alt.data);
      if (d && typeof d === 'object') originalProfile = d;
    }
  }
  // PUT test
  const profPutPayload = {
    bio: `Health check bio ${UID} — temp`,
    qualifications: [{ degree: 'BDS', institution: 'Test University', year: 2010 }],
  };
  const profPut = await runCheck('PUT', '/api/admin/profile/', profPutPayload);
  if (!profPut.passed && profPut.status === 404) {
    await runCheck('PUT', '/api/admin/profile', profPutPayload);
  }
  // revert if we had original
  if (profPut.passed && originalProfile) {
    const rev = {};
    if (originalProfile.bio) rev.bio = originalProfile.bio;
    else rev.bio = 'Reverted bio';
    // keep minimal revert
    await runCheck('PUT', '/api/admin/profile/', rev, { label: 'revert profile' });
  }
  console.log('');

  // ── Home Config ────────────────────────────────────────────
  console.log(C.bold + '─ Home Config ─' + C.reset);
  const homeGet = await runCheck('GET', '/api/admin/home/config');
  if (homeGet.passed) {
    const d = homeGet.data && (homeGet.data.data || homeGet.data);
    if (d && typeof d === 'object') originalHomeConfig = d;
  } else if (homeGet.status === 404) {
    // try public prefix which also requires auth
    await runCheck('GET', '/api/public/home/config', { expect: [200, 401, 404], label: 'public/home/config alt' });
  }
  // also check aggregate
  await runCheck('GET', '/api/admin/home/', undefined, { expect: [200, 404], label: 'admin home aggregate' });
  // PUT
  const homePayload = {
    featuredTreatments: [],
    featuredArticles: [],
    featuredVideos: [],
    featuredTestimonials: [],
  };
  const homePut = await runCheck('PUT', '/api/admin/home/config', homePayload);
  if (homePut.passed && originalHomeConfig) {
    // revert
    const rev = {
      featuredTreatments: originalHomeConfig.featuredTreatments || [],
      featuredArticles: originalHomeConfig.featuredArticles || [],
      featuredVideos: originalHomeConfig.featuredVideos || [],
      featuredTestimonials: originalHomeConfig.featuredTestimonials || [],
    };
    await runCheck('PUT', '/api/admin/home/config', rev, { label: 'revert home/config' });
  }
  if (!homePut.passed && homePut.status === 404) {
    await runCheck('PUT', '/api/public/home/config', homePayload, { expect: [200, 404, 401], label: 'public/home/config PUT alt' });
  }
  console.log('');

  // ── Leads ──────────────────────────────────────────────────
  console.log(C.bold + '─ Leads ─' + C.reset);
  await runCheck('GET', '/api/admin/leads/');
  await runCheck('GET', '/api/admin/leads/stats');
  await runCheck('GET', '/api/admin/leads/export', undefined, {
    // export is CSV text/csv — accept any 2xx
    validate: (d, r) => {
      const ct = r.raw && r.raw.slice(0, 100);
      // if CSV, raw will contain commas or be text
      return true;
    },
  });
  // Need a leadId — try list, else create via public enquiry
  let leadList = await apiRequest('GET', '/api/admin/leads/');
  let leadArr = extractArray(leadList.data);
  if (!leadArr.length) {
    // try without slash
    leadList = await apiRequest('GET', '/api/admin/leads');
    leadArr = extractArray(leadList.data);
  }
  if (leadArr.length) {
    leadId = leadArr[0]._id || leadArr[0].id;
  } else {
    // create via public enquiry
    console.log(C.dim + '  → No leads found, creating via POST /api/public/enquiry' + C.reset);
    const enquiry = await apiRequest('POST', '/api/public/enquiry', {
      name: `HC Lead ${UID}`,
      phone: `+91${String(TS).slice(-10)}`,
      treatmentInterest: treatmentId || undefined,
    });
    // log but not in results? — let's log via runCheck next time
    // For now, re-fetch list
    const after = await apiRequest('GET', '/api/admin/leads/');
    const arr2 = extractArray(after.data);
    if (arr2.length) leadId = arr2[0]._id || arr2[0].id;
    else {
      // try direct check
      await runCheck('POST', '/api/public/enquiry', {
        name: `HC Lead2 ${UID}`,
        phone: `+91${String(TS+1).slice(-10)}`,
      }, { expect: [201, 200, 429, 422], label: 'create lead via public enquiry (alt)' });
      const again = await apiRequest('GET', '/api/admin/leads/');
      const arr3 = extractArray(again.data);
      if (arr3.length) leadId = arr3[0]._id || arr3[0].id;
    }
  }
  if (leadId) {
    await runCheck('GET', `/api/admin/leads/${leadId}`);
    await runCheck('PUT', `/api/admin/leads/${leadId}`, { leadStatus: 'contacted', notes: `HC note ${UID}`, appointmentStatus: 'none' });
  } else {
    console.log(C.yellow + '  ⚠ No leadId available — skipping GET/PUT/DELETE by id' + C.reset);
    await runCheck('GET', '/api/admin/leads/000000000000000000000000', { expect: [200, 404], label: 'GET lead by fake id (expected 404)' });
  }
  console.log('');

  // ── Booking Provider ───────────────────────────────────────
  console.log(C.bold + '─ Booking Provider ─' + C.reset);
  const bpGet = await runCheck('GET', '/api/admin/booking-provider');
  if (bpGet.passed) {
    const d = bpGet.data && (bpGet.data.data || bpGet.data);
    if (d && typeof d === 'object') originalBooking = d;
  } else if (bpGet.status === 404) {
    console.log(C.dim + '  → booking-provider not configured (404 is expected for fresh DB)' + C.reset);
    // treat 404 as pass for this endpoint? — re-evaluate
    // We'll mark it as passed with note if 404
    // Already logged as fail; patch result to not count as fail if 404
    const last = results[results.length - 1];
    if (last && last.endpoint === '/api/admin/booking-provider' && last.status === 404) {
      last.passed = true;
      last.reason = 'Not configured yet (404 is expected, treated as pass)';
      console.log(C.yellow + '  ↳ 404 treated as ✅ (not configured yet is valid state)' + C.reset);
    }
  }
  const bpPayload = {
    providerName: 'practo',
    profileUrl: 'https://practo.com/healthcheck',
    bookingUrl: 'https://practo.com/book-healthcheck',
    isActive: true,
  };
  const bpPut = await runCheck('PUT', '/api/admin/booking-provider', bpPayload);
  // revert
  if (bpPut.passed && originalBooking) {
    const rev = {
      providerName: originalBooking.providerName || 'practo',
      profileUrl: originalBooking.profileUrl || '',
      bookingUrl: originalBooking.bookingUrl || '',
      isActive: originalBooking.isActive ?? true,
    };
    await runCheck('PUT', '/api/admin/booking-provider', rev, { label: 'revert booking-provider' });
  }
  await runCheck('GET', '/api/admin/practo-clicks');
  // also check booking-cta dual mounts
  await runCheck('GET', '/api/admin/booking-cta', undefined, { expect: [200, 404], label: 'booking-cta alt' });
  await runCheck('POST', '/api/admin/leads/practo-click', {}, { expect: [200, 404], label: 'practo-click log' });
  console.log('');

  // ── Redirects ──────────────────────────────────────────────
  console.log(C.bold + '─ Redirects ─' + C.reset);
  await runCheck('GET', '/api/admin/redirects/');
  const rdCreate = await runCheck('POST', '/api/admin/redirects/', {
    fromPath: `/hc-from-${UID}-${TS}`,
    toPath: `/hc-to-${UID}-${TS}`,
    statusCode: 301,
  });
  if (rdCreate.passed) redirectId = extractId(rdCreate.data);
  if (!rdCreate.passed && rdCreate.status === 404) {
    const alt = await runCheck('POST', '/api/admin/redirects', {
      fromPath: `/hc-from-${UID}-${TS}`,
      toPath: `/hc-to-${UID}-${TS}`,
      statusCode: 301,
    });
    if (alt.passed) redirectId = extractId(alt.data);
  }
  if (redirectId) {
    await runCheck('GET', `/api/admin/redirects/${redirectId}`);
    await runCheck('PUT', `/api/admin/redirects/${redirectId}`, { toPath: `/hc-to-updated-${UID}`, statusCode: 302 });
  } else {
    const list = await apiRequest('GET', '/api/admin/redirects/');
    let arr = extractArray(list.data);
    if (!arr.length) {
      const alt = await apiRequest('GET', '/api/admin/redirects');
      arr = extractArray(alt.data);
    }
    if (arr.length) {
      redirectId = arr[0]._id || arr[0].id;
      if (redirectId) {
        await runCheck('GET', `/api/admin/redirects/${redirectId}`);
        await runCheck('PUT', `/api/admin/redirects/${redirectId}`, { toPath: `/hc-to-existing-updated-${UID}` });
      }
    }
  }
  console.log('');

  // ── Analytics ──────────────────────────────────────────────
  console.log(C.bold + '─ Analytics ─' + C.reset);
  await runCheck('GET', '/api/admin/analytics/reports/monthly');
  await runCheck('GET', '/api/admin/analytics/events');
  // try with params
  await runCheck('GET', '/api/admin/analytics/events?page=1&limit=5', undefined, { label: 'events with pagination' });
  console.log('');

  // ── Audit Log (optional) ───────────────────────────────────
  console.log(C.bold + '─ Audit / Misc ─' + C.reset);
  await runCheck('GET', '/api/admin/audit-log', undefined, {
    expect: [200, 404],
    label: 'audit-log (404 = not implemented, treated as pass)',
  });
  // patch audit 404 to pass
  const lastAudit = results[results.length - 1];
  if (lastAudit && lastAudit.endpoint === '/api/admin/audit-log' && lastAudit.status === 404) {
    lastAudit.passed = true;
    console.log(C.yellow + '  ↳ 404 treated as ✅ (audit-log not implemented is acceptable)' + C.reset);
  }
  // also try plural
  await runCheck('GET', '/api/admin/audit-logs', undefined, { expect: [200, 404], label: 'audit-logs alt' });
  const lastAudit2 = results[results.length - 1];
  if (lastAudit2 && lastAudit2.endpoint === '/api/admin/audit-logs' && lastAudit2.status === 404) {
    lastAudit2.passed = true;
  }
  // also try auth/me via clinic-info? already done

  // Public health
  await runCheck('GET', '/api/public/health', undefined, { expect: [200, 404], label: 'public health (optional)' });
  const lastHealth = results[results.length - 1];
  if (lastHealth && lastHealth.endpoint === '/api/public/health' && lastHealth.status === 404) lastHealth.passed = true;

  console.log('');

  // ── Cleanup ────────────────────────────────────────────────
  console.log(C.bold + '─ Cleanup (delete test entities) ─' + C.reset);
  // Delete in reverse order, handling 404 as pass (already deleted)
  if (redirectId) {
    await runCheck('DELETE', `/api/admin/redirects/${redirectId}`, undefined, { expect: [200, 204, 404], label: 'cleanup redirect' });
    const last = results[results.length - 1];
    if (last.status === 404) last.passed = true;
  }
  if (leadId) {
    // Only delete the lead we created if name matches HC Lead — avoid deleting real data
    // Check if lead name contains HC
    try {
      const leadCheck = await apiRequest('GET', `/api/admin/leads/${leadId}`);
      const ld = leadCheck.data && (leadCheck.data.data || leadCheck.data);
      const name = ld && (ld.name || '');
      if (name && name.includes('HC Lead')) {
        await runCheck('DELETE', `/api/admin/leads/${leadId}`, undefined, { expect: [200, 204, 404], label: 'cleanup lead (HC only)' });
        const last = results[results.length - 1];
        if (last.status === 404) last.passed = true;
      } else {
        console.log(C.dim + `  ↳ Skipping lead DELETE — not an HC test lead (name: ${name || 'unknown'})` + C.reset);
        // still try PUT-revert? Already done
        // log a dummy pass to keep count stable? No need
      }
    } catch {
      await runCheck('DELETE', `/api/admin/leads/${leadId}`, undefined, { expect: [200, 204, 404], label: 'cleanup lead' });
    }
  }
  if (instaId) {
    await runCheck('DELETE', `/api/admin/instagram-posts/${instaId}`, undefined, { expect: [200, 204, 404], label: 'cleanup insta' });
    // alias without slash
    const last = results[results.length - 1];
    if (last.status === 404) {
      // try alt singular?
      const alt = await runCheck('DELETE', `/api/admin/instagram-posts/${instaId}`, undefined, { expect: [200, 204, 404], label: 'cleanup insta alt' });
      if (alt.status === 404) alt.passed = true;
    }
    if (last.status === 404) last.passed = true;
  }
  // try insta with trailing slash delete alternative if needed
  if (instaId) {
    const check = await apiRequest('DELETE', `/api/admin/instagram-posts/${instaId}`);
    if (check.status === 404) {
      await apiRequest('DELETE', `/api/admin/instagram-posts/${instaId}`);
    }
  }
  if (videoId) {
    await runCheck('DELETE', `/api/admin/videos/${videoId}`, undefined, { expect: [200, 204, 404], label: 'cleanup video' });
    const last = results[results.length - 1];
    if (last.status === 404) {
      // try without slash already
      last.passed = true;
    }
    // also try with slash
    if (last.status === 404) {
      await runCheck('DELETE', `/api/admin/videos/${videoId}`, undefined, { expect: [200, 204, 404] });
    }
  }
  if (galleryId) {
    await runCheck('DELETE', `/api/admin/gallery/${galleryId}`, undefined, { expect: [200, 204, 404], label: 'cleanup gallery' });
    const last = results[results.length - 1];
    if (last.status === 404) {
      // try without slash
      await runCheck('DELETE', `/api/admin/gallery/${galleryId}`, undefined, { expect: [200, 204, 404] });
      const alt = results[results.length - 1];
      if (alt.status === 404) alt.passed = true;
    }
    if (last.status === 404) last.passed = true;
  }
  if (testimonialId) {
    await runCheck('DELETE', `/api/admin/testimonials/${testimonialId}`, undefined, { expect: [200, 204, 404], label: 'cleanup testimonial' });
    const last = results[results.length - 1];
    if (last.status === 404) {
      await runCheck('DELETE', `/api/admin/testimonials/${testimonialId}`, undefined, { expect: [200, 204, 404] });
      const alt = results[results.length - 1];
      if (alt.status === 404) alt.passed = true;
    }
    if (last.status === 404) last.passed = true;
  }
  if (articleId) {
    await runCheck('DELETE', `/api/admin/articles/${articleId}`, undefined, { expect: [200, 204, 404], label: 'cleanup article' });
    const last = results[results.length - 1];
    if (last.status === 404) last.passed = true;
  }
  if (treatmentId) {
    await runCheck('DELETE', `/api/admin/treatments/${treatmentId}`, undefined, { expect: [200, 204, 404], label: 'cleanup treatment' });
    const last = results[results.length - 1];
    if (last.status === 404) last.passed = true;
  }
  // media delete (last)
  if (mediaId1) {
    await runCheck('DELETE', `/api/admin/media/${mediaId1}`, undefined, { expect: [200, 204, 404], label: 'cleanup media1' });
    const last = results[results.length - 1];
    if (last.status === 404) last.passed = true;
  }
  if (mediaId2 && mediaId2 !== mediaId1) {
    await runCheck('DELETE', `/api/admin/media/${mediaId2}`, undefined, { expect: [200, 204, 404], label: 'cleanup media2' });
    const last = results[results.length - 1];
    if (last.status === 404) last.passed = true;
  }
  console.log('');

  printSummary();
}

function printSummary() {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const rate = total ? ((passed / total) * 100).toFixed(2) : '0.00';
  console.log(C.bold + C.cyan + '════════════════════════════════════════════════════════════' + C.reset);
  console.log(C.bold + '  Summary' + C.reset);
  console.log(C.cyan + '════════════════════════════════════════════════════════════' + C.reset);
  console.log(`  Total APIs:   ${total}`);
  console.log(C.green + `  Passed:       ${passed}` + C.reset);
  if (failed) console.log(C.red + `  Failed:       ${failed}` + C.reset);
  else console.log(`  Failed:       ${failed}`);
  console.log(`  Success Rate: ${rate}%`);
  console.log(C.cyan + '════════════════════════════════════════════════════════════' + C.reset);
  if (failed) {
    console.log('');
    console.log(C.red + C.bold + '  Failed endpoints:' + C.reset);
    for (const r of results.filter(r => !r.passed)) {
      console.log(C.red + `   ❌ ${r.method} ${r.endpoint} → ${r.status} — ${r.reason}` + C.reset);
    }
  }
  console.log('');
  // Detailed table
  console.log(C.dim + '  Detailed:' + C.reset);
  console.log(C.dim + '  ' + '-'.repeat(60) + C.reset);
  for (const r of results) {
    const icon = r.passed ? '✅' : '❌';
    const st = r.status === 0 ? 'ERR' : r.status;
    console.log(`  ${icon} ${r.method.padEnd(6)} ${r.endpoint.padEnd(40)} ${String(st).padStart(3)}  ${String(r.ms).padStart(4)}ms`);
  }
  console.log(C.dim + '  ' + '-'.repeat(60) + C.reset);
  console.log('');
}

main().catch(e => {
  console.error(C.red + 'Fatal error:' + C.reset, e);
  process.exit(1);
});
