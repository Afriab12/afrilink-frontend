'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingService } from '@/services/messagingService';
import type { Message, SocketConnectionState } from '@/types';

export interface UseMessagingSocketOptions {
  conversationId?: string | null;
  token?: string;
  onMessageReceived?: (message: Message) => void;
  onPresenceUpdated?: (presence: { userId: string; isOnline: boolean; status?: string }) => void;
  onTypingStatus?: (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
  autoConnect?: boolean;
}

export interface UseMessagingSocketReturn {
  connectionState: SocketConnectionState;
  isPolling: boolean;
  sendTypingStatus: (isTyping: boolean) => void;
  reconnect: () => void;
}

/**
 * React hook for real-time WebSocket messaging gateway (/ws/messaging).
 * 
 * Features:
 * - Reads NEXT_PUBLIC_WS_URL from process.env via messagingService
 * - Exponential backoff auto-reconnect (1s, 2s, 4s, 8s, max 10s)
 * - Real-time event subscriptions: message:received, presence:updated, typing:status
 * - Seamless 10s REST polling fallback when offline / disconnected
 */
export function useMessagingSocket(
  options: UseMessagingSocketOptions = {}
): UseMessagingSocketReturn {
  const {
    conversationId,
    token,
    onMessageReceived,
    onPresenceUpdated,
    onTypingStatus,
    autoConnect = true,
  } = options;

  const [connectionState, setConnectionState] = useState<SocketConnectionState>(() =>
    messagingService.getConnectionState()
  );
  const [isPolling, setIsPolling] = useState<boolean>(() =>
    messagingService.isPolling()
  );

  // Keep latest callbacks in refs to prevent unnecessary re-subscribing
  const onMessageReceivedRef = useRef(onMessageReceived);
  const onPresenceUpdatedRef = useRef(onPresenceUpdated);
  const onTypingStatusRef = useRef(onTypingStatus);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
    onPresenceUpdatedRef.current = onPresenceUpdated;
    onTypingStatusRef.current = onTypingStatus;
  }, [onMessageReceived, onPresenceUpdated, onTypingStatus]);

  useEffect(() => {
    if (autoConnect) {
      messagingService.connectWebSocket(token);
    }

    const handleConnectionState = (state: SocketConnectionState) => {
      setConnectionState(state);
    };

    const handlePollingState = (polling: boolean) => {
      setIsPolling(polling);
    };

    const handleMessageReceived = (msg: Message) => {
      onMessageReceivedRef.current?.(msg);
    };

    const handlePresenceUpdated = (presence: { userId: string; isOnline: boolean; status?: string }) => {
      onPresenceUpdatedRef.current?.(presence);
    };

    const handleTypingStatus = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (!conversationId || data.conversationId === conversationId) {
        onTypingStatusRef.current?.(data);
      }
    };

    messagingService.on('connection:state', handleConnectionState);
    messagingService.on('polling:state', handlePollingState);
    messagingService.on('message:received', handleMessageReceived);
    messagingService.on('presence:updated', handlePresenceUpdated);
    messagingService.on('typing:status', handleTypingStatus);

    return () => {
      messagingService.off('connection:state', handleConnectionState);
      messagingService.off('polling:state', handlePollingState);
      messagingService.off('message:received', handleMessageReceived);
      messagingService.off('presence:updated', handlePresenceUpdated);
      messagingService.off('typing:status', handleTypingStatus);
    };
  }, [autoConnect, token, conversationId]);

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (conversationId) {
        messagingService.sendTypingStatus(conversationId, isTyping);
      }
    },
    [conversationId]
  );

  const reconnect = useCallback(() => {
    messagingService.disconnectWebSocket();
    messagingService.connectWebSocket(token);
  }, [token]);

  return {
    connectionState,
    isPolling,
    sendTypingStatus,
    reconnect,
  };
}

export default useMessagingSocket;
