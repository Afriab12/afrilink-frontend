/**
 * AfriLink Notification Service
 * Implements Phase 2 Backend API Specification for:
 * - Activity Notifications (/api/v1/notifications)
 * - Live Unread Notification Count (/api/v1/notifications/unread-count)
 * - Batch & Individual Read Status Updates
 */

import { apiClient, ApiError } from './apiClient.ts';
import type { Notification } from '../types/index.ts';
import { mockBackend } from './mockBackend.ts';

export class NotificationService {
  /**
   * Retrieves the current unread notifications count.
   * Endpoint: GET /api/v1/notifications/unread-count
   */
  public async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<{ count: number }>('/notifications/unread-count');
      if (typeof res.data?.count === 'number') {
        return res.data.count;
      }
    } catch {
      // Offline fallback
    }

    const localNotifs = mockBackend.getNotifications();
    return localNotifs.filter((n) => !n.isRead).length;
  }

  /**
   * Retrieves paginated activity notifications.
   * Endpoint: GET /api/v1/notifications
   */
  public async getNotifications(params?: { cursor?: string; limit?: number }): Promise<Notification[]> {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';

    try {
      const res = await apiClient.get<Notification[]>(`/notifications${qs}`);
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      // Offline fallback
    }

    return mockBackend.getNotifications();
  }

  /**
   * Marks all notifications as read in a single batch.
   * Endpoint: PATCH /api/v1/notifications/read-all
   */
  public async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/read-all', {});
    } catch {
      // Local fallback
      mockBackend.markAllNotificationsAsRead();
    }
  }

  /**
   * Marks an individual notification as read.
   * Endpoint: PATCH /api/v1/notifications/:id/read
   */
  public async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${encodeURIComponent(notificationId)}/read`, {});
    } catch {
      // Local fallback
      mockBackend.markNotificationAsRead(notificationId);
    }
  }
}

export const notificationService = new NotificationService();
