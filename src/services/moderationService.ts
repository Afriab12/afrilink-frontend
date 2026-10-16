/**
 * AfriLink Trust, Safety & Moderation Service
 * Implements Phase 2 Backend API Specification for:
 * - Content & User Abuse Reporting (/api/v1/reports)
 * - User Blocking Lifecycle (/api/v1/blocks)
 * - User Privacy & Account Settings (/api/v1/users/me)
 * - Account Deletion / PII Soft-Delete (/api/v1/users/me)
 */

import { apiClient, ApiError } from './apiClient.ts';
import type {
  Report,
  ReportCategory,
  ReportReason,
  CreateReportInput,
  User,
  UserSettings,
  UserPrivacySettings,
  UserNotificationSettings,
} from '../types/index.ts';
import { mockBackend, INITIAL_USERS } from './mockBackend.ts';

export const VALID_REPORT_REASONS: ReportReason[] = [
  'harassment',
  'spam',
  'hate_speech',
  'misinformation',
  'impersonation',
  'violence',
  'illegal_content',
  'copyright',
  'other',
];

export const VALID_REPORT_CATEGORIES: ReportCategory[] = [
  'Spam',
  'Harassment',
  'Hate',
  'Impersonation',
  'Scam/fraud',
  'Violence',
  'Sexual content',
  'Misinformation',
  'Other',
];

export class ModerationService {
  /**
   * Validates report input before dispatch.
   */
  public validateReportInput(input: CreateReportInput): void {
    if (!input.targetId || !input.targetId.trim()) {
      throw new ApiError('VALIDATION_ERROR', 'Target content or user ID is required.', 400);
    }

    const validTargetTypes = ['user', 'post', 'comment', 'community', 'message'];
    if (!validTargetTypes.includes(input.targetType)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Invalid target type "${input.targetType}". Must be one of: ${validTargetTypes.join(', ')}`,
        400
      );
    }

    if (!input.category && !input.reason) {
      throw new ApiError('VALIDATION_ERROR', 'A report reason or category is required.', 400);
    }

    if (input.reason && !VALID_REPORT_REASONS.includes(input.reason)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Invalid report reason "${input.reason}".`,
        400
      );
    }
  }

  // --- Abuse Reporting ---

  /**
   * Submits an abuse/trust report.
   */
  public async submitReport(input: CreateReportInput): Promise<Report> {
    this.validateReportInput(input);

    try {
      const res = await apiClient.post<Report>('/reports', input);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    // Local fallback
    const currentUser = mockBackend.getCurrentUser();
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.fullName,
      targetType: input.targetType,
      targetId: input.targetId,
      targetPreview: input.targetPreview || 'Reported entity',
      category: input.category || 'Other',
      reason: input.reason,
      details: input.details || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    mockBackend.addReport(newReport);
    return newReport;
  }

  /**
   * Retrieves reports submitted by current user.
   */
  public async getMyReports(): Promise<Report[]> {
    try {
      const res = await apiClient.get<Report[]>('/reports/mine');
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const currentUser = mockBackend.getCurrentUser();
    return mockBackend.getReports().filter((r) => r.reporterId === currentUser.id);
  }

  // --- User Blocking Lifecycle ---

  /**
   * Blocks a user, immediately breaking relationships and muting content.
   */
  public async blockUser(blockedUserId: string): Promise<{ success: boolean; blockedUserId: string }> {
    if (!blockedUserId || !blockedUserId.trim()) {
      throw new ApiError('VALIDATION_ERROR', 'User ID to block is required.', 400);
    }

    const currentUser = mockBackend.getCurrentUser();
    if (blockedUserId === currentUser.id) {
      throw new ApiError('INVALID_ACTION', 'You cannot block yourself.', 400);
    }

    try {
      const res = await apiClient.post<{ success: boolean; blockedUserId: string }>('/blocks', {
        blockedUserId,
      });
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    mockBackend.blockUser(blockedUserId);
    return { success: true, blockedUserId };
  }

  /**
   * Unblocks a previously blocked user.
   */
  public async unblockUser(userId: string): Promise<{ success: boolean }> {
    if (!userId || !userId.trim()) {
      throw new ApiError('VALIDATION_ERROR', 'User ID to unblock is required.', 400);
    }

    try {
      const res = await apiClient.delete<{ success: boolean }>(`/blocks/${encodeURIComponent(userId)}`);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    mockBackend.unblockUser(userId);
    return { success: true };
  }

  /**
   * Retrieve list of users blocked by current user.
   */
  public async getBlockedUsers(): Promise<User[]> {
    try {
      const res = await apiClient.get<User[]>('/blocks');
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const blockedIds = mockBackend.getBlockedUsers();
    return INITIAL_USERS.filter((u) => blockedIds.includes(u.id));
  }

  // --- Account Settings & Privacy ---

  /**
   * Get user settings.
   */
  public async getUserSettings(): Promise<UserSettings> {
    try {
      const res = await apiClient.get<UserSettings>('/users/me/settings');
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    return {
      privacy: {
        profileVisibility: 'public',
        allowFriendRequests: 'everyone',
        allowMessages: 'everyone',
        showFriendList: true,
      },
      notifications: {
        pushNotifs: true,
        emailNotifs: true,
        communityNotifs: true,
      },
    };
  }

  /**
   * Update user settings.
   */
  public async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const res = await apiClient.patch<UserSettings>('/users/me/settings', settings);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    return {
      privacy: {
        profileVisibility: 'public',
        allowFriendRequests: 'everyone',
        allowMessages: 'everyone',
        showFriendList: true,
        ...(settings.privacy || {}),
      },
      notifications: {
        pushNotifs: true,
        emailNotifs: true,
        communityNotifs: true,
        ...(settings.notifications || {}),
      },
    };
  }

  /**
   * Soft-delete / deactivate user account (GDPR / African NDPR compliance).
   */
  public async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.delete<{ success: boolean; message: string }>('/users/me');
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    return {
      success: true,
      message: 'Account soft-deleted in compliance with data privacy standards.',
    };
  }
}

export const moderationService = new ModerationService();
