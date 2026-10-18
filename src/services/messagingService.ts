/**
 * AfriLink Direct Real-Time Messaging Service
 * Implements Phase 2 Backend API Specification for:
 * - 1-to-1 Conversations (/api/v1/conversations)
 * - Message History & Delivery (/api/v1/messages)
 * - Read Receipts (/api/v1/conversations/:id/read)
 * - Real-Time WebSocket Gateway (/ws/messaging) with seamless REST fallback
 * - Message Requests & Gating
 */

import { apiClient, ApiError } from './apiClient.ts';
import type {
  Conversation,
  Message,
  SendMessagePayload,
  SocketConnectionState,
  User,
} from '../types/index.ts';
import { mockBackend, INITIAL_USERS } from './mockBackend.ts';

export type MessageEventHandler = (data: any) => void;

export class MessagingService {
  private socket: WebSocket | null = null;
  private connectionState: SocketConnectionState = 'disconnected';
  private eventListeners: Map<string, Set<MessageEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: any = null;
  private pollingTimer: any = null;
  private isPollingFallback = false;
  private readonly backoffSequence = [1000, 2000, 4000, 8000];

  /**
   * Calculates exponential backoff in seconds: 1s, 2s, 4s, 8s, max 10s.
   */
  public calculateBackoff(attempt: number): number {
    if (attempt <= 0) return 1000;
    const idx = attempt - 1;
    return idx < this.backoffSequence.length ? this.backoffSequence[idx] : 10000;
  }

  // --- WebSocket Connection Management ---

