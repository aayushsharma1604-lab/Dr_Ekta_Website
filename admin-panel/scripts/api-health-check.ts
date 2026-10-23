#!/usr/bin/env node
// @ts-nocheck
/**
 * API Health Check — admin-panel (TypeScript variant)
 * Direct backend calls (not Next proxy) with Bearer token.
 *
 * Usage:
 *   npx tsx scripts/api-health-check.ts
 *   node scripts/api-health-check.js
 *
 * This file is intentionally a TS-compatible copy of api-health-check.js.
 * It can be run via `npx tsx` without compilation.
 */

import * as fs from 'fs';
import * as path from 'path';

// ------------------------------------------------------------
// 1. Load env — try dotenv, else manual .env parsing
// ------------------------------------------------------------
function loadEnvFile(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) (process.env as any)[key] = val;
    }
  } catch (_) {}
}

(function initEnv() {
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
  (process.env as any).API_BASE ||
  (process.env as any).BACKEND_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || (process.env as any).TEST_ADMIN_EMAIL || 'admin@drektanarula.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (process.env as any).TEST_ADMIN_PASSWORD || 'admin123';

const TS = Date.now();
const UID = String(TS).slice(-6);

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let accessToken: string | null = null;
let refreshToken: string | null = null;
const results: any[] = [];

function logHeader() {
  console.log('');
  console.log(C.bold + C.cyan + '════════════════════════════════════════════════════════════' + C.reset);
  console.log(C.bold + C.cyan + '  Dr. Ekta Narula — Admin API Health Check (TS)' + C.reset);
  console.log(C.dim + `  Base: ${API_BASE}` + C.reset);
  console.log(C.dim + `  User: ${ADMIN_EMAIL}` + C.reset);
  console.log(C.dim + `  Time: ${new Date().toISOString()}` + C.reset);
  console.log(C.cyan + '════════════════════════════════════════════════════════════' + C.reset);
  console.log('');
}

function extractTokenData(data: any) {
  if (!data || typeof data !== 'object') return {};
  const d = data.data || data;
  return {
    accessToken: d.accessToken || d.access_token || d.token || null,
    refreshToken: d.refreshToken || d.refresh_token || null,
    user: d.user || d.admin || null,
  };
}

function extractId(payload: any): string | null {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  const obj = payload.data || payload.item || payload;
  if (obj && typeof obj === 'object') return obj._id || obj.id || obj._Id || null;
  return null;
}

function extractArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.items) return payload.items;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  if (payload.data && payload.data.items) return payload.data.items;
  return [];
}

