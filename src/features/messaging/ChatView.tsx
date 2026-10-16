'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Image as ImageIcon,
  MoreVertical,
  Search,
  Check,
  CheckCheck,
  ShieldAlert,
  Ban,
  UserPlus,
  ArrowLeft,
  X,
} from 'lucide-react';
import { Conversation, Message, User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ReportModal } from '@/features/moderation/ReportModal';
import { BlockUserModal } from '@/features/moderation/BlockUserModal';
import { useChat } from '@/stores/chatContext';
import { useAuth } from '@/stores/authContext';
import { formatTime, formatDate } from '@/lib/utils';
import { INITIAL_USERS } from '@/services/mockBackend';

export const ChatView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    setActiveConversationId,
    sendMessage,
    startConversationWithUser,
  } = useChat();

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  // Filter conversations
  const filteredConversations = conversations.filter((c) =>
    c.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !mediaUrlInput.trim()) return;

    sendMessage(messageText.trim(), mediaUrlInput.trim() || undefined);
    setMessageText('');
    setMediaUrlInput('');
    setShowMediaInput(false);
  };

  const handleStartChatWith = (user: User) => {
    startConversationWithUser(user);
    setIsNewChatModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-neutral-800 h-[calc(100vh-140px)] min-h-[580px] flex">
      {/* Left Column: Conversations List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-neutral-200 dark:border-neutral-800 flex flex-col ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
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
            className="text-xs px-2.5 py-1"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1" /> New
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#087443]"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isActive = activeConversation?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                    isActive
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-l-4 border-[#087443]'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <Avatar
                    src={conv.participant.avatarUrl}
                    alt={conv.participant.fullName}
                    size="md"
                    countryFlag={conv.participant.countryCode === 'NG' ? '🇳🇬' : conv.participant.countryCode === 'GH' ? '🇬🇭' : '🌍'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                        {conv.participant.fullName}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex-shrink-0">
                        {formatDate(conv.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-[#087443] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-neutral-400">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Active Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col h-full bg-neutral-50/50 dark:bg-neutral-950/40">
          {/* Chat Header */}
          <div className="p-3.5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveConversationId(null)}
                className="md:hidden p-1.5 text-neutral-500 hover:text-neutral-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <Link
                href={`/profile/${activeConversation.participant.username}`}
                className="flex items-center gap-2.5 group"
              >
                <Avatar
                  src={activeConversation.participant.avatarUrl}
                  alt={activeConversation.participant.fullName}
                  size="sm"
                  countryFlag={activeConversation.participant.countryCode === 'NG' ? '🇳🇬' : '🇬🇭'}
                />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white group-hover:text-[#087443] transition">
                    {activeConversation.participant.fullName}
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    @{activeConversation.participant.username} • {activeConversation.participant.country}
                  </p>
                </div>
              </Link>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showOptionsDropdown && (
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 z-20">
                  <button
                    onClick={() => {
                      setIsReportModalOpen(true);
                      setShowOptionsDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Report Chat
                  </button>
                  <button
                    onClick={() => {
                      setIsBlockModalOpen(true);
                      setShowOptionsDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                  >
                    <Ban className="w-3.5 h-3.5" /> Block Participant
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id || msg.senderId === 'user-current';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isMine
                        ? 'bg-[#087443] text-white rounded-br-none'
                        : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200/80 dark:border-neutral-800 rounded-bl-none'
                    }`}
                  >
                    {msg.mediaUrl && (
                      <img
                        src={msg.mediaUrl}
                        alt="Shared media"
                        className="rounded-xl mb-2 max-h-48 w-full object-cover"
                      />
                    )}
                    <p>{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400 px-1">
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMine && (
                      <span>
                        {msg.isRead ? (
                          <CheckCheck className="w-3 h-3 text-[#087443]" />
                        ) : (
                          <Check className="w-3 h-3 text-neutral-400" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Image Input Preview */}
          {showMediaInput && (
            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
              <input
                type="url"
                placeholder="Paste image link to attach..."
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                className="flex-1 bg-white dark:bg-neutral-900 text-xs px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 focus:outline-none"
              />
              <button
                onClick={() => setShowMediaInput(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setShowMediaInput(!showMediaInput)}
              className="p-2 text-neutral-500 hover:text-[#087443] rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Attach photo"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={`Message ${activeConversation.participant.fullName}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#087443]"
            />

            <Button
              type="submit"
              variant="primary"
              size="icon"
              disabled={!messageText.trim() && !mediaUrlInput.trim()}
              className="rounded-2xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center p-8 text-center text-neutral-400 bg-neutral-50/30 dark:bg-neutral-950/20">
          <div>
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] flex items-center justify-center mx-auto mb-3 text-2xl">
              💬
            </div>
            <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200 font-sora">
              Select a Conversation
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              Choose a thread from the left or start a new direct connection with builders across Africa.
            </p>
            <div className="mt-4">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsNewChatModalOpen(true)}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Start New Conversation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Start Conversation"
        description="Select an African builder to direct message"
        maxWidth="md"
      >
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {INITIAL_USERS.filter((u) => u.id !== currentUser?.id).map((u) => (
            <button
              key={u.id}
              onClick={() => handleStartChatWith(u)}
              className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#087443] flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <Avatar src={u.avatarUrl} alt={u.fullName} size="sm" />
                <div>
                  <p className="font-bold text-xs text-neutral-900 dark:text-white">{u.fullName}</p>
                  <p className="text-[10px] text-neutral-500">@{u.username} • {u.country}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#087443]">Message</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Report & Block Modals for Chat */}
      {activeConversation && (
        <>
          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            targetType="message"
            targetId={activeConversation.id}
            targetPreview={`Conversation with @${activeConversation.participant.username}`}
          />

          <BlockUserModal
            user={activeConversation.participant}
            isOpen={isBlockModalOpen}
            onClose={() => setIsBlockModalOpen(false)}
          />
        </>
      )}
    </div>
  );
};
