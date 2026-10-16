/**
 * AfriLink African Communities & Groups Service
 * Implements Phase 2 Backend API Specification for:
 * - Community Discovery & Taxonomy (/api/v1/communities)
 * - Public & Private Hub Creation & Management (/api/v1/communities)
 * - Membership Lifecycle (Join/Leave/Role assignment)
 * - Community Members & Role-Based Access Control
 * - Dedicated Community Post Feeds (/api/v1/communities/:id/posts)
 */

import { apiClient, ApiError } from './apiClient.ts';
import type {
  Community,
  CommunityMember,
  CommunityRole,
  CreateCommunityInput,
  Post,
  PaginatedResult,
} from '../types/index.ts';
import { mockBackend, INITIAL_USERS } from './mockBackend.ts';

export interface CommunityQueryParams {
  category?: string;
  country?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export class CommunityService {
  /**
   * Helper to generate a URL-safe slug from a community name.
   */
  public generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // remove invalid characters
      .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores to dashes
      .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
  }

  /**
   * Validates community creation input according to backend specifications:
   * - Name: 3 to 80 chars
   * - Description: 10 to 1000 chars
   * - Category: required non-empty
   * - Rules: at least 1 rule required
   */
  public validateCommunityInput(input: CreateCommunityInput): void {
    const trimmedName = (input.name || '').trim();
    if (!trimmedName || trimmedName.length < 3 || trimmedName.length > 80) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Community name must be between 3 and 80 characters. Received ${trimmedName.length}.`,
        400
      );
    }

    const trimmedDesc = (input.description || '').trim();
    if (!trimmedDesc || trimmedDesc.length < 10 || trimmedDesc.length > 1000) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Community description must be between 10 and 1000 characters. Received ${trimmedDesc.length}.`,
        400
      );
    }

    if (!input.category || !input.category.trim()) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'A valid African vertical category is required.',
        400
      );
    }

    if (!input.rules || input.rules.length === 0 || !input.rules.some((r) => r.trim().length > 0)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'At least one community rule or conduct guideline must be specified.',
        400
      );
    }
  }

  /**
   * Fetch all communities with optional category, country, or keyword search.
   */
  public async getCommunities(
    params: CommunityQueryParams = {}
  ): Promise<PaginatedResult<Community>> {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'All') {
      searchParams.set('category', params.category);
    }
    if (params.country && params.country !== 'Pan-African') {
      searchParams.set('country', params.country);
    }
    if (params.search) {
      searchParams.set('search', params.search);
    }
    if (params.cursor) {
      searchParams.set('cursor', params.cursor);
    }
    if (params.limit) {
      searchParams.set('limit', params.limit.toString());
    }
    const qs = searchParams.toString();
    const endpoint = `/communities${qs ? `?${qs}` : ''}`;

    try {
      const res = await apiClient.get<PaginatedResult<Community>>(endpoint);

      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    // Local fallback
    let all = mockBackend.getCommunities();

    if (params.category && params.category !== 'All') {
      all = all.filter(
        (c) => c.category.toLowerCase() === params.category!.toLowerCase()
      );
    }

    if (params.country && params.country !== 'Pan-African') {
      all = all.filter(
        (c) => c.country?.toLowerCase() === params.country!.toLowerCase()
      );
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.country && c.country.toLowerCase().includes(q))
      );
    }

    const limit = params.limit || 20;
    const startIndex = params.cursor
      ? all.findIndex((c) => c.id === params.cursor) + 1
      : 0;
    const paginated = all.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < all.length;
    const nextCursor =
      hasMore && paginated.length > 0 ? paginated[paginated.length - 1].id : null;

    return {
      data: paginated,
      nextCursor,
      hasMore,
      total: all.length,
    };
  }

  /**
   * Retrieve a single community by UUID or URL slug.
   */
  public async getCommunityByIdOrSlug(idOrSlug: string): Promise<Community> {
    if (!idOrSlug) {
      throw new ApiError('VALIDATION_ERROR', 'Community identifier is required', 400);
    }

    try {
      const res = await apiClient.get<Community>(`/communities/${encodeURIComponent(idOrSlug)}`);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const found = mockBackend.getCommunityById(idOrSlug);
    if (!found) {
      throw new ApiError('NOT_FOUND', `Community "${idOrSlug}" not found`, 404);
    }
    return found;
  }

  /**
   * Creates a new community after strict payload validation.
   */
  public async createCommunity(payload: CreateCommunityInput): Promise<Community> {
    this.validateCommunityInput(payload);

    try {
      const res = await apiClient.post<Community>('/communities', payload);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    return mockBackend.createCommunity({
      name: payload.name.trim(),
      description: payload.description.trim(),
      category: payload.category,
      country: payload.country || 'Pan-African',
      isPrivate: payload.isPrivate,
      profileImage: payload.profileImage,
      coverImage: payload.coverImage,
      rules: payload.rules.filter((r) => r.trim().length > 0),
    });
  }

  /**
   * Updates community settings (restricted to owners and moderators).
   */
  public async updateCommunity(
    id: string,
    updates: Partial<CreateCommunityInput>
  ): Promise<Community> {
    try {
      const res = await apiClient.patch<Community>(`/communities/${id}`, updates);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const communities = mockBackend.getCommunities();
    const comm = communities.find((c) => c.id === id);
    if (!comm) {
      throw new ApiError('NOT_FOUND', 'Community not found', 404);
    }

    if (updates.name) comm.name = updates.name.trim();
    if (updates.description) comm.description = updates.description.trim();
    if (updates.category) comm.category = updates.category;
    if (updates.rules) comm.rules = updates.rules;
    if (updates.isPrivate !== undefined) comm.isPrivate = updates.isPrivate;

    return comm;
  }

  /**
   * Delete or archive a community (restricted to owner).
   */
  public async deleteCommunity(id: string): Promise<void> {
    try {
      await apiClient.delete(`/communities/${id}`);
      return;
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const communities = mockBackend.getCommunities().filter((c) => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('afrilink_db_communities', JSON.stringify(communities));
    }
  }

  /**
   * Join a public community or submit a membership request to a private community.
   */
  public async joinCommunity(
    id: string
  ): Promise<{ status: 'joined' | 'pending'; memberCount: number }> {
    try {
      const res = await apiClient.post<{ status: 'joined' | 'pending'; memberCount: number }>(
        `/communities/${id}/join`
      );
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const comm = mockBackend.getCommunityById(id);
    if (!comm) {
      throw new ApiError('NOT_FOUND', 'Community not found', 404);
    }

    if (comm.isJoined) {
      return { status: 'joined', memberCount: comm.memberCount };
    }

    if (comm.isPrivate) {
      // Pending request state for private community
      return { status: 'pending', memberCount: comm.memberCount };
    }

    mockBackend.toggleJoinCommunity(id);
    const updated = mockBackend.getCommunityById(id);
    return { status: 'joined', memberCount: updated ? updated.memberCount : comm.memberCount + 1 };
  }

  /**
   * Leave an existing community.
   */
  public async leaveCommunity(id: string): Promise<{ success: boolean; memberCount: number }> {
    try {
      const res = await apiClient.delete<{ success: boolean; memberCount: number }>(
        `/communities/${id}/leave`
      );
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const comm = mockBackend.getCommunityById(id);
    if (!comm) {
      throw new ApiError('NOT_FOUND', 'Community not found', 404);
    }

    if (comm.isJoined) {
      mockBackend.toggleJoinCommunity(id);
    }

    const updated = mockBackend.getCommunityById(id);
    return { success: true, memberCount: updated ? updated.memberCount : Math.max(0, comm.memberCount - 1) };
  }

  /**
   * Retrieve community members directory with their respective roles.
   */
  public async getCommunityMembers(
    communityId: string,
    role?: CommunityRole
  ): Promise<CommunityMember[]> {
    const qs = role ? `?role=${encodeURIComponent(role)}` : '';
    try {
      const res = await apiClient.get<CommunityMember[]>(`/communities/${communityId}/members${qs}`);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const comm = mockBackend.getCommunityById(communityId);
    const members: CommunityMember[] = INITIAL_USERS.slice(0, 5).map((user, idx) => {
      let assignedRole: CommunityRole = 'member';
      if (comm && user.id === comm.creatorId) {
        assignedRole = 'owner';
      } else if (comm && comm.moderatorIds.includes(user.id)) {
        assignedRole = 'moderator';
      } else if (idx === 1) {
        assignedRole = 'moderator';
      }

      return {
        id: `cm-${communityId}-${user.id}`,
        communityId,
        user,
        role: assignedRole,
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (idx + 1) * 10).toISOString(),
      };
    });

    if (role) {
      return members.filter((m) => m.role === role);
    }
    return members;
  }

  /**
   * Retrieve discussions/posts for a specific community.
   * Throws 403 FORBIDDEN if the community is private and the user is not a member.
   */
  public async getCommunityPosts(
    communityId: string,
    cursor?: string,
    limit: number = 10
  ): Promise<PaginatedResult<Post>> {
    const comm = mockBackend.getCommunityById(communityId);
    if (comm && comm.isPrivate && !comm.isJoined) {
      throw new ApiError(
        'FORBIDDEN',
        'Private community discussions are only visible to approved members.',
        403
      );
    }

    const searchParams = new URLSearchParams();
    if (cursor) searchParams.set('cursor', cursor);
    if (limit) searchParams.set('limit', limit.toString());
    const qs = searchParams.toString();
    const endpoint = `/communities/${communityId}/posts${qs ? `?${qs}` : ''}`;

    try {
      const res = await apiClient.get<PaginatedResult<Post>>(endpoint);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const { posts, nextCursor, hasMore } = mockBackend.getPosts(
      cursor,
      limit,
      undefined,
      communityId
    );

    return {
      data: posts,
      nextCursor,
      hasMore,
    };
  }
}

export const communityService = new CommunityService();
