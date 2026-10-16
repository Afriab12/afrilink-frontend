import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { apiClient, ApiError } from '../apiClient.ts';

describe('apiClient - Core API Client & Token Security', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    apiClient.clearTokens();
    apiClient.setBaseURL('http://localhost:4000/api/v1');
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('1. Success envelope parsing: safely unpacks { data, meta, error }', async () => {
    const mockUser = { id: 'usr-123', username: 'kwame_mensah', email: 'kwame@afrilink.africa' };
    const mockEnvelope = {
      data: mockUser,
      meta: { timestamp: 1718000000 },
      error: null,
    };

    let calledUrl = '';
    let calledOptions: any = null;

    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      calledUrl = url.toString();
      calledOptions = options;
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockEnvelope),
        clone: () => ({
          text: async () => JSON.stringify(mockEnvelope),
        }),
      } as any;
    }) as any;

    const result = await apiClient.get<typeof mockUser>('/users/me');

    assert.equal(calledUrl, 'http://localhost:4000/api/v1/users/me');
    assert.equal(calledOptions?.method, 'GET');
    assert.equal(calledOptions?.headers?.['Content-Type'], 'application/json');
    assert.deepEqual(result.data, mockUser);
    assert.equal(result.error, null);
  });

  it('2. Injects Authorization Bearer header when access token is present', async () => {
    apiClient.setAccessToken('sample-jwt-access-token');

    const mockEnvelope = {
      data: { success: true },
      meta: null,
      error: null,
    };

    let calledHeaders: any = null;

    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      calledHeaders = options?.headers;
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockEnvelope),
      } as any;
    }) as any;

    await apiClient.post('/posts', { content: 'Hello Africa' });

    assert.equal(calledHeaders?.Authorization, 'Bearer sample-jwt-access-token');
  });

  it('3. Normalizes 400 VALIDATION_ERROR with field details', async () => {
    const errorEnvelope = {
      data: null,
      meta: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed for registration input',
        details: [
          { field: 'email', message: 'Email already registered' },
          { field: 'password', message: 'Password must be at least 10 characters' },
        ],
      },
    };

    global.fetch = (async () => {
      return {
        ok: false,
        status: 400,
        text: async () => JSON.stringify(errorEnvelope),
        clone: () => ({
          text: async () => JSON.stringify(errorEnvelope),
        }),
      } as any;
    }) as any;

    let thrownError: any = null;
    try {
      await apiClient.post('/auth/register', {});
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError instanceof ApiError);
    assert.equal(thrownError.code, 'VALIDATION_ERROR');
    assert.equal(thrownError.status, 400);
    assert.equal(thrownError.details?.length, 2);
    assert.equal(thrownError.details?.[0].field, 'email');
  });

  it('4. Normalizes 401 INVALID_CREDENTIALS on failed login', async () => {
    const errorEnvelope = {
      data: null,
      meta: null,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    };

    global.fetch = (async () => {
      return {
        ok: false,
        status: 401,
        text: async () => JSON.stringify(errorEnvelope),
        clone: () => ({
          text: async () => JSON.stringify(errorEnvelope),
        }),
      } as any;
    }) as any;

    let thrownError: any = null;
    try {
      await apiClient.post('/auth/login', { email: 'wrong@afrilink.africa', password: 'bad' });
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError instanceof ApiError);
    assert.equal(thrownError.code, 'INVALID_CREDENTIALS');
    assert.equal(thrownError.status, 401);
  });

  it('5. 401 Refresh Queue Mutex: silently refreshes token and retries original request', async () => {
    apiClient.setAccessToken('expired-access-token');
    apiClient.setRefreshToken('valid-refresh-token');

    let callCount = 0;

    global.fetch = (async (url: string | URL) => {
      const urlStr = url.toString();

      // 1st call: Original request receives 401 TOKEN_EXPIRED
      if (urlStr.includes('/posts/feed') && callCount === 0) {
        callCount++;
        return {
          ok: false,
          status: 401,
          text: async () =>
            JSON.stringify({
              data: null,
              meta: null,
              error: { code: 'TOKEN_EXPIRED', message: 'JWT token has expired' },
            }),
          clone: () => ({
            text: async () =>
              JSON.stringify({
                data: null,
                meta: null,
                error: { code: 'TOKEN_EXPIRED', message: 'JWT token has expired' },
              }),
          }),
        };
      }

      // 2nd call: The interceptor triggers /auth/refresh
      if (urlStr.includes('/auth/refresh')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: { accessToken: 'fresh-new-access-token', refreshToken: 'fresh-refresh-token' },
            meta: null,
            error: null,
          }),
          text: async () =>
            JSON.stringify({
              data: { accessToken: 'fresh-new-access-token', refreshToken: 'fresh-refresh-token' },
              meta: null,
              error: null,
            }),
        };
      }

      // 3rd call: Replay of original request with fresh token
      if (urlStr.includes('/posts/feed') && callCount >= 1) {
        return {
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              data: [{ id: 'post-1', content: 'Connected Africa' }],
              meta: null,
              error: null,
            }),
          clone: () => ({
            text: async () =>
              JSON.stringify({
                data: [{ id: 'post-1', content: 'Connected Africa' }],
                meta: null,
                error: null,
              }),
          }),
        };
      }

      return {
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }),
      };
    }) as any;

    const result = await apiClient.get<Array<{ id: string; content: string }>>('/posts/feed');

    assert.deepEqual(result.data, [{ id: 'post-1', content: 'Connected Africa' }]);
    assert.equal(apiClient.getAccessToken(), 'fresh-new-access-token');
    assert.equal(apiClient.getRefreshToken(), 'fresh-refresh-token');
  });
});
