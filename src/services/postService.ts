/**
 * AfriLink Post, Feed, Reaction & Comment Service
 * Implements Phase 2 Backend API Specification for:
 * - Post CRUD & Feed Aggregation (/api/v1/posts, /api/v1/feed)
 * - 6-Emotion African Reactions (/api/v1/reactions)
 * - 1-Tier Nested Comments (/api/v1/comments)
 */

import { apiClient, ApiError } from './apiClient.ts';
import type {
  Post,
  Comment,
  ReactionType,
  ReactionCount,
  PostVisibility,
  PostMedia,
} from '../types/index.ts';
import { mockBackend } from './mockBackend.ts';

export interface CreatePostPayload {
  content: string;
  visibility?: PostVisibility;
  mediaAssetIds?: string[];
  media?: Array<{ type: 'image' | 'video'; url: string; caption?: string }>;
  communityId?: string;
}

export interface FeedQueryParams {
  cursor?: string;
  limit?: number;
  filter?: 'all' | 'friends' | 'communities' | 'media';
}

export const VALID_REACTIONS: ReactionType[] = [
  'like',
  'love',
  'funny',
  'support',
  'sad',
  'angry',
];

export class PostService {
  // --- Post Creation & Management ---

  /**
   * Validates and creates a new post.
   * Rules:
   * - Content is required unless media is provided.
   * - Content cannot exceed 5000 characters.
   */
  public async createPost(payload: CreatePostPayload): Promise<Post> {
    const trimmedContent = (payload.content || '').trim();
    const hasMedia =
      (payload.mediaAssetIds && payload.mediaAssetIds.length > 0) ||
      (payload.media && payload.media.length > 0);

    if (!trimmedContent && !hasMedia) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Post must contain either text content or at least one media asset.',
        400
      );
    }

    if (trimmedContent.length > 5000) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Post content cannot exceed 5000 characters. Current length: ${trimmedContent.length}`,
        400
      );
    }

    try {
      const res = await apiClient.post<Post>('/posts', {
        content: trimmedContent,
        visibility: payload.visibility || 'public',
        mediaAssetIds: payload.mediaAssetIds,
        communityId: payload.communityId,
      });

      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    // Local fallback
    return mockBackend.createPost({
      content: trimmedContent,
      visibility: payload.visibility || 'public',
      media: payload.media,
      communityId: payload.communityId,
    });
  }

  /**
   * Fetches the home feed with cursor pagination.
   * Endpoint: GET /api/v1/feed?cursor=...&limit=...&filter=...
   */
  public async getFeed(
    params?: FeedQueryParams
  ): Promise<{ posts: Post[]; nextCursor?: string | null; hasMore: boolean }> {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.filter) query.set('filter', params.filter);

    const qs = query.toString() ? `?${query.toString()}` : '';

    try {
      const res = await apiClient.get<Post[]>(`/feed${qs}`);
      if (res.data && Array.isArray(res.data)) {
        return {
          posts: res.data,
          nextCursor: res.meta?.nextCursor || null,
          hasMore: !!res.meta?.hasMore,
        };
      }
    } catch {
      // Local fallback
    }

    const { posts, nextCursor, hasMore } = mockBackend.getPosts(
      params?.cursor,
      params?.limit || 10
    );

    return { posts, nextCursor, hasMore };
  }

  /**
   * Deletes a post by ID.
   * Endpoint: DELETE /api/v1/posts/:id
   */
  public async deletePost(postId: string): Promise<void> {
    try {
      await apiClient.delete(`/posts/${encodeURIComponent(postId)}`);
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }
    mockBackend.deletePost(postId);
  }

  // --- 6 African Reactions ---

  /**
   * Adds or updates a reaction on a post or comment.
   * Supported: 'like' | 'love' | 'funny' | 'support' | 'sad' | 'angry'
   * Endpoint: PUT /api/v1/reactions
   */
  public async react(
    targetType: 'post' | 'comment',
    targetId: string,
    reactionType: ReactionType
  ): Promise<ReactionCount | null> {
    if (!VALID_REACTIONS.includes(reactionType)) {
      throw new ApiError(
        'INVALID_REACTION',
        `Invalid reaction type "${reactionType}". Allowed: ${VALID_REACTIONS.join(', ')}`,
        400
      );
    }

    try {
      const res = await apiClient.put<{ reactionsCount: ReactionCount }>('/reactions', {
        targetType,
        targetId,
        reactionType,
      });

      if (res.data?.reactionsCount) {
        return res.data.reactionsCount;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    if (targetType === 'post') {
      const updated = mockBackend.reactToPost(targetId, reactionType);
      return updated?.reactionsCount || null;
    }

    return null;
  }

  /**
   * Removes an existing reaction.
   * Endpoint: DELETE /api/v1/reactions?targetType=...&targetId=...
   */
  public async removeReaction(
    targetType: 'post' | 'comment',
    targetId: string
  ): Promise<void> {
    const qs = `?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`;
    try {
      await apiClient.delete(`/reactions${qs}`);
    } catch {
      // Local fallback
    }
  }

  // --- 1-Tier Nested Comments ---

  /**
   * Retrieves comments for a post.
   * Endpoint: GET /api/v1/posts/:postId/comments
   */
  public async getComments(postId: string): Promise<Comment[]> {
    try {
      const res = await apiClient.get<Comment[]>(
        `/posts/${encodeURIComponent(postId)}/comments`
      );
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      // Local fallback
    }

    return mockBackend.getComments(postId);
  }

  /**
   * Posts a top-level comment on a post.
   * Endpoint: POST /api/v1/posts/:postId/comments
   */
  public async createComment(postId: string, content: string): Promise<Comment> {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new ApiError('VALIDATION_ERROR', 'Comment content cannot be empty.', 400);
    }

    try {
      const res = await apiClient.post<Comment>(
        `/posts/${encodeURIComponent(postId)}/comments`,
        { content: trimmed }
      );
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    return mockBackend.createComment(postId, trimmed);
  }

  /**
   * Posts a 1-tier reply to an existing comment.
   * STRICT RULE: Comment nesting is 1 level only.
   * If parentComment is itself already a reply (has parentId), throws 422 NESTED_REPLY_NOT_ALLOWED.
   * Endpoint: POST /api/v1/comments/:id/replies
   */
  public async createReply(
    commentId: string,
    content: string,
    parentComment?: { parentId?: string | null; postId?: string }
  ): Promise<Comment> {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new ApiError('VALIDATION_ERROR', 'Reply content cannot be empty.', 400);
    }

    // Strict 1-Level Depth Enforcement Guard
    if (parentComment?.parentId) {
      throw new ApiError(
        'NESTED_REPLY_NOT_ALLOWED',
        'Replies are limited to 1 level only. You cannot reply to a reply.',
        422
      );
    }

    try {
      const res = await apiClient.post<Comment>(
        `/comments/${encodeURIComponent(commentId)}/replies`,
        { content: trimmed }
      );
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const postId = parentComment?.postId || '';
    return mockBackend.createComment(postId, trimmed, commentId);
  }
}

export const postService = new PostService();
