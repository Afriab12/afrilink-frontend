'use client';

import React, { useState } from 'react';
import { Conversation, User } from '@/types';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  Search,
  PenSquare,
  MessageSquare,
  CheckCheck,
  Inbox,
  ShieldAlert,
} from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { NewChatModal } from './NewChatModal';
import { ConversationRowSkeleton, useMinimumLoading } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onStartChatWithUser: (user: User) => void;
  isLoading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onStartChatWithUser,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'primary' | 'requests'>('primary');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const isMinimumLoading = useMinimumLoading(isLoading, 300);

  const primaryConversations = conversations.filter((c) => !c.isRequest);
  const requestConversations = conversations.filter((c) => c.isRequest);

  const displayedList = activeTab === 'primary' ? primaryConversations : requestConversations;

  const filtered = displayedList.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.participant.fullName.toLowerCase().includes(q) ||
      c.participant.username.toLowerCase().includes(q) ||
      (c.participant.country && c.participant.country.toLowerCase().includes(q)) ||
      (c.lastMessage?.content && c.lastMessage.content.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full flex-1 flex flex-col h-full bg-surface-1 select-none">
      {/* Header h-14 */}
      <div className="h-14 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-bold text-sm sm:text-base text-white/90 font-sora tracking-tight">
            Messages
          </h2>
          <p className="text-[10px] text-white/30 tracking-wide uppercase font-semibold">
            Pan-African Direct
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsNewChatModalOpen(true)}
          className="w-9 h-9 rounded-xl hover:bg-white/[0.06] text-white/70 hover:text-white flex items-center justify-center transition-colors"
          title="New Dialogue"
          aria-label="New Dialogue"
        >
          <PenSquare className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Tabs: Inbox vs Requests */}
      <div className="flex items-center px-3 pt-2.5 pb-1 gap-2 border-b border-white/[0.06] text-xs font-semibold shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('primary')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'primary'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
          }`}
        >
          <Inbox className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Inbox</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Requests {requestConversations.length > 0 && `(${requestConversations.length})`}</span>
        </button>
      </div>

      {/* Search Input h-9 */}
      <div className="p-3 border-b border-white/[0.06] shrink-0">
        <div className="relative">
          <div className="h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 flex items-center gap-2 focus-within:border-emerald-500/50 focus-within:bg-white/[0.05] transition-colors">
            <Search className="h-4 w-4 text-white/30 shrink-0" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder:text-white/20 focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {isMinimumLoading && conversations.length === 0 ? (
          <div className="space-y-1">
            <ConversationRowSkeleton />
            <ConversationRowSkeleton />
            <ConversationRowSkeleton />
            <ConversationRowSkeleton />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectConversation(conv.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectConversation(conv.id);
                  }
                }}
                className={`px-3 py-3 mx-2 rounded-xl hover:bg-white/[0.04] transition-colors flex items-center gap-3 cursor-pointer select-none ${
                  isActive
                    ? 'bg-white/[0.06] border-l-2 border-emerald-500'
                    : ''
                }`}
              >
                {/* 44px UserAvatar + 10x10 online dot slot */}
                <div className="relative w-11 h-11 flex-shrink-0">
                  <UserAvatar
                    src={conv.participant.avatarUrl}
                    alt={conv.participant.fullName}
                    username={conv.participant.username}
                    userId={conv.participant.id}
                    size="md"
                    className="w-11 h-11 rounded-full ring-2 ring-white/[0.06]"
                  />
                  {/* 10x10 emerald ring-2 ring-background online dot */}
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
                    aria-label="Online status"
                  />
                </div>

                {/* Name, Preview, Time & Unread Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-sm font-semibold text-white/90 truncate font-sora">
                      {conv.participant.fullName}
                    </h4>
                    <span className="text-[10px] text-white/25 shrink-0 font-medium">
                      {formatTime(conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-white/40 truncate">
                      {conv.lastMessage?.content || 'Started conversation'}
                    </p>

                    {conv.unreadCount > 0 ? (
                      <span className="min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center px-1 shrink-0">
                        {conv.unreadCount}
                      </span>
                    ) : (
                      <CheckCheck
                        className="h-3 w-3 text-white/20 shrink-0"
                        strokeWidth={1.75}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            preset="messages"
            title={
              searchQuery
                ? 'No messages found'
                : activeTab === 'requests'
                ? 'No message requests'
                : undefined
            }
            description={
              searchQuery
                ? `No conversations matching "${searchQuery}".`
                : activeTab === 'requests'
                ? 'No pending message requests from other members.'
                : undefined
            }
            actionLabel={searchQuery || activeTab === 'requests' ? undefined : 'Find People'}
            onAction={
              searchQuery || activeTab === 'requests'
                ? undefined
                : () => setIsNewChatModalOpen(true)
            }
          />
        )}
      </div>

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectUser={onStartChatWithUser}
      />
    </div>
  );
};
