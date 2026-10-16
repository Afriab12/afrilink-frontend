'use client';

import React, { useState } from 'react';
import { Conversation, User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, UserPlus, MessageSquare, Check, CheckCheck, Inbox, ShieldAlert } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { NewChatModal } from './NewChatModal';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onStartChatWithUser: (user: User) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onStartChatWithUser,
}) => {
  const [activeTab, setActiveTab] = useState<'primary' | 'requests'>('primary');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

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
    <div className="w-full flex-1 border-r border-neutral-200/80 dark:border-neutral-800 flex flex-col h-full bg-white dark:bg-neutral-900">
      {/* Header */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-base text-neutral-900 dark:text-white font-sora">
            Messages
          </h2>
          <p className="text-[11px] text-neutral-500">Pan-African Direct Messaging</p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsNewChatModalOpen(true)}
          className="text-xs px-2.5 py-1 font-bold shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1" /> New
        </Button>
      </div>

      {/* Tabs: Inbox vs Requests */}
      <div className="flex items-center px-4 pt-3 pb-1 gap-2 border-b border-neutral-100 dark:border-neutral-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('primary')}
          className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'primary'
              ? 'bg-[#087443] text-white shadow-sm'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Inbox</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-[#087443] text-white shadow-sm'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Requests {requestConversations.length > 0 && `(${requestConversations.length})`}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search messages by name or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 border border-transparent focus:border-[#087443] focus:outline-none transition"
          />
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
        {filtered.length > 0 ? (
          filtered.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                  isActive
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-l-4 border-[#087443]'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={conv.participant.avatarUrl}
                    alt={conv.participant.fullName}
                    size="md"
                    className="ring-1 ring-neutral-200 dark:ring-neutral-700"
                  />
                  {/* African Presence Ring */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate font-sora">
                      {conv.participant.fullName}
                    </h4>
                    <span className="text-[10px] text-neutral-400 flex-shrink-0">
                      {formatTime(conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-neutral-500 truncate">
                      {conv.lastMessage?.content || 'Started conversation'}
                    </p>

                    {conv.unreadCount > 0 ? (
                      <span className="w-4 h-4 rounded-full bg-[#087443] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">
                        {conv.unreadCount}
                      </span>
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5 text-[#087443] flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
            <MessageSquare className="w-6 h-6 mx-auto text-neutral-300 dark:text-neutral-600" />
            <p>
              {searchQuery
                ? `No messages matching "${searchQuery}"`
                : activeTab === 'requests'
                ? 'No pending message requests'
                : 'No active conversations yet'}
            </p>
          </div>
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
