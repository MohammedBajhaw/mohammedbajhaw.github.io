import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, before } from 'node:test';

function readLocalEnv(): Record<string, string> {
  const envPath = resolve(process.cwd(), '.env');
  const map: Record<string, string> = {};
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        map[key] = val;
      }
    }
  } catch {
    // Fallback to process.env if .env is absent
  }
  return map;
}

const localEnv = readLocalEnv();
const BASE_URL = process.env.API_BASE_URL ?? `http://localhost:${localEnv.PORT ?? '4000'}/api`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? localEnv.ADMIN_EMAIL ?? 'mohammedbajhaw2020@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? localEnv.ADMIN_PASSWORD ?? 'Admin@2026!LocalDev';

interface ApiEnvelope<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    statusCode: number;
    message: string;
    details?: unknown;
  };
}

async function requestJson<T = Record<string, unknown>>(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; body: ApiEnvelope<T>; headers: Headers }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = (await res.json()) as ApiEnvelope<T>;
  return { status: res.status, body, headers: res.headers };
}

describe('Backend API (Integration)', () => {
  before(async () => {
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${BASE_URL}/health`);
        if (res.ok) {
          return;
        }
      } catch {
        // Server still starting
      }
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
    }
    throw new Error(`Server at ${BASE_URL} did not become ready within 15s.`);
  });

  it('GET /api/health returns connected database status', async () => {
    const { status, body } = await requestJson<{
      status: string;
      service: string;
      database: string;
    }>('/health');

    assert.equal(status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data?.status, 'ok');
    assert.equal(body.data?.database, 'connected');
  });

  it('GET /api/translation/languages returns enabled languages publicly', async () => {
    const { status, body } = await requestJson<Array<{ code: string; enabled: boolean }>>(
      '/translation/languages',
    );
    assert.equal(status, 200);
    assert.equal(body.success, true);
    const codes = (body.data ?? []).map((lang) => lang.code);
    assert.ok(codes.includes('ar'));
    assert.ok(codes.includes('en'));
    assert.ok(codes.includes('tr'));
  });

  it('GET /api/settings and /api/settings/maintenance return platform settings publicly', async () => {
    const settingsRes = await requestJson<{
      siteName: string;
      maintenance: { enabled: boolean };
    }>('/settings');
    assert.equal(settingsRes.status, 200);
    assert.equal(settingsRes.body.success, true);
    assert.ok(typeof settingsRes.body.data?.siteName === 'string');

    const maintRes = await requestJson<{ enabled: boolean; title: string }>(
      '/settings/maintenance',
    );
    assert.equal(maintRes.status, 200);
    assert.equal(typeof maintRes.body.data?.enabled, 'boolean');

    const unauthToggle = await requestJson('/settings/maintenance', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: true }),
    });
    assert.equal(unauthToggle.status, 401);
  });

  it('rejects unauthenticated access to /api/auth/me with 401 UNAUTHORIZED', async () => {
    const { status, body } = await requestJson('/auth/me');
    assert.equal(status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error?.code, 'UNAUTHORIZED');
  });

  it('blocks NoSQL injection payloads before reaching controllers', async () => {
    const { status, body } = await requestJson('/profile/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Tester',
        email: { $ne: '' },
        message: 'Testing security filter',
      }),
    });
    assert.equal(status, 400);
    assert.equal(body.success, false);
    assert.equal(body.error?.code, 'BAD_REQUEST');
  });

  it('returns 404 RESOURCE_NOT_FOUND cleanly for unknown routes', async () => {
    const { status, body } = await requestJson('/non-existent-route-check');
    assert.equal(status, 404);
    assert.equal(body.success, false);
    assert.equal(body.error?.code, 'RESOURCE_NOT_FOUND');
  });

  it('authenticates owner, accesses protected endpoints, and revokes token on logout', async () => {
    const badLogin = await requestJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: ADMIN_EMAIL, password: 'wrong-password-123' }),
    });
    assert.equal(badLogin.status, 401);
    assert.equal(badLogin.body.error?.code, 'UNAUTHORIZED');

    const loginRes = await requestJson<{
      accessToken: string;
      user: { email: string; role: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.success, true);
    const token = loginRes.body.data?.accessToken;
    assert.ok(typeof token === 'string' && token.length > 20);
    assert.ok(loginRes.headers.get('set-cookie')?.includes('HttpOnly'));

    const authHeaders = { Authorization: `Bearer ${token}` };

    const meRes = await requestJson<{ email: string; authenticated: boolean }>('/auth/me', {
      headers: authHeaders,
    });
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.data?.authenticated, true);

    const settingsRes = await requestJson<{ supportedLanguages: unknown[] }>(
      '/translation/settings',
      { headers: authHeaders },
    );
    assert.equal(settingsRes.status, 200);
    assert.ok(Array.isArray(settingsRes.body.data?.supportedLanguages));

    const logoutRes = await requestJson<{ loggedOut: boolean }>('/auth/logout', {
      method: 'POST',
      headers: authHeaders,
    });
    assert.equal(logoutRes.status, 200);
    assert.equal(logoutRes.body.data?.loggedOut, true);

    const afterLogoutMe = await requestJson('/auth/me', {
      headers: authHeaders,
    });
    assert.equal(afterLogoutMe.status, 401);
    assert.equal(afterLogoutMe.body.error?.code, 'UNAUTHORIZED');
  });
});
