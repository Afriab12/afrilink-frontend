/**
 * AfriLink Social Service
 * Implements Phase 2 Backend API Specification for:
 * - 2-Way Friendships (/api/v1/friendships)
 * - 1-Way Creator Follows (/api/v1/follows)
 * - Pan-African User Search (/api/v1/users/search)
 */

import { apiClient, ApiError } from './apiClient.ts';
import type { User, FriendshipStatus } from '../types/index.ts';
import { mockBackend, INITIAL_USERS } from './mockBackend.ts';

export interface SearchUsersParams {
  q?: string;
  countryId?: string;
  cursor?: string;
  limit?: number;
}

export class SocialService {
  // --- 2-Way Friendships ---

  /**
   * Dispatches a friend request to a target user.
   * Endpoint: POST /api/v1/friendships
   */
  public async sendFriendRequest(
    addresseeId: string,
    currentUserId?: string
  ): Promise<{ success: boolean; friendshipId?: string }> {
    if (currentUserId && addresseeId === currentUserId) {
      throw new ApiError('INVALID_ACTION', 'Cannot send a friend request to yourself.', 400);
    }

    try {
      const res = await apiClient.post<{ id: string; status: string }>('/friendships', {
        addresseeId,
      });
      return { success: true, friendshipId: res.data?.id };
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
      // Offline fallback
      mockBackend.setFriendshipStatus(addresseeId, 'pending_sent');
      return { success: true, friendshipId: `friendship-${Date.now()}` };
    }
  }

  /**
   * Retrieves active or pending friendships.
   * Endpoint: GET /api/v1/friendships?status=...
   */
  public async getFriendships(status?: 'pending' | 'accepted'): Promise<any[]> {
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await apiClient.get<any[]>(`/friendships${query}`);
      return res.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Responds to an incoming friend request (accept or decline).
   * Endpoint: PATCH /api/v1/friendships/:id
   */
  public async respondToFriendRequest(
    friendshipId: string,
    status: 'accepted' | 'declined',
    targetUserId?: string
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.patch(`/friendships/${encodeURIComponent(friendshipId)}`, { status });
      return { success: true };
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
      if (targetUserId) {
        mockBackend.setFriendshipStatus(
          targetUserId,
          status === 'accepted' ? 'friends' : 'none'
        );
      }
      return { success: true };
    }
  }

  /**
   * Cancels a pending request or removes an existing friendship.
   * Endpoint: DELETE /api/v1/friendships/:id
   */
  public async removeFriendship(
    friendshipId: string,
    targetUserId?: string
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/friendships/${encodeURIComponent(friendshipId)}`);
      return { success: true };
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
      if (targetUserId) {
        mockBackend.setFriendshipStatus(targetUserId, 'none');
      }
      return { success: true };
    }
  }

  // --- 1-Way Follows ---

  /**
   * Follows a creator or user.
   * Endpoint: POST /api/v1/follows
   */
  public async followUser(
    followeeId: string,
    currentUserId?: string
  ): Promise<{ success: boolean }> {
    if (currentUserId && followeeId === currentUserId) {
      throw new ApiError('INVALID_ACTION', 'Cannot follow yourself.', 400);
    }

    try {
      await apiClient.post('/follows', { followeeId });
      return { success: true };
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
      mockBackend.toggleFollow(followeeId);
      return { success: true };
    }
  }

  /**
   * Unfollows a user.
   * Endpoint: DELETE /api/v1/follows/:followeeId
   */
  public async unfollowUser(
    followeeId: string
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/follows/${encodeURIComponent(followeeId)}`);
      return { success: true };
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
      mockBackend.toggleFollow(followeeId);
      return { success: true };
    }
  }

  /**
   * Retrieves followers for a user.
   * Endpoint: GET /api/v1/follows/followers/:userId
   */
  public async getFollowers(userId: string): Promise<User[]> {
    try {
      const res = await apiClient.get<User[]>(`/follows/followers/${encodeURIComponent(userId)}`);
      return res.data || [];
    } catch {
      return INITIAL_USERS.filter((u) => u.id !== userId).slice(0, 3);
    }
  }

  /**
   * Retrieves accounts a user is following.
   * Endpoint: GET /api/v1/follows/following/:userId
   */
  public async getFollowing(userId: string): Promise<User[]> {
    try {
      const res = await apiClient.get<User[]>(`/follows/following/${encodeURIComponent(userId)}`);
      return res.data || [];
    } catch {
      return INITIAL_USERS.filter((u) => u.id !== userId).slice(0, 3);
    }
  }

  // --- Global User Search ---

  /**
   * Builds search query parameters and queries users.
   * Endpoint: GET /api/v1/users/search?q=&countryId=&cursor=&limit=
   */
  public buildSearchQueryString(params: SearchUsersParams): string {
    const searchParams = new URLSearchParams();
    if (params.q?.trim()) {
      searchParams.set('q', params.q.trim());
    }
    if (params.countryId?.trim()) {
      searchParams.set('countryId', params.countryId.trim().toUpperCase());
    }
    if (params.cursor) {
      searchParams.set('cursor', params.cursor);
    }
    if (params.limit) {
      searchParams.set('limit', params.limit.toString());
    }
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Searches for users across Africa by name, username, bio, country, or interests.
   */
  public async searchUsers(params: SearchUsersParams): Promise<User[]> {
    const queryString = this.buildSearchQueryString(params);
    try {
      const res = await apiClient.get<User[]>(`/users/search${queryString}`);
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      // Local search fallback
    }

    // Fallback: search through local INITIAL_USERS
    const term = (params.q || '').trim().toLowerCase();
    const country = (params.countryId || '').trim().toUpperCase();

    if (!term && !country) return [];

    return INITIAL_USERS.filter((user) => {
      const matchesQuery =
        !term ||
        user.fullName.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.bio.toLowerCase().includes(term) ||
        user.city.toLowerCase().includes(term);

      const matchesCountry =
        !country ||
        user.countryCode.toUpperCase() === country ||
        user.country.toUpperCase() === country;

      return matchesQuery && matchesCountry;
    });
  }
}

export const socialService = new SocialService();