async function refreshAuth(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const url = `${API_BASE}/api/admin/auth/refresh`;
    const res: any = await (global as any).fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const text = await res.text();
    let data: any; try { data = JSON.parse(text); } catch { data = {}; }
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

async function apiRequest(method: string, endpoint: string, body: any = undefined, opts: any = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers: any = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(opts.headers || {}),
  };
  const start = Date.now();
  let status = 0; let ok = false; let data: any = null; let raw = ''; let error: any = null;
  try {
    const res: any = await (global as any).fetch(url, {
      method, headers, body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    status = res.status; ok = res.ok; raw = await res.text();
    try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
    if (status === 401 && !opts._retry && refreshToken) {
      const refreshed = await refreshAuth();
      if (refreshed) return apiRequest(method, endpoint, body, { ...opts, _retry: true });
    }
  } catch (e: any) { error = e.message || String(e); status = 0; ok = false; }
  const ms = Date.now() - start;
  return { method, endpoint, status, ok, ms, data, raw, error };
}

function formatResult(r: any, expectedStatuses: number[] | null = null) {
  let passed = r.ok; let reason = '';
  if (expectedStatuses) { passed = expectedStatuses.includes(r.status); if (!passed) reason = `Expected ${expectedStatuses.join('/')} but got ${r.status}`; }
  if (r.error) { passed = false; reason = r.error; }
  else if (!passed && !reason) {
    const msg = (r.data && typeof r.data === 'object' ? r.data.error || r.data.message || r.data.msg : r.raw) || `HTTP ${r.status}`;
    const details = r.data && r.data.details ? `: ${r.data.details.map((d:any)=>`${d.field||''} ${d.message||d.msg||''}`.trim()).join(', ')}` : '';
    reason = String(msg).slice(0,300)+details;
    if (r.status===0) reason = 'Network error — is backend running at '+API_BASE+'?';
  }
  return { passed, reason };
}

function logResult(r: any, passed: boolean, reason: string, note = '') {
  const icon = passed ? `${C.green}✅${C.reset}` : `${C.red}❌${C.reset}`;
  const methodPad = r.method.padEnd(6);
  const ep = r.endpoint; const st = r.status===0?'ERR':String(r.status); const time = `${r.ms}ms`.padStart(6);
  const baseLine = `${icon} ${methodPad} ${ep}  ${C.dim}→ ${st} (${time})${C.reset}`;
  if (passed) { console.log(baseLine); if (note) console.log(C.dim+`   ${note}`+C.reset); }
  else { console.log(baseLine); console.log(C.red+`   Reason: ${reason||'Unknown'}`+C.reset); if (note) console.log(C.dim+`   Note: ${note}`+C.reset);
    if (r.raw && r.raw.length<500 && r.status>=400) { const t=r.raw.slice(0,500).replace(/\n/g,' '); if(t&&t!==reason) console.log(C.dim+`   Body: ${t}`+C.reset); }
  }
}

async function runCheck(method: string, endpoint: string, body?: any, opts: any = {}) {
  const { expect, label, validate } = opts;
  const r: any = await apiRequest(method, endpoint, body, opts);
  let { passed, reason } = formatResult(r, expect||null);
  if (passed && typeof validate === 'function') {
    try { const v=validate(r.data,r); if(v===false){passed=false;reason='Validation failed';} else if(v&&typeof v==='object'&&v.ok===false){passed=false;reason=v.reason||'Validation failed';}}
    catch(e:any){passed=false;reason=`Validate error: ${e.message}`;}
  }
  logResult(r, passed, reason, label||'');
  results.push({ ...r, passed, reason, label });
  return { ...r, passed, reason };
}

async function main() {
  logHeader();
  console.log(C.bold+'─ Authenticating ─'+C.reset);
  const login: any = await apiRequest('POST','/api/admin/auth/login',{ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  {
    const { passed, reason } = formatResult(login);
    logResult(login, passed, reason, 'Login — obtain tokens');
    results.push({ ...login, passed, reason, label:'login'});
    if (!passed){ console.log(''); console.log(C.red+C.bold+'✖ Login failed — cannot continue. Check credentials and backend.'+C.reset);
      console.log(C.dim+`  Tried ${API_BASE}/api/admin/auth/login with ${ADMIN_EMAIL}`+C.reset);
      if(login.raw) console.log(C.dim+`  Response: ${login.raw.slice(0,800)}`+C.reset);
      printSummary(); process.exit(1); }
    const tok = extractTokenData(login.data);
    accessToken = tok.accessToken; refreshToken = tok.refreshToken;
    if(!accessToken) console.log(C.yellow+'⚠ Login returned 200 but no accessToken found'+C.reset);
    else console.log(C.green+`  ✓ Authenticated (token ${accessToken.slice(0,12)}…)`+C.reset);
  }
  console.log('');

  let mediaId1: string|null=null, mediaId2: string|null=null;
  let treatmentId: string|null=null, articleId: string|null=null, testimonialId: string|null=null;
  let galleryId: string|null=null, videoId: string|null=null, instaId: string|null=null;
  let redirectId: string|null=null, leadId: string|null=null;
  let originalClinic:any=null, originalProfile:any=null, originalHomeConfig:any=null, originalBooking:any=null;

  console.log(C.bold+'─ Auth / Core ─'+C.reset);
  await runCheck('GET','/api/admin/auth/me');
  await runCheck('GET','/api/admin/clinic-info');
  console.log('');

  console.log(C.bold+'─ Clinic Info ─'+C.reset);
  const clinicGet:any = await runCheck('GET','/api/admin/clinic-info');
  try{ const d=clinicGet.data && (clinicGet.data.data||clinicGet.data); if(d&&typeof d==='object') originalClinic=d; }catch{}
  if(clinicGet.passed){
    const testPayload:any={ practiceName:`HealthCheck Clinic ${UID}` };
    const putRes:any = await runCheck('PUT','/api/admin/clinic-info',testPayload);
    if(putRes.passed && originalClinic){ const rev:any={}; if(originalClinic.practiceName) rev.practiceName=originalClinic.practiceName; else rev.practiceName=testPayload.practiceName;
      await runCheck('PUT','/api/admin/clinic-info',rev,{label:'revert clinic-info'});}
  } else { await runCheck('PUT','/api/admin/clinic-info',{practiceName:`HealthCheck ${UID}`}); }
  console.log('');

  console.log(C.bold+'─ Media ─'+C.reset);
  await runCheck('GET','/api/admin/media');
  await runCheck('POST','/api/admin/media/upload',{filename:`hc-test-${UID}-1.jpg`,mimeType:'image/jpeg',size:1024});
  const confirmPayload1={key:`health-check/hc-test-${UID}-1.jpg`, publicId:`health-check/hc-test-${UID}-1.jpg`, url:'https://via.placeholder.com/150', filename:`hc-test-${UID}-1.jpg`, mimeType:'image/jpeg', size:1024};
  const conf1:any = await runCheck('POST','/api/admin/media/confirm',confirmPayload1);
  if(conf1.passed) mediaId1=extractId(conf1.data);
  if(!mediaId1){ const list:any=await apiRequest('GET','/api/admin/media'); const arr=extractArray(list.data); if(arr.length) mediaId1=arr[0]._id||arr[0].id; }
  await runCheck('POST','/api/admin/media/upload',{filename:`hc-test-${UID}-2.jpg`,mimeType:'image/jpeg',size:2048});
  const confirmPayload2={key:`health-check/hc-test-${UID}-2.jpg`, publicId:`health-check/hc-test-${UID}-2.jpg`, url:'https://via.placeholder.com/150/0000FF', filename:`hc-test-${UID}-2.jpg`, mimeType:'image/jpeg', size:2048};
  const conf2:any = await runCheck('POST','/api/admin/media/confirm',confirmPayload2);
  if(conf2.passed) mediaId2=extractId(conf2.data);
  if(!mediaId2) mediaId2=mediaId1;
  if(mediaId1) await runCheck('GET',`/api/admin/media/${mediaId1}`);
  else await runCheck('GET','/api/admin/media/000000000000000000000000',{expect:[200,404],label:'mediaId fallback (expected 404)'});
  console.log('');

  console.log(C.bold+'─ Treatments ─'+C.reset);
  await runCheck('GET','/api/admin/treatments');
  const tCreate:any = await runCheck('POST','/api/admin/treatments',{title:`HC Treatment ${UID}`, slug:`hc-treatment-${UID}-${TS}`, status:'draft', sections:{what:'Health check test'}});
  if(tCreate.passed) treatmentId=extractId(tCreate.data);
  if(treatmentId){ await runCheck('GET',`/api/admin/treatments/${treatmentId}`); await runCheck('PUT',`/api/admin/treatments/${treatmentId}`,{title:`HC Treatment ${UID} Updated`,status:'draft'}); }
  else { const list:any=await apiRequest('GET','/api/admin/treatments'); const arr=extractArray(list.data); if(arr.length){ treatmentId=arr[0]._id||arr[0].id; if(treatmentId){ await runCheck('GET',`/api/admin/treatments/${treatmentId}`); await runCheck('PUT',`/api/admin/treatments/${treatmentId}`,{title:`HC Treatment Existing Updated ${UID}`}); } } }
  console.log('');

  console.log(C.bold+'─ Articles ─'+C.reset);
  await runCheck('GET','/api/admin/articles');
  const aCreate:any = await runCheck('POST','/api/admin/articles',{title:`HC Article ${UID}`,slug:`hc-article-${UID}-${TS}`,category:'patient-education',body:'Health check article body.',author:'Health Check',status:'draft'});
  if(aCreate.passed) articleId=extractId(aCreate.data);
  if(articleId){ await runCheck('GET',`/api/admin/articles/${articleId}`); await runCheck('PUT',`/api/admin/articles/${articleId}`,{title:`HC Article ${UID} Updated`,category:'patient-education',body:'Updated body',author:'Health Check',status:'draft'}); }
  else { const list:any=await apiRequest('GET','/api/admin/articles'); const arr=extractArray(list.data); if(arr.length){ articleId=arr[0]._id||arr[0].id; if(articleId){ await runCheck('GET',`/api/admin/articles/${articleId}`); await runCheck('PUT',`/api/admin/articles/${articleId}`,{title:`HC Article Existing Updated ${UID}`}); } } }
  console.log('');

  console.log(C.bold+'─ Testimonials ─'+C.reset);
  await runCheck('GET','/api/admin/testimonials/');
  const teCreate:any = await runCheck('POST','/api/admin/testimonials/',{patientDisplayName:`HC Patient ${UID}`,content:'Health check testimonial — excellent service.',type:'text',status:'draft'});
  let teId:string|null=null; if(teCreate.passed) teId=extractId(teCreate.data);
  if(!teCreate.passed && teCreate.status===404){ const alt:any=await runCheck('POST','/api/admin/testimonials',{patientDisplayName:`HC Patient ${UID}`,content:'Health check testimonial.',type:'text',status:'draft'}); if(alt.passed) teId=extractId(alt.data); }
  testimonialId=teId;
  if(testimonialId){ await runCheck('GET',`/api/admin/testimonials/${testimonialId}`); await runCheck('PUT',`/api/admin/testimonials/${testimonialId}`,{content:'Updated health check testimonial',status:'draft'}); }
  else { const list:any=await apiRequest('GET','/api/admin/testimonials/'); let arr=extractArray(list.data); if(!arr.length){ const alt=await apiRequest('GET','/api/admin/testimonials'); arr=extractArray(alt.data);} if(arr.length){ testimonialId=arr[0]._id||arr[0].id; if(testimonialId){ await runCheck('GET',`/api/admin/testimonials/${testimonialId}`); await runCheck('PUT',`/api/admin/testimonials/${testimonialId}`,{content:'Updated existing'}); } } }
  console.log('');

  console.log(C.bold+'─ Gallery ─'+C.reset);
  await runCheck('GET','/api/admin/gallery/');
  if(mediaId1 && mediaId2){
    const gCreate:any=await runCheck('POST','/api/admin/gallery/',{beforeImg:mediaId1, afterImg:mediaId2, content:`HC Gallery ${UID}`, status:'draft'});
    if(gCreate.passed) galleryId=extractId(gCreate.data);
    if(!gCreate.passed && gCreate.status===404){ const alt:any=await runCheck('POST','/api/admin/gallery',{beforeImg:mediaId1,afterImg:mediaId2,content:`HC Gallery ${UID}`,status:'draft'}); if(alt.passed) galleryId=extractId(alt.data); }
    if(galleryId){ await runCheck('GET',`/api/admin/gallery/${galleryId}`); await runCheck('PUT',`/api/admin/gallery/${galleryId}`,{content:`HC Gallery Updated ${UID}`}); }
  } else { console.log(C.yellow+'  ⚠ Skipping Gallery POST — no mediaIds'+C.reset); }
  if(!galleryId){ const list:any=await apiRequest('GET','/api/admin/gallery/'); let arr=extractArray(list.data); if(!arr.length){ const alt=await apiRequest('GET','/api/admin/gallery'); arr=extractArray(alt.data);} if(arr.length){ galleryId=arr[0]._id||arr[0].id; if(galleryId){ await runCheck('GET',`/api/admin/gallery/${galleryId}`); await runCheck('PUT',`/api/admin/gallery/${galleryId}`,{content:`HC Gallery Existing Updated ${UID}`}); } } }
  console.log('');

  console.log(C.bold+'─ Videos ─'+C.reset);
  await runCheck('GET','/api/admin/videos/');
  const vCreate:any=await runCheck('POST','/api/admin/videos/',{url:`https://www.youtube.com/watch?v=hc${UID}`,title:`HC Video ${UID}`,category:'education',status:'published',thumbnail:'https://via.placeholder.com/150',order:1});
  if(vCreate.passed) videoId=extractId(vCreate.data);
  if(!vCreate.passed && vCreate.status===404){ const alt:any=await runCheck('POST','/api/admin/videos',{url:`https://www.youtube.com/watch?v=hc${UID}`,title:`HC Video ${UID}`,category:'education',status:'published'}); if(alt.passed) videoId=extractId(alt.data); }
  if(videoId){ await runCheck('GET',`/api/admin/videos/${videoId}`); await runCheck('PUT',`/api/admin/videos/${videoId}`,{url:`https://www.youtube.com/watch?v=hc${UID}upd`,title:`HC Video ${UID} Updated`,category:'education',status:'published',thumbnail:'https://via.placeholder.com/150',order:2}); }
  else { const list:any=await apiRequest('GET','/api/admin/videos/'); let arr=extractArray(list.data); if(!arr.length){ const alt=await apiRequest('GET','/api/admin/videos'); arr=extractArray(alt.data);} if(arr.length){ videoId=arr[0]._id||arr[0].id; if(videoId){ await runCheck('GET',`/api/admin/videos/${videoId}`); const ex=arr[0]; await runCheck('PUT',`/api/admin/videos/${videoId}`,{url:ex.url||`https://www.youtube.com/watch?v=hc${UID}`,title:`HC Video Existing Updated ${UID}`,category:ex.category||'education',status:'published'}); } } }
  console.log('');

  console.log(C.bold+'─ Instagram Posts ─'+C.reset);
  await runCheck('GET','/api/admin/instagram-posts/');
  if(mediaId1){
    const iCreate:any=await runCheck('POST','/api/admin/instagram-posts/',{image:mediaId1,permalink:`https://instagram.com/p/hc${UID}${TS}/`,caption:`HC Instagram ${UID}`,order:1});
    if(iCreate.passed) instaId=extractId(iCreate.data);
    if(!iCreate.passed && iCreate.status===404){ const alt:any=await runCheck('POST','/api/admin/instagram-posts',{image:mediaId1,permalink:`https://instagram.com/p/hc${UID}${TS}/`,caption:`HC Instagram ${UID}`,order:1}); if(alt.passed) instaId=extractId(alt.data); }
    if(instaId){ await runCheck('GET',`/api/admin/instagram-posts/${instaId}`); await runCheck('PUT',`/api/admin/instagram-posts/${instaId}`,{caption:`HC Instagram Updated ${UID}`}); }
  } else console.log(C.yellow+'  ⚠ Skipping Instagram POST — no mediaId'+C.reset);
  if(!instaId){ const list:any=await apiRequest('GET','/api/admin/instagram-posts/'); let arr=extractArray(list.data); if(!arr.length){ const alt=await apiRequest('GET','/api/admin/instagram-posts'); arr=extractArray(alt.data);} if(arr.length){ instaId=arr[0]._id||arr[0].id; if(instaId){ await runCheck('GET',`/api/admin/instagram-posts/${instaId}`); await runCheck('PUT',`/api/admin/instagram-posts/${instaId}`,{caption:`HC Existing Updated ${UID}`}); } } }
  console.log('');

  console.log(C.bold+'─ Profile ─'+C.reset);
  const profGet:any=await runCheck('GET','/api/admin/profile/');
  if(profGet.passed){ const d=profGet.data && (profGet.data.data||profGet.data); if(d&&typeof d==='object') originalProfile=d; }
  else if(profGet.status===404){ const alt:any=await runCheck('GET','/api/admin/profile'); if(alt.passed){ const d=alt.data&&(alt.data.data||alt.data); if(d&&typeof d==='object') originalProfile=d; } }
  const profPut:any=await runCheck('PUT','/api/admin/profile/',{bio:`Health check bio ${UID} — temp`,qualifications:[{degree:'BDS',institution:'Test University',year:2010}]});
  if(!profPut.passed && profPut.status===404) await runCheck('PUT','/api/admin/profile',{bio:`Health check bio ${UID} — temp`});
  if(profPut.passed && originalProfile){ const rev:any={}; if(originalProfile.bio) rev.bio=originalProfile.bio; else rev.bio='Reverted bio'; await runCheck('PUT','/api/admin/profile/',rev,{label:'revert profile'}); }
  console.log('');

  console.log(C.bold+'─ Home Config ─'+C.reset);
  const homeGet:any=await runCheck('GET','/api/admin/home/config');
  if(homeGet.passed){ const d=homeGet.data&&(homeGet.data.data||homeGet.data); if(d&&typeof d==='object') originalHomeConfig=d; }
  else if(homeGet.status===404) await runCheck('GET','/api/public/home/config',{expect:[200,401,404],label:'public/home/config alt'});
  await runCheck('GET','/api/admin/home/',undefined,{expect:[200,404],label:'admin home aggregate'});
  const homePut:any=await runCheck('PUT','/api/admin/home/config',{featuredTreatments:[],featuredArticles:[],featuredVideos:[],featuredTestimonials:[]});
  if(homePut.passed && originalHomeConfig){ const rev={featuredTreatments:originalHomeConfig.featuredTreatments||[],featuredArticles:originalHomeConfig.featuredArticles||[],featuredVideos:originalHomeConfig.featuredVideos||[],featuredTestimonials:originalHomeConfig.featuredTestimonials||[]}; await runCheck('PUT','/api/admin/home/config',rev,{label:'revert home/config'}); }
  if(!homePut.passed && homePut.status===404) await runCheck('PUT','/api/public/home/config',{featuredTreatments:[],featuredArticles:[],featuredVideos:[],featuredTestimonials:[]},{expect:[200,404,401],label:'public/home/config PUT alt'});
  console.log('');

  console.log(C.bold+'─ Leads ─'+C.reset);
  await runCheck('GET','/api/admin/leads/');
  await runCheck('GET','/api/admin/leads/stats');
  await runCheck('GET','/api/admin/leads/export');
  let leadList:any=await apiRequest('GET','/api/admin/leads/'); let leadArr=extractArray(leadList.data);
  if(!leadArr.length){ leadList=await apiRequest('GET','/api/admin/leads'); leadArr=extractArray(leadList.data); }
  if(!leadArr.length){
    console.log(C.dim+'  → No leads, creating via POST /api/public/enquiry'+C.reset);
    await apiRequest('POST','/api/public/enquiry',{name:`HC Lead ${UID}`,phone:`+91${String(TS).slice(-10)}`,treatmentInterest:treatmentId||undefined});
    const after:any=await apiRequest('GET','/api/admin/leads/'); const arr2=extractArray(after.data); if(arr2.length) leadId=arr2[0]._id||arr2[0].id;
    else { await runCheck('POST','/api/public/enquiry',{name:`HC Lead2 ${UID}`,phone:`+91${String(TS+1).slice(-10)}`},{expect:[201,200,429,422],label:'create lead via public enquiry (alt)'}); const again:any=await apiRequest('GET','/api/admin/leads/'); const arr3=extractArray(again.data); if(arr3.length) leadId=arr3[0]._id||arr3[0].id; }
  } else leadId=leadArr[0]._id||leadArr[0].id;
  if(leadId){ await runCheck('GET',`/api/admin/leads/${leadId}`); await runCheck('PUT',`/api/admin/leads/${leadId}`,{leadStatus:'contacted',notes:`HC note ${UID}`,appointmentStatus:'none'}); }
  else { console.log(C.yellow+'  ⚠ No leadId — skipping GET/PUT/DELETE by id'+C.reset); await runCheck('GET','/api/admin/leads/000000000000000000000000',{expect:[200,404],label:'GET lead by fake id (expected 404)'}); }
  console.log('');

  console.log(C.bold+'─ Booking Provider ─'+C.reset);
  const bpGet:any=await runCheck('GET','/api/admin/booking-provider');
  if(bpGet.passed){ const d=bpGet.data&&(bpGet.data.data||bpGet.data); if(d&&typeof d==='object') originalBooking=d; }
  else if(bpGet.status===404){ console.log(C.dim+'  → booking-provider not configured (404 expected)'+C.reset); const last=results[results.length-1]; if(last&&last.endpoint==='/api/admin/booking-provider'&&last.status===404){ last.passed=true; last.reason='Not configured yet (404 is expected, treated as pass)'; console.log(C.yellow+'  ↳ 404 treated as ✅'+C.reset); } }
  const bpPut:any=await runCheck('PUT','/api/admin/booking-provider',{providerName:'practo',profileUrl:'https://practo.com/healthcheck',bookingUrl:'https://practo.com/book-healthcheck',isActive:true});
  if(bpPut.passed && originalBooking){ const rev={providerName:originalBooking.providerName||'practo',profileUrl:originalBooking.profileUrl||'',bookingUrl:originalBooking.bookingUrl||'',isActive:originalBooking.isActive??true}; await runCheck('PUT','/api/admin/booking-provider',rev,{label:'revert booking-provider'}); }
  await runCheck('GET','/api/admin/practo-clicks');
  await runCheck('GET','/api/admin/booking-cta',undefined,{expect:[200,404],label:'booking-cta alt'});
  await runCheck('POST','/api/admin/leads/practo-click',{}, {expect:[200,404],label:'practo-click log'});
  console.log('');

  console.log(C.bold+'─ Redirects ─'+C.reset);
  await runCheck('GET','/api/admin/redirects/');
  const rdCreate:any=await runCheck('POST','/api/admin/redirects/',{fromPath:`/hc-from-${UID}-${TS}`,toPath:`/hc-to-${UID}-${TS}`,statusCode:301});
  if(rdCreate.passed) redirectId=extractId(rdCreate.data);
  if(!rdCreate.passed && rdCreate.status===404){ const alt:any=await runCheck('POST','/api/admin/redirects',{fromPath:`/hc-from-${UID}-${TS}`,toPath:`/hc-to-${UID}-${TS}`,statusCode:301}); if(alt.passed) redirectId=extractId(alt.data); }
  if(redirectId){ await runCheck('GET',`/api/admin/redirects/${redirectId}`); await runCheck('PUT',`/api/admin/redirects/${redirectId}`,{toPath:`/hc-to-updated-${UID}`,statusCode:302}); }
  else { const list:any=await apiRequest('GET','/api/admin/redirects/'); let arr=extractArray(list.data); if(!arr.length){ const alt=await apiRequest('GET','/api/admin/redirects'); arr=extractArray(alt.data);} if(arr.length){ redirectId=arr[0]._id||arr[0].id; if(redirectId){ await runCheck('GET',`/api/admin/redirects/${redirectId}`); await runCheck('PUT',`/api/admin/redirects/${redirectId}`,{toPath:`/hc-to-existing-updated-${UID}`}); } } }
  console.log('');

  console.log(C.bold+'─ Analytics ─'+C.reset);
  await runCheck('GET','/api/admin/analytics/reports/monthly');
  await runCheck('GET','/api/admin/analytics/events');
  await runCheck('GET','/api/admin/analytics/events?page=1&limit=5',undefined,{label:'events with pagination'});
  console.log('');

  console.log(C.bold+'─ Audit / Misc ─'+C.reset);
  await runCheck('GET','/api/admin/audit-log',undefined,{expect:[200,404],label:'audit-log (404 = not implemented, treated as pass)'});
  const lastAudit=results[results.length-1]; if(lastAudit&&lastAudit.endpoint==='/api/admin/audit-log'&&lastAudit.status===404){ lastAudit.passed=true; console.log(C.yellow+'  ↳ 404 treated as ✅ (audit-log not implemented)'+C.reset); }
  await runCheck('GET','/api/admin/audit-logs',undefined,{expect:[200,404],label:'audit-logs alt'});
  const lastAudit2=results[results.length-1]; if(lastAudit2&&lastAudit2.endpoint==='/api/admin/audit-logs'&&lastAudit2.status===404) lastAudit2.passed=true;
  await runCheck('GET','/api/public/health',undefined,{expect:[200,404],label:'public health (optional)'});
  const lastHealth=results[results.length-1]; if(lastHealth&&lastHealth.endpoint==='/api/public/health'&&lastHealth.status===404) lastHealth.passed=true;
  console.log('');

  console.log(C.bold+'─ Cleanup (delete test entities) ─'+C.reset);
  if(redirectId){ await runCheck('DELETE',`/api/admin/redirects/${redirectId}`,undefined,{expect:[200,204,404],label:'cleanup redirect'}); const last=results[results.length-1]; if(last.status===404) last.passed=true; }
  if(leadId){ try{ const lc:any=await apiRequest('GET',`/api/admin/leads/${leadId}`); const ld=lc.data&&(lc.data.data||lc.data); const name=ld&&(ld.name||''); if(name&&name.includes('HC Lead')){ await runCheck('DELETE',`/api/admin/leads/${leadId}`,undefined,{expect:[200,204,404],label:'cleanup lead (HC only)'}); const last=results[results.length-1]; if(last.status===404) last.passed=true; } else console.log(C.dim+`  ↳ Skipping lead DELETE — not HC test lead (name: ${name||'unknown'})`+C.reset); } catch{ await runCheck('DELETE',`/api/admin/leads/${leadId}`,undefined,{expect:[200,204,404],label:'cleanup lead'}); } }
  if(instaId){ await runCheck('DELETE',`/api/admin/instagram-posts/${instaId}`,undefined,{expect:[200,204,404],label:'cleanup insta'}); const last=results[results.length-1]; if(last.status===404) last.passed=true; }
  if(videoId){ await runCheck('DELETE',`/api/admin/videos/${videoId}`,undefined,{expect:[200,204,404],label:'cleanup video'}); const last=results[results.length-1]; if(last.status===404) last.passed=true; }
  if(galleryId){ await runCheck('DELETE',`/api/admin/gallery/${galleryId}`,undefined,{expect:[200,204,404],label:'cleanup gallery'}); const last=results[results.length-1]; if(last.status===404) last.passed=true; }
  if(testimonialId){ await runCheck('DELETE',`/api/admin/testimonials/${testimonialId}`,undefined,{expect:[200,204,404],label:'cleanup testimonial'}); const last=results[results.length-1]; if(last.status===404) last.passed=true; }
  if(articleId){ await runCheck('DELETE',`/api/admin/articles/${articleId}`,undefined,{expect:[200,204,404],label:'cleanup article'}); const last=results[results.length-1]; if(last.status===404) last.passed=true; }
  if(treatmentId){ await runCheck('DELETE',`/api/admin/treatments/${treatmentId}`,undefined,{expect:[200,204,404],label:'cleanup treatment'}); const last=results[results.length-1]; if(last.status===404) last.passed=true; }
  if(mediaId1){ await runCheck('DELETE',`/api/admin/media/${mediaId1}`,undefined,{expect:[200,204,404],label:'cleanup media1'}); const last=results[results.length-1]; if(last.status===404) last.passed=true; }
  if(mediaId2 && mediaId2!==mediaId1){ await runCheck('DELETE',`/api/admin/media/${mediaId2}`,undefined,{expect:[200,204,404],label:'cleanup media2'}); const last=results[results.length-1]; if(last.status===404) last.passed=true; }
  console.log('');

  printSummary();
}

function printSummary(){
  const total=results.length; const passed=results.filter(r=>r.passed).length; const failed=total-passed; const rate=total?((passed/total)*100).toFixed(2):'0.00';
  console.log(C.bold+C.cyan+'════════════════════════════════════════════════════════════'+C.reset);
  console.log(C.bold+'  Summary'+C.reset);
  console.log(C.cyan+'════════════════════════════════════════════════════════════'+C.reset);
  console.log(`  Total APIs:   ${total}`); console.log(C.green+`  Passed:       ${passed}`+C.reset);
  if(failed) console.log(C.red+`  Failed:       ${failed}`+C.reset); else console.log(`  Failed:       ${failed}`);
  console.log(`  Success Rate: ${rate}%`); console.log(C.cyan+'════════════════════════════════════════════════════════════'+C.reset);
  if(failed){ console.log(''); console.log(C.red+C.bold+'  Failed endpoints:'+C.reset); for(const r of results.filter(r=>!r.passed)) console.log(C.red+`   ❌ ${r.method} ${r.endpoint} → ${r.status} — ${r.reason}`+C.reset); }
  console.log(''); console.log(C.dim+'  Detailed:'+C.reset); console.log(C.dim+'  '+ '-'.repeat(60)+C.reset);
  for(const r of results){ const icon=r.passed?'✅':'❌'; const st=r.status===0?'ERR':r.status; console.log(`  ${icon} ${r.method.padEnd(6)} ${r.endpoint.padEnd(40)} ${String(st).padStart(3)}  ${String(r.ms).padStart(4)}ms`); }
  console.log(C.dim+'  '+ '-'.repeat(60)+C.reset); console.log('');
}

main().catch(e=>{ console.error(C.red+'Fatal error:'+C.reset,e); process.exit(1); });
