import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { postService, VALID_REACTIONS } from '../postService.ts';
import { apiClient, ApiError } from '../apiClient.ts';

describe('postService - Content Engine, Feed, Reactions & 1-Tier Comments', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    apiClient.clearTokens();
    apiClient.setBaseURL('http://localhost:4000/api/v1');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('1. Post Validation: rejects empty post when both content and media are missing', async () => {
    let thrownError: any = null;
    try {
      await postService.createPost({ content: '   ' });
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError instanceof ApiError);
    assert.equal(thrownError.code, 'VALIDATION_ERROR');
    assert.equal(thrownError.status, 400);
    assert.ok(thrownError.message.includes('either text content or at least one media asset'));
  });

  it('2. Post Validation: rejects post body exceeding 5000 characters limit', async () => {
    const hugeContent = 'A'.repeat(5001);

    let thrownError: any = null;
    try {
      await postService.createPost({ content: hugeContent });
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError instanceof ApiError);
    assert.equal(thrownError.code, 'VALIDATION_ERROR');
    assert.equal(thrownError.status, 400);
    assert.ok(thrownError.message.includes('cannot exceed 5000 characters'));
  });

  it('3. Post Creation: constructs proper POST /posts payload with content, visibility and mediaAssetIds', async () => {
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
            data: {
              id: 'post-new-1',
              content: 'Connecting African entrepreneurs across borders',
              visibility: 'public',
            },
            meta: null,
            error: null,
          }),
        clone: () => ({
          text: async () =>
            JSON.stringify({
              data: {
                id: 'post-new-1',
                content: 'Connecting African entrepreneurs across borders',
                visibility: 'public',
              },
              meta: null,
              error: null,
            }),
        }),
      } as any;
    }) as any;

    const newPost = await postService.createPost({
      content: 'Connecting African entrepreneurs across borders',
      visibility: 'public',
      mediaAssetIds: ['asset-img-1', 'asset-img-2'],
      communityId: 'comm-tech',
    });

    assert.equal(capturedUrl, 'http://localhost:4000/api/v1/posts');
    assert.equal(capturedMethod, 'POST');
    assert.equal(capturedBody?.content, 'Connecting African entrepreneurs across borders');
    assert.equal(capturedBody?.visibility, 'public');
    assert.deepEqual(capturedBody?.mediaAssetIds, ['asset-img-1', 'asset-img-2']);
    assert.equal(capturedBody?.communityId, 'comm-tech');
    assert.equal(newPost.id, 'post-new-1');
  });

  it('4. Reactions: supports all 6 African reactions and rejects invalid reaction type', async () => {
    assert.deepEqual(VALID_REACTIONS, ['like', 'love', 'funny', 'support', 'sad', 'angry']);

    // Invalid reaction rejected
    let thrownError: any = null;
    try {
      await postService.react('post', 'post-1', 'dislike' as any);
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError instanceof ApiError);
    assert.equal(thrownError.code, 'INVALID_REACTION');
    assert.equal(thrownError.status, 400);

    // Valid reaction payload construction
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
            data: {
              reactionsCount: { like: 10, love: 5, funny: 2, support: 8, sad: 0, angry: 0 },
            },
            meta: null,
            error: null,
          }),
        clone: () => ({
          text: async () =>
            JSON.stringify({
              data: {
                reactionsCount: { like: 10, love: 5, funny: 2, support: 8, sad: 0, angry: 0 },
              },
              meta: null,
              error: null,
            }),
        }),
      } as any;
    }) as any;

    const count = await postService.react('post', 'post-1', 'support');
    assert.equal(capturedUrl, 'http://localhost:4000/api/v1/reactions');
    assert.equal(capturedMethod, 'PUT');
    assert.equal(capturedBody?.targetType, 'post');
    assert.equal(capturedBody?.targetId, 'post-1');
    assert.equal(capturedBody?.reactionType, 'support');
    assert.equal(count?.support, 8);
  });

  it('5. 1-Tier Comment System: permits top-level comment and 1-level reply', async () => {
    let capturedPostUrl = '';
    let capturedReplyUrl = '';

    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      const urlStr = url.toString();
      if (urlStr.includes('/posts/post-1/comments')) {
        capturedPostUrl = urlStr;
        return {
          ok: true,
          status: 201,
          text: async () =>
            JSON.stringify({
              data: { id: 'comment-root-1', content: 'Incredible innovation!', parentId: null },
              meta: null,
              error: null,
            }),
          clone: () => ({
            text: async () =>
              JSON.stringify({
                data: { id: 'comment-root-1', content: 'Incredible innovation!', parentId: null },
                meta: null,
                error: null,
              }),
          }),
        };
      }

      if (urlStr.includes('/comments/comment-root-1/replies')) {
        capturedReplyUrl = urlStr;
        return {
          ok: true,
          status: 201,
          text: async () =>
            JSON.stringify({
              data: { id: 'reply-1', content: 'Agreed completely.', parentId: 'comment-root-1' },
              meta: null,
              error: null,
            }),
          clone: () => ({
            text: async () =>
              JSON.stringify({
                data: { id: 'reply-1', content: 'Agreed completely.', parentId: 'comment-root-1' },
                meta: null,
                error: null,
              }),
          }),
        };
      }

      return { ok: false, status: 404, text: async () => '' };
    }) as any;

    // Top-level comment
    const rootComment = await postService.createComment('post-1', 'Incredible innovation!');
    assert.ok(capturedPostUrl.includes('/posts/post-1/comments'));
    assert.equal(rootComment.id, 'comment-root-1');

    // 1-Level reply to top-level comment
    const reply = await postService.createReply('comment-root-1', 'Agreed completely.', {
      parentId: null,
      postId: 'post-1',
    });
    assert.ok(capturedReplyUrl.includes('/comments/comment-root-1/replies'));
    assert.equal(reply.id, 'reply-1');
  });

  it('6. Strict Depth Guard: rejects attempt to reply to an existing reply with 422 error', async () => {
    // parentComment already has a parentId, meaning it is a nested reply
    const existingReply = {
      parentId: 'comment-root-1', // Already a reply!
      postId: 'post-1',
    };

    let thrownError: any = null;
    try {
      await postService.createReply('reply-1', 'Attempting 2nd level reply', existingReply);
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError instanceof ApiError);
    assert.equal(thrownError.code, 'NESTED_REPLY_NOT_ALLOWED');
    assert.equal(thrownError.status, 422);
    assert.ok(thrownError.message.includes('limited to 1 level only'));
  });
});
