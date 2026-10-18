import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  apiClient,
  ApiClient,
  parseEnvelope,
  createNetworkErrorEnvelope,
} from '../api-client.ts';
import type { ApiResponse } from '../api-client.ts';
import { messagingService } from '../../services/messagingService.ts';

describe('API Client Envelope & Real-Time Gateway Wiring', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    apiClient.clearTokens();
    apiClient.setBaseURL('http://localhost:4000/api/v1');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 1: Envelope parsing for 200 OK success payload
  // ══════════════════════════════════════════════════════════════════════════
  it('Test 1: Envelope parsing for 200 OK success payload adheres strictly to { data, meta, error }', async () => {
    const mockData = {
      id: 'post-accra-456',
      title: 'Pan-African Trade Initiative',
      author: 'Kwame Mensah',
    };
    const mockMeta = {
      page: 1,
      totalCount: 42,
      serverTime: '2026-10-18T16:00:00Z',
    };

    const serverEnvelope = {
      data: mockData,
      meta: mockMeta,
      error: null,
    };

    let requestedUrl = '';
    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      requestedUrl = url.toString();
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => JSON.stringify(serverEnvelope),
      } as any;
    }) as any;

    const response = await apiClient.get<typeof mockData>('/posts/accra-456');

    // Verify requested URL
    assert.equal(requestedUrl, 'http://localhost:4000/api/v1/posts/accra-456');

    // Strict Envelope Shape Assertions
    assert.equal(typeof response, 'object');
    assert.ok('data' in response, 'Response must have data property');
    assert.ok('meta' in response, 'Response must have meta property');
    assert.ok('error' in response, 'Response must have error property');

    assert.deepEqual(response.data, mockData);
    assert.deepEqual(response.meta, mockMeta);
    assert.equal(response.error, null);

    // Also verify parseEnvelope handles unenveloped raw success objects
    const rawParsed = parseEnvelope(mockData, 200, 'OK');
    assert.deepEqual(rawParsed.data, mockData);
    assert.equal(rawParsed.meta, null);
    assert.equal(rawParsed.error, null);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 2: Envelope parsing for 400/422 API error payload
  // ══════════════════════════════════════════════════════════════════════════
  it('Test 2: Envelope parsing for 400/422 API error payload normalizes validation errors', async () => {
    // 2A: Standard 422 Unprocessable Entity with details array
    const error422Body = {
      data: null,
      meta: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid country code format',
        details: [
          { field: 'countryCode', message: 'Country code must be 2 uppercase ISO letters' },
        ],
      },
    };

    global.fetch = (async () => {
      return {
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        text: async () => JSON.stringify(error422Body),
        clone: () => ({
          text: async () => JSON.stringify(error422Body),
        }),
      } as any;
    }) as any;

    const response422 = await apiClient.post('/countries/validate', { countryCode: 'invalid' });

    assert.equal(response422.data, null);
    assert.equal(response422.meta, null);
    assert.ok(response422.error !== null);
    assert.equal(response422.error?.code, 'VALIDATION_ERROR');
    assert.equal(response422.error?.message, 'Invalid country code format');
    assert.equal(response422.error?.details?.[0].field, 'countryCode');

    // 2B: Raw NestJS standard validation exception { statusCode: 400, message: ['email must be an email'] }
    const nestJsError = {
      statusCode: 400,
      message: ['email must be an email', 'password is too short'],
      error: 'Bad Request',
    };

    const parsedNest = parseEnvelope(nestJsError, 400, 'Bad Request');
    assert.equal(parsedNest.data, null);
    assert.equal(parsedNest.meta, null);
    assert.equal(parsedNest.error?.code, 'BAD_REQUEST');
    assert.match(parsedNest.error?.message || '', /email must be an email/);
    assert.equal(parsedNest.error?.details?.length, 2);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 3: JWT bearer token header injection
  // ══════════════════════════════════════════════════════════════════════════
  it('Test 3: Injects Authorization Bearer header when JWT access token is present', async () => {
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-payload';
    apiClient.setAccessToken(testToken);

    let capturedHeaders: Record<string, string> | undefined;

    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      capturedHeaders = options?.headers as Record<string, string>;
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => JSON.stringify({ data: { success: true }, meta: null, error: null }),
      } as any;
    }) as any;

    await apiClient.get('/users/me');

    assert.ok(capturedHeaders, 'Headers must be provided');
    assert.equal(
      capturedHeaders?.['Authorization'],
      `Bearer ${testToken}`,
      'Authorization header must match Bearer token'
    );

    // Verify clearing token removes the header
    apiClient.clearTokens();
    await apiClient.get('/public/metrics');
    assert.equal(
      capturedHeaders?.['Authorization'],
      undefined,
      'Authorization header must not be set after clearTokens'
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 4: Offline network error fallback to error envelope
  // ══════════════════════════════════════════════════════════════════════════
  it('Test 4: Offline network error fallback returns standardized NETWORK_ERROR envelope without throwing unhandled exceptions', async () => {
    // Simulate complete network disconnection / DNS failure
    global.fetch = (async () => {
      throw new TypeError('Failed to fetch');
    }) as any;

    // Must not throw an unhandled exception
    let response: ApiResponse<any> | null = null;
    let errorThrown: any = null;

    try {
      response = await apiClient.get('/posts/feed');
    } catch (err) {
      errorThrown = err;
    }

    assert.equal(errorThrown, null, 'Safe API client must not throw unhandled exception on network failure');
    assert.ok(response !== null, 'Response envelope must be returned');
    assert.equal(response?.data, null, 'Data must be null on network error');
    assert.equal(response?.meta, null, 'Meta must be null on network error');
    assert.equal(response?.error?.code, 'NETWORK_ERROR');
    assert.match(
      response?.error?.message || '',
      /Unable to connect to the AfriLink server|Failed to fetch/i
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 5: WebSocket backoff sequence & environment URL configuration
  // ══════════════════════════════════════════════════════════════════════════
  it('Test 5: WebSocket exponential backoff strictly implements 1s, 2s, 4s, 8s, max 10s', () => {
    assert.equal(messagingService.calculateBackoff(1), 1000, 'Attempt 1 must be 1000ms (1s)');
    assert.equal(messagingService.calculateBackoff(2), 2000, 'Attempt 2 must be 2000ms (2s)');
    assert.equal(messagingService.calculateBackoff(3), 4000, 'Attempt 3 must be 4000ms (4s)');
    assert.equal(messagingService.calculateBackoff(4), 8000, 'Attempt 4 must be 8000ms (8s)');
    assert.equal(messagingService.calculateBackoff(5), 10000, 'Attempt 5 must be capped at 10000ms (10s)');
    assert.equal(messagingService.calculateBackoff(10), 10000, 'Attempt 10 must be capped at 10000ms (10s)');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 6: WebSocket event dispatching for message:received, presence:updated, typing:status
  // ══════════════════════════════════════════════════════════════════════════
  it('Test 6: WebSocket gateway cleanly dispatches message:received, presence:updated, typing:status', () => {
    let receivedMessage: any = null;
    let updatedPresence: any = null;
    let receivedTyping: any = null;

    const onMessage = (data: any) => { receivedMessage = data; };
    const onPresence = (data: any) => { updatedPresence = data; };
    const onTyping = (data: any) => { receivedTyping = data; };

    messagingService.on('message:received', onMessage);
    messagingService.on('presence:updated', onPresence);
    messagingService.on('typing:status', onTyping);

    // Emit simulated gateway events
    (messagingService as any).emitLocal('message:received', { id: 'msg-999', content: 'Habari Africa!' });
    (messagingService as any).emitLocal('presence:updated', { userId: 'user-amina', isOnline: true });
    (messagingService as any).emitLocal('typing:status', { conversationId: 'conv-1', isTyping: true });

    assert.equal(receivedMessage?.id, 'msg-999');
    assert.equal(receivedMessage?.content, 'Habari Africa!');
    assert.equal(updatedPresence?.userId, 'user-amina');
    assert.equal(updatedPresence?.isOnline, true);
    assert.equal(receivedTyping?.conversationId, 'conv-1');
    assert.equal(receivedTyping?.isTyping, true);

    // Cleanup
    messagingService.off('message:received', onMessage);
    messagingService.off('presence:updated', onPresence);
    messagingService.off('typing:status', onTyping);
  });
});
