import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

async function proxy(req, backendPath) {
  const token = req.headers.get('authorization') || '';
  const url = `${BACKEND}${backendPath}${req.nextUrl.search}`;
  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;
  const res = await fetch(url, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
      Cookie: req.headers.get('cookie') || '',
    },
    body,
    credentials: 'include',
  });
  const data = await res.text();
  const headers = new Headers();
  const ct = res.headers.get('content-type');
  if (ct) headers.set('content-type', ct);
  const sc = res.headers.get('set-cookie');
  if (sc) headers.set('set-cookie', sc);
  return new NextResponse(data, { status: res.status, headers });
}

export { proxy, BACKEND };