  /**
   * Initializes the WebSocket gateway connection.
   * Reads NEXT_PUBLIC_WS_URL from process.env or falls back to window.location host.
   */
  public connectWebSocket(token?: string): void {
    if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
      // In server-side rendering or non-browser environments, remain disconnected
      this.setConnectionState('disconnected');
      return;
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setConnectionState('connecting');

    const envWsUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WS_URL;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const baseWs = envWsUrl || `${wsProtocol}//${host}/ws/messaging`;
    const separator = baseWs.includes('?') ? '&' : '?';
    const wsUrl = token ? `${baseWs}${separator}token=${encodeURIComponent(token)}` : baseWs;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.setConnectionState('connected');
        this.reconnectAttempts = 0;
        this.stopPollingFallback();
        this.emitLocal('connected', { timestamp: new Date().toISOString() });
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.event) {
            this.emitLocal(payload.event, payload.data);
            // Support normalized aliases
            if (payload.event === 'typing:status') {
              this.emitLocal('typing:update', payload.data);
            } else if (payload.event === 'typing:update') {
              this.emitLocal('typing:status', payload.data);
            }
          }
        } catch {
          // ignore malformed frame
        }
      };

      this.socket.onerror = () => {
        // Handled silently by onclose
      };

      this.socket.onclose = () => {
        this.setConnectionState('disconnected');
        this.socket = null;
        this.scheduleReconnect(token);
      };
    } catch {
      this.setConnectionState('disconnected');
      this.scheduleReconnect(token);
    }
  }

  /**
   * Disconnects the active WebSocket gateway.
   */
  public disconnectWebSocket(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPollingFallback();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setConnectionState('disconnected');
  }

  public getConnectionState(): SocketConnectionState {
    return this.connectionState;
  }

  public isPolling(): boolean {
    return this.isPollingFallback;
  }

  private setConnectionState(state: SocketConnectionState): void {
    this.connectionState = state;
    this.emitLocal('connection:state', state);
  }

  private scheduleReconnect(token?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.startPollingFallback();
      return;
    }
    this.reconnectAttempts += 1;
    const delay = this.calculateBackoff(this.reconnectAttempts);
    this.reconnectTimer = setTimeout(() => {
      this.connectWebSocket(token);
    }, delay);
    // While disconnected/reconnecting, activate 10-second polling fallback
    this.startPollingFallback();
  }

  /**
   * Activates fallback REST polling every 10 seconds when WebSocket is offline.
   */
  public startPollingFallback(): void {
    if (this.isPollingFallback) return;
    this.isPollingFallback = true;
    this.emitLocal('polling:state', true);

    this.pollChatUpdates();
    this.pollingTimer = setInterval(() => {
      this.pollChatUpdates();
    }, 10000);
  }

  /**
   * Deactivates REST polling fallback once WebSocket connection is restored.
   */
  public stopPollingFallback(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.isPollingFallback = false;
    this.emitLocal('polling:state', false);
  }

  private async pollChatUpdates(): Promise<void> {
    try {
      const convs = await this.getConversations('primary');
      this.emitLocal('chat:poll:conversations', convs);
    } catch {
      // Safe ignore in offline/unreachable conditions
    }
  }

  /**
   * Register listener for WebSocket events.
   */
  public on(event: string, handler: MessageEventHandler): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
  }

  /**
   * Remove listener for WebSocket events.
   */
  public off(event: string, handler: MessageEventHandler): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(handler);
    }
  }

  private emitLocal(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Error in message event listener for ${event}:`, err);
        }
      });
    }
  }

  /**
   * Broadcast typing state via WebSocket if connected.
   */
  public sendTypingStatus(conversationId: string, isTyping: boolean): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          event: isTyping ? 'typing:start' : 'typing:stop',
          data: { conversationId },
        })
      );
    }
  }

  // --- REST Validation Helpers ---

  /**
   * Validates message payload:
   * - Content or mediaUrl/mediaAssetId is required.
   * - Content cannot exceed 2000 characters.
   */
  public validateMessagePayload(payload: SendMessagePayload): void {
    const trimmedContent = (payload.content || '').trim();
    const hasMedia = Boolean(payload.mediaUrl || payload.mediaAssetId);

    if (!trimmedContent && !hasMedia) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Message must contain either text content or a media attachment.',
        400
      );
    }

    if (trimmedContent.length > 2000) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Message content cannot exceed 2000 characters. Current length: ${trimmedContent.length}.`,
        400
      );
    }
  }

  // --- REST API Endpoints ---

  /**
   * Fetch all conversations for current user.
   * Supports 'primary' inbox or 'requests' tab.
   */
  public async getConversations(type: 'primary' | 'requests' = 'primary'): Promise<Conversation[]> {
    try {
      const res = await apiClient.get<Conversation[]>(`/conversations?type=${type}`);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    // Local fallback
    const all = mockBackend.getConversations();
    if (type === 'requests') {
      return all.filter((c) => c.isRequest);
    }
    return all.filter((c) => !c.isRequest);
  }

  /**
   * Retrieve single conversation by UUID.
   */
  public async getConversationById(id: string): Promise<Conversation> {
    if (!id) {
      throw new ApiError('VALIDATION_ERROR', 'Conversation ID is required.', 400);
    }

    try {
      const res = await apiClient.get<Conversation>(`/conversations/${encodeURIComponent(id)}`);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const conv = mockBackend.getConversations().find((c) => c.id === id);
    if (!conv) {
      throw new ApiError('NOT_FOUND', `Conversation "${id}" not found.`, 404);
    }
    return conv;
  }

  /**
   * Start or resume a conversation with a specific user.
   * Enforces 403 FORBIDDEN if the recipient or current user is blocked.
   */
  public async startConversation(recipientId: string): Promise<Conversation> {
    if (!recipientId || !recipientId.trim()) {
      throw new ApiError('VALIDATION_ERROR', 'Recipient ID is required to start a conversation.', 400);
    }

    // Check if recipient is blocked
    const blockedList = mockBackend.getBlockedUsers();
    if (blockedList.includes(recipientId)) {
      throw new ApiError(
        'FORBIDDEN',
        'You cannot message this user due to privacy or blocking restrictions.',
        403
      );
    }

    try {
      const res = await apiClient.post<Conversation>('/conversations', { recipientId });
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    // Local fallback: find existing or create new
    const existing = mockBackend.getConversations().find((c) => c.participant.id === recipientId);
    if (existing) {
      return existing;
    }

    const recipient = INITIAL_USERS.find((u) => u.id === recipientId) || {
      id: recipientId,
      username: `user_${recipientId}`,
      fullName: 'African Changemaker',
      email: `${recipientId}@afrilink.africa`,
      bio: 'AfriLink Member',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImageUrl: '',
      country: 'Pan-African',
      countryCode: 'AF',
      city: 'Accra',
      interests: [],
      joinedDate: '2026-01-01',
      role: 'user',
      status: 'active',
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
    };

    const newConvId = `conv-${recipient.username}-${Date.now()}`;
    const currentUser = mockBackend.getCurrentUser();

    const newConv: Conversation = {
      id: newConvId,
      participant: recipient,
      lastMessage: {
        id: `msg-start-${Date.now()}`,
        conversationId: newConvId,
        senderId: currentUser.id,
        sender: currentUser,
        content: `Started conversation with ${recipient.fullName}`,
        createdAt: new Date().toISOString(),
        isRead: true,
      },
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      isRequest: false,
    };

    const allConvs = [newConv, ...mockBackend.getConversations()];
    if (typeof window !== 'undefined') {
      localStorage.setItem('afrilink_db_conversations', JSON.stringify(allConvs));
    }
    return newConv;
  }

  /**
   * Retrieve cursor-paginated messages for a conversation.
   */
  public async getMessages(
    conversationId: string,
    cursor?: string,
    limit: number = 30
  ): Promise<{ messages: Message[]; nextCursor: string | null; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    if (cursor) searchParams.set('cursor', cursor);
    if (limit) searchParams.set('limit', limit.toString());
    const qs = searchParams.toString();
    const endpoint = `/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`;

    try {
      const res = await apiClient.get<{ messages: Message[]; nextCursor: string | null; hasMore: boolean }>(endpoint);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const all = mockBackend.getMessages(conversationId);
    return {
      messages: all,
      nextCursor: null,
      hasMore: false,
    };
  }

  /**
   * Sends a message via REST pipeline with validation and optimistic properties.
   */
  public async sendMessage(
    conversationId: string,
    payload: SendMessagePayload
  ): Promise<Message> {
    this.validateMessagePayload(payload);

    try {
      const res = await apiClient.post<Message>(`/conversations/${conversationId}/messages`, payload);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    // Local fallback
    const sentMsg = mockBackend.sendMessage(conversationId, payload.content, payload.mediaUrl);
    return {
      ...sentMsg,
      mediaAssetId: payload.mediaAssetId,
      status: 'sent',
    };
  }

  /**
   * Mark a conversation thread as read.
   */
  public async markConversationAsRead(
    conversationId: string,
    lastReadMessageId?: string
  ): Promise<{ success: boolean }> {
    try {
      const res = await apiClient.patch<{ success: boolean }>(
        `/conversations/${conversationId}/read`,
        { lastReadMessageId }
      );
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const convs = mockBackend.getConversations();
    const conv = convs.find((c) => c.id === conversationId);
    if (conv) {
      conv.unreadCount = 0;
      conv.lastReadMessageId = lastReadMessageId;
    }
    const msgs = mockBackend.getMessages(conversationId);
    msgs.forEach((m) => {
      m.isRead = true;
    });

    return { success: true };
  }

  /**
   * Accept an incoming message request.
   */
  public async acceptMessageRequest(conversationId: string): Promise<Conversation> {
    try {
      const res = await apiClient.patch<Conversation>(`/conversations/${conversationId}/accept`);
      if (res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }

    const convs = mockBackend.getConversations();
    const conv = convs.find((c) => c.id === conversationId);
    if (!conv) {
      throw new ApiError('NOT_FOUND', 'Conversation not found.', 404);
    }
    conv.isRequest = false;
    return conv;
  }
}

export const messagingService = new MessagingService();
