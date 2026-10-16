'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, Message, User } from '@/types';
import { mockBackend, INITIAL_USERS } from '@/services/mockBackend';
import { useAuth } from './authContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadMessagesCount: number;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (content: string, mediaUrl?: string) => void;
  startConversationWithUser: (user: User) => string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const convs = mockBackend.getConversations();
    setConversations(convs);
    if (convs.length > 0 && !activeConversation) {
      setActiveConversation(convs[0]);
      setMessages(mockBackend.getMessages(convs[0].id));
    }
  }, []);

  const setActiveConversationId = (id: string | null) => {
    if (!id) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }
    const convs = mockBackend.getConversations();
    const found = convs.find((c) => c.id === id);
    if (found) {
      // Mark messages as read
      found.unreadCount = 0;
      setActiveConversation(found);
      const msgs = mockBackend.getMessages(id);
      msgs.forEach((m) => (m.isRead = true));
      setMessages(msgs);
      setConversations([...convs]);
    }
  };

  const sendMessage = (content: string, mediaUrl?: string) => {
    if (!activeConversation) return;

    const newMsg = mockBackend.sendMessage(activeConversation.id, content, mediaUrl);
    setMessages((prev) => [...prev, newMsg]);

    const updatedConvs = mockBackend.getConversations();
    setConversations(updatedConvs);

    // Simulate realistic responsive reply after 2.5 seconds if talking to another user
    const recipient = activeConversation.participant;
    if (recipient.id !== currentUser?.id) {
      setTimeout(() => {
        const simulatedReplies: Record<string, string[]> = {
          'user-amina': [
            "Thanks for following up Kwame! Let's ensure the currency exchange endpoint accounts for the latest ECOWAS trade tariff standards.",
            "That sounds like a solid plan. I am putting together the API schemas for our pilot team right now.",
            "Agreed! Connected tech between Nigeria and Ghana will be a blueprint for the entire continent.",
          ],
          'user-samuel': [
            "Great to hear! The farmers in Nakuru are really looking forward to seeing how the analytics dashboard operates on low-bandwidth networks.",
            "Definitely! Let's connect over coffee when you land at JKIA next month.",
          ],
        };

        const replies = simulatedReplies[recipient.id] || [
          "Received! Thank you for sharing. Let's keep building Africa together!",
          "Got it! That looks wonderful. Let's continue this thread shortly.",
        ];

        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        // Append message from recipient
        const allMessages = mockBackend.getMessages(activeConversation.id);
        const replyMsg: Message = {
          id: `msg-${Date.now()}`,
          conversationId: activeConversation.id,
          senderId: recipient.id,
          sender: recipient,
          content: randomReply,
          createdAt: new Date().toISOString(),
          isRead: true,
        };

        const storedMsgs = (mockBackend as any).getItem('messages', []);
        storedMsgs.push(replyMsg);
        (mockBackend as any).setItem('messages', storedMsgs);

        setMessages((prev) => [...prev, replyMsg]);

        // Update conv
        const latestConvs = mockBackend.getConversations();
        const activeC = latestConvs.find((c) => c.id === activeConversation.id);
        if (activeC) {
          activeC.lastMessage = replyMsg;
          activeC.updatedAt = replyMsg.createdAt;
          (mockBackend as any).setItem('conversations', latestConvs);
          setConversations([...latestConvs]);
        }
      }, 2500);
    }
  };

  const startConversationWithUser = (user: User): string => {
    const existing = conversations.find((c) => c.participant.id === user.id);
    if (existing) {
      setActiveConversationId(existing.id);
      return existing.id;
    }

    const newConvId = `conv-${user.username}-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participant: user,
      lastMessage: {
        id: `msg-start-${Date.now()}`,
        conversationId: newConvId,
        senderId: currentUser?.id || 'user-current',
        sender: currentUser || INITIAL_USERS[0],
        content: `Started conversation with ${user.fullName}`,
        createdAt: new Date().toISOString(),
        isRead: true,
      },
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    const allConvs = [newConv, ...conversations];
    (mockBackend as any).setItem('conversations', allConvs);
    setConversations(allConvs);
    setActiveConversation(newConv);
    setMessages([]);
    return newConvId;
  };

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        unreadMessagesCount,
        setActiveConversationId,
        sendMessage,
        startConversationWithUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
