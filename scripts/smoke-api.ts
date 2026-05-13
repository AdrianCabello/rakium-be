import { readFileSync } from 'fs';
import { basename } from 'path';

type JsonRecord = Record<string, any>;

const apiUrl = normalizeApiUrl(process.env.SMOKE_API_URL ?? 'http://localhost:3000/api');
const adminEmail = process.env.SMOKE_ADMIN_EMAIL ?? 'admin@rakium.com';
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD ?? 'admin123';
const clientId = process.env.SMOKE_CLIENT_ID ?? '98280818-e80a-4305-a887-a74a3a6c2ecb';
const projectId = process.env.SMOKE_PROJECT_ID ?? '8381ce2d-084d-44e4-a2c0-9ca2d951a12a';
const uploadFilePath = process.env.SMOKE_UPLOAD_FILE;

async function main() {
  console.log(`Smoke API target: ${apiUrl}`);

  await check('health swagger route responds', async () => {
    const response = await request('/');
    expectStatus(response, [200]);
  });

  const login = await check<JsonRecord>('admin login returns JWT', async () => {
    const response = await request('/auth/login', {
      method: 'POST',
      json: { email: adminEmail, password: adminPassword },
    });
    expectStatus(response, [200, 201]);
    const body = await readJson(response);
    assert(body.access_token, 'Missing access_token in login response');
    assert(body.user?.email === adminEmail, 'Login response user email does not match');
    return body;
  });

  const token = login.access_token as string;

  await check('auth/me rejects anonymous requests', async () => {
    const response = await request('/auth/me');
    expectStatus(response, [401]);
  });

  await check('auth/me accepts bearer token', async () => {
    const response = await request('/auth/me', { token });
    expectStatus(response, [200]);
  });

  await check('private projects list rejects anonymous requests', async () => {
    const response = await request('/projects');
    expectStatus(response, [401]);
  });

  await check('private projects list accepts bearer token', async () => {
    const response = await request('/projects', { token });
    expectStatus(response, [200]);
  });

  await check('public client projects remain public', async () => {
    const response = await request(`/projects/client/${clientId}/public`);
    expectStatus(response, [200]);
  });

  await check('published project route remains public', async () => {
    const response = await request(`/projects/${projectId}/published`);
    expectStatus(response, [200]);
  });

  await check('upload/file rejects anonymous requests', async () => {
    const form = new FormData();
    form.append('folder', 'smoke');
    const response = await request('/upload/file', {
      method: 'POST',
      body: form,
    });
    expectStatus(response, [401]);
  });

  if (uploadFilePath) {
    await check('authenticated upload/file accepts image file', async () => {
      const file = readFileSync(uploadFilePath);
      const form = new FormData();
      form.append('folder', 'smoke');
      form.append('optimize', 'false');
      form.append(
        'file',
        new Blob([new Uint8Array(file)], { type: contentTypeFor(uploadFilePath) }),
        basename(uploadFilePath),
      );

      const response = await request('/upload/file', {
        method: 'POST',
        token,
        body: form,
      });
      expectStatus(response, [200, 201]);
      const text = await response.text();
      assert(text.length > 0, 'Upload response was empty');
    });
  } else {
    console.log('SKIP authenticated upload/file accepts image file (set SMOKE_UPLOAD_FILE to enable)');
  }
}

async function check<T>(name: string, fn: () => Promise<T>): Promise<T> {
  process.stdout.write(`- ${name}... `);
  try {
    const result = await fn();
    console.log('ok');
    return result;
  } catch (error) {
    console.log('failed');
    throw error;
  }
}

async function request(
  path: string,
  options: { method?: string; token?: string; json?: JsonRecord; body?: BodyInit } = {},
) {
  const headers = new Headers();
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }
  if (options.json) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${apiUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.json ? JSON.stringify(options.json) : options.body,
  });
}

async function readJson(response: Response): Promise<JsonRecord> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON response, got: ${text.slice(0, 300)}`);
  }
}

function expectStatus(response: Response, statuses: number[]) {
  assert(
    statuses.includes(response.status),
    `Expected status ${statuses.join(' or ')}, got ${response.status} ${response.statusText}`,
  );
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeApiUrl(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function contentTypeFor(filePath: string) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
