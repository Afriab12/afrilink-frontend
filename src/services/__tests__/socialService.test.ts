import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { socialService } from '../socialService.ts';
import { notificationService } from '../notificationService.ts';
import { apiClient, ApiError } from '../apiClient.ts';

describe('socialService - Social Graph, Networking & Notifications', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    apiClient.clearTokens();
    apiClient.setBaseURL('http://localhost:4000/api/v1');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('1. Friendship: prevents self-friending rejection with 400 error', async () => {
    const currentUserId = 'user-kwame';

    let thrownError: any = null;
    try {
      await socialService.sendFriendRequest(currentUserId, currentUserId);
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError instanceof ApiError);
    assert.equal(thrownError.code, 'INVALID_ACTION');
    assert.equal(thrownError.status, 400);
    assert.ok(thrownError.message.includes('yourself'));
  });

  it('2. Friendship: constructs proper POST /friendships request with addresseeId', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    let capturedBody: any = null;

    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      capturedUrl = url.toString();
      capturedMethod = options?.method || '';
      capturedBody = options?.body ? JSON.parse(options.body as string) : null;
      return {
        ok: true,
        status: 201,
        text: async () =>
          JSON.stringify({
            data: { id: 'fr-789', status: 'pending' },
            meta: null,
            error: null,
          }),
        clone: () => ({
          text: async () =>
            JSON.stringify({
              data: { id: 'fr-789', status: 'pending' },
              meta: null,
              error: null,
            }),
        }),
      } as any;
    }) as any;

    const result = await socialService.sendFriendRequest('user-amina', 'user-kwame');

    assert.equal(capturedUrl, 'http://localhost:4000/api/v1/friendships');
    assert.equal(capturedMethod, 'POST');
    assert.equal(capturedBody?.addresseeId, 'user-amina');
    assert.equal(result.success, true);
    assert.equal(result.friendshipId, 'fr-789');
  });

  it('3. Friendship: responds to friend request via PATCH /friendships/:id with status payload', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    let capturedBody: any = null;

    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      capturedUrl = url.toString();
      capturedMethod = options?.method || '';
      capturedBody = options?.body ? JSON.parse(options.body as string) : null;
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            data: { id: 'fr-789', status: 'accepted' },
            meta: null,
            error: null,
          }),
        clone: () => ({
          text: async () =>
            JSON.stringify({
              data: { id: 'fr-789', status: 'accepted' },
              meta: null,
              error: null,
            }),
        }),
      } as any;
    }) as any;

    const result = await socialService.respondToFriendRequest('fr-789', 'accepted');

    assert.equal(capturedUrl, 'http://localhost:4000/api/v1/friendships/fr-789');
    assert.equal(capturedMethod, 'PATCH');
    assert.equal(capturedBody?.status, 'accepted');
    assert.equal(result.success, true);
  });

  it('4. Follows: enforces follow rules and constructs POST /follows & DELETE /follows/:id', async () => {
    // Self-follow rejection
    await assert.rejects(
      async () => {
        await socialService.followUser('user-kwame', 'user-kwame');
      },
      (err: any) => {
        return err instanceof ApiError && err.code === 'INVALID_ACTION';
      }
    );

    let capturedUrl = '';
    let capturedMethod = '';
    let capturedBody: any = null;

    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      capturedUrl = url.toString();
      capturedMethod = options?.method || '';
      capturedBody = options?.body ? JSON.parse(options.body as string) : null;
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            data: { success: true },
            meta: null,
            error: null,
          }),
        clone: () => ({
          text: async () =>
            JSON.stringify({
              data: { success: true },
              meta: null,
              error: null,
            }),
        }),
      } as any;
    }) as any;

    // Follow action
    await socialService.followUser('creator-zainab', 'user-kwame');
    assert.equal(capturedUrl, 'http://localhost:4000/api/v1/follows');
    assert.equal(capturedMethod, 'POST');
    assert.equal(capturedBody?.followeeId, 'creator-zainab');

    // Unfollow action
    await socialService.unfollowUser('creator-zainab');
    assert.equal(capturedUrl, 'http://localhost:4000/api/v1/follows/creator-zainab');
    assert.equal(capturedMethod, 'DELETE');
  });

  it('5. User Search: formats query string accurately with q, countryId, and limit', () => {
    const qs1 = socialService.buildSearchQueryString({
      q: 'Kofi',
      countryId: 'gh',
      limit: 15,
    });

    assert.equal(qs1, '?q=Kofi&countryId=GH&limit=15');

    const qsEmpty = socialService.buildSearchQueryString({});
    assert.equal(qsEmpty, '');

    const qsOnlyQuery = socialService.buildSearchQueryString({ q: 'Fintech' });
    assert.equal(qsOnlyQuery, '?q=Fintech');
  });

  it('6. Notification Center: queries unread count and dispatches PATCH /notifications/read-all', async () => {
    let capturedUrl = '';
    let capturedMethod = '';

    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      capturedUrl = url.toString();
      capturedMethod = options?.method || 'GET';

      if (capturedUrl.includes('/unread-count')) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ data: { count: 4 }, meta: null, error: null }),
          clone: () => ({
            text: async () => JSON.stringify({ data: { count: 4 }, meta: null, error: null }),
          }),
        };
      }

      if (capturedUrl.includes('/read-all')) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ data: { success: true }, meta: null, error: null }),
          clone: () => ({
            text: async () => JSON.stringify({ data: { success: true }, meta: null, error: null }),
          }),
        };
      }

      return {
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }),
      };
    }) as any;

    const count = await notificationService.getUnreadCount();
    assert.equal(count, 4);

    await notificationService.markAllAsRead();
    assert.equal(capturedUrl, 'http://localhost:4000/api/v1/notifications/read-all');
    assert.equal(capturedMethod, 'PATCH');
  });
});
