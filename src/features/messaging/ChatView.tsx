'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Send,
  Image as ImageIcon,
  MoreVertical,
  Check,
  CheckCheck,
  ShieldAlert,
  Ban,
  ArrowLeft,
  X,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { Conversation, Message, User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ReportModal } from '@/features/moderation/ReportModal';
import { BlockUserModal } from '@/features/moderation/BlockUserModal';
import { useChat } from '@/stores/chatContext';
import { useAuth } from '@/stores/authContext';
import { formatTime, formatDate } from '@/lib/utils';
import { ConversationList } from './ConversationList';
import { TranslateButton } from './TranslateButton';
import { AudioPlayer } from './AudioPlayer';
import { VoiceRecorder } from './VoiceRecorder';
import { messagingService } from '@/services/messagingService';
import { languageService } from '@/services/languageService';
import { voiceService } from '@/services/voiceService';

interface ChatViewProps {
  initialConversationId?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ initialConversationId }) => {
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
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Translation & Voice State
  const [userLangPrefs] = useState(() => languageService.getUserLanguagePreferences());
  const [translatedMessages, setTranslatedMessages] = useState<
    Record<string, { translatedText: string; sourceLang: string; targetLang: string }>
  >({});
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});
  const [messageViewModes, setMessageViewModes] = useState<Record<string, 'original' | 'translated'>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Auto-select initial conversation if provided
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId, setActiveConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  // Listen to WebSocket typing events
  useEffect(() => {
    const handleTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (activeConversation && data.conversationId === activeConversation.id) {
        setIsPartnerTyping(data.isTyping);
      }
    };

    messagingService.on('typing:update', handleTyping);
    return () => {
      messagingService.off('typing:update', handleTyping);
    };
  }, [activeConversation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    if (activeConversation) {
      messagingService.sendTypingStatus(activeConversation.id, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        messagingService.sendTypingStatus(activeConversation.id, false);
      }, 2000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !mediaUrlInput.trim()) return;

    if (activeConversation) {
      messagingService.sendTypingStatus(activeConversation.id, false);
    }

    sendMessage(messageText.trim(), mediaUrlInput.trim() || undefined);
    setMessageText('');
    setMediaUrlInput('');
    setShowMediaInput(false);
  };

  const handleToggleTranslation = async (msg: Message) => {
    const currentMode = messageViewModes[msg.id] || 'original';
    if (currentMode === 'translated') {
      setMessageViewModes((prev) => ({ ...prev, [msg.id]: 'original' }));
      return;
    }

    if (translatedMessages[msg.id]) {
      setMessageViewModes((prev) => ({ ...prev, [msg.id]: 'translated' }));
      return;
    }

    setTranslatingIds((prev) => ({ ...prev, [msg.id]: true }));
    try {
      const res = await languageService.translateMessage({
        text: msg.content,
        targetLanguage: userLangPrefs.preferredLanguage || 'en',
        messageId: msg.id,
      });
      setTranslatedMessages((prev) => ({
        ...prev,
        [msg.id]: {
          translatedText: res.translatedText,
          sourceLang: res.sourceLanguage,
          targetLang: res.targetLanguage,
        },
      }));
      setMessageViewModes((prev) => ({ ...prev, [msg.id]: 'translated' }));
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslatingIds((prev) => ({ ...prev, [msg.id]: false }));
    }
  };

  const handleSendVoice = async (audioBlob: Blob, durationSeconds: number) => {
    if (!activeConversation) return;
    try {
      const res = await voiceService.uploadVoiceMessage({
        audioBlob,
        conversationId: activeConversation.id,
        sourceLanguage: userLangPrefs.nativeLanguage,
        durationSeconds,
      });
      sendMessage(res.transcription || '🎤 Voice message', res.audioUrl);
    } catch (err) {
      console.error('Failed to send voice recording:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-neutral-800 h-[calc(100vh-140px)] min-h-[580px] w-full max-w-full overflow-hidden flex flex-1 min-w-0">
      {/* Left Column: Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation?.id || null}
          onSelectConversation={(id) => setActiveConversationId(id)}
          onStartChatWithUser={(user) => startConversationWithUser(user)}
        />
      </div>

      {/* Right Column: Active Chat Stream */}
      <div
        className={`flex-1 min-w-0 flex flex-col bg-neutral-50/50 dark:bg-neutral-950/40 ${
          activeConversation ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <Avatar
                    src={activeConversation.participant.avatarUrl}
                    alt={activeConversation.participant.fullName}
                    size="md"
                    className="ring-1 ring-emerald-500/20"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/profile/${activeConversation.participant.username}`}
                      className="font-bold text-sm text-neutral-900 dark:text-white hover:text-[#087443] transition font-sora"
                    >
                      {activeConversation.participant.fullName}
                    </Link>
                    {activeConversation.participant.isVerified && (
                      <span className="text-[#D9A441] text-xs" title="Verified African Changemaker">
                        ★
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    @{activeConversation.participant.username} • {activeConversation.participant.country}
                  </p>
                </div>
              </div>

              {/* Header Action Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition"
                  aria-label="Conversation options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showOptionsDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 z-50 text-xs">
                    <Link
                      href={`/profile/${activeConversation.participant.username}`}
                      className="flex items-center gap-2 px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      onClick={() => setShowOptionsDropdown(false)}
                    >
                      <span>View African Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowOptionsDropdown(false);
                        setIsReportModalOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Report Dialogue</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowOptionsDropdown(false);
                        setIsBlockModalOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Block User</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Message Thread History */}
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
              role="log"
              aria-live="polite"
            >
              {/* Privacy Notice Banner */}
              <div className="max-w-md mx-auto text-center py-2 px-4 bg-white/70 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 text-[11px] text-neutral-500 shadow-xs">
                🔒 Messages are private between you and {activeConversation.participant.fullName}. Rooted in African integrity.
              </div>

              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isMine = msg.senderId === currentUser?.id || msg.sender?.id === currentUser?.id;
                  const isTranslated = messageViewModes[msg.id] === 'translated';
                  const translation = translatedMessages[msg.id];
                  const displayContent = isTranslated && translation ? translation.translatedText : msg.content;
                  const targetLangObj = languageService.getLanguageByCode(userLangPrefs.preferredLanguage);
                  const isAudio =
                    msg.audioUrl ||
                    (msg.mediaUrl &&
                      (msg.mediaUrl.startsWith('blob:') ||
                        msg.mediaUrl.includes('voice') ||
                        msg.mediaUrl.includes('audio')));

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md p-3.5 rounded-3xl shadow-xs text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-[#087443] text-white rounded-br-xs shadow-emerald-900/10'
                            : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 rounded-bl-xs border border-neutral-200/70 dark:border-neutral-800'
                        }`}
                      >
                        {msg.mediaUrl && !isAudio && (
                          <div className="mb-2 rounded-2xl overflow-hidden max-h-60 bg-black/10">
                            <img
                              src={msg.mediaUrl}
                              alt="Attached African media"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Audio Note Attachment */}
                        {isAudio && (
                          <div
                            className={`mb-2 p-2.5 rounded-2xl flex items-center gap-2.5 ${
                              isMine ? 'bg-emerald-900/40 text-emerald-100' : 'bg-neutral-100 dark:bg-neutral-800'
                            }`}
                          >
                            <AudioPlayer audioUrl={msg.audioUrl || msg.mediaUrl} isMine={isMine} />
                            <div className="flex-1">
                              <p className="text-[11px] font-bold font-mono">Voice Recording</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="w-1 h-2 bg-[#D9A441] rounded-full animate-pulse" />
                                <span className="w-1 h-3 bg-[#D9A441] rounded-full animate-pulse delay-75" />
                                <span className="w-1 h-1.5 bg-[#D9A441] rounded-full animate-pulse delay-150" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Translation Notice Badge */}
                        {isTranslated && translation && (
                          <div
                            className={`mb-1 text-[10px] font-bold flex items-center gap-1 ${
                              isMine ? 'text-emerald-200' : 'text-[#087443] dark:text-emerald-400'
                            }`}
                          >
                            <span>
                              Translated to {targetLangObj?.name || userLangPrefs.preferredLanguage}
                            </span>
                          </div>
                        )}

                        <p className="whitespace-pre-wrap break-words">{displayContent}</p>
                      </div>

                      {/* Timestamp, Read Receipt & Action Buttons */}
                      <div className="flex items-center flex-wrap gap-1.5 mt-1 px-1 text-[10px] text-neutral-400">
                        <span>{formatTime(msg.createdAt)}</span>
                        {isMine && (
                          <span>
                            {msg.isRead ? (
                              <CheckCheck className="w-3 h-3 text-[#087443]" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </span>
                        )}

                        {/* Translate Toggle */}
                        <TranslateButton
                          isTranslated={isTranslated}
                          isLoading={translatingIds[msg.id]}
                          targetLanguageName={targetLangObj?.name || 'My Language'}
                          onClick={() => handleToggleTranslation(msg)}
                          isMine={isMine}
                        />

                        {/* Audio Text-to-Speech Player */}
                        <AudioPlayer
                          textToSpeak={displayContent}
                          languageCode={
                            isTranslated
                              ? userLangPrefs.preferredLanguage
                              : userLangPrefs.nativeLanguage
                          }
                          isMine={isMine}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 space-y-2">
                  <div className="w-12 h-12 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 font-sora">
                    Start Dialogue
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-xs">
                    Send a greeting to {activeConversation.participant.fullName} to spark collaboration or friendship!
                  </p>
                </div>
              )}

              {/* Typing indicator bubble */}
              {isPartnerTyping && (
                <div className="flex items-center gap-2 text-xs text-neutral-500 italic p-2 bg-white/60 dark:bg-neutral-900/60 rounded-2xl w-fit">
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-200" />
                  </span>
                  <span>{activeConversation.participant.fullName} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Media URL Input Box (if opened) */}
            {showMediaInput && (
              <div className="px-4 py-2 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Paste image or media URL..."
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#087443]"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaInput(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Message Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center gap-2 w-full max-w-full"
            >
              {/* Media Attachment Button */}
              <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 z-10">
                <button
                  type="button"
                  onClick={() => setShowMediaInput(!showMediaInput)}
                  className={`p-2.5 rounded-full transition pointer-events-auto cursor-pointer ${
                    showMediaInput || mediaUrlInput
                      ? 'bg-emerald-50 text-[#087443] dark:bg-emerald-950/40'
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Attach image or media"
                  aria-label="Attach media"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Text Input Field */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder={`Message ${activeConversation.participant.fullName}...`}
                  value={messageText}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 border border-transparent focus:border-[#087443] focus:outline-none transition"
                />
              </div>

              {/* Action Controls: Voice Recorder + Send Button */}
              <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 z-10 pointer-events-auto">
                <VoiceRecorder onSendVoice={handleSendVoice} disabled={!activeConversation} />

                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={!messageText.trim() && !mediaUrlInput.trim()}
                  className="rounded-full p-2.5 px-3 font-bold shadow-sm pointer-events-auto cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
              <Sparkles className="w-8 h-8 text-[#D9A441]" />
            </div>
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200 font-sora">
              Select an African Dialogue
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
              Choose an existing conversation from the list or start a fresh connection across borders.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeConversation && (
        <>
          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            targetType="message"
            targetId={activeConversation.id}
            targetPreview={`Conversation with ${activeConversation.participant.fullName}`}
          />

          <BlockUserModal
            isOpen={isBlockModalOpen}
            onClose={() => setIsBlockModalOpen(false)}
            user={activeConversation.participant}
          />
        </>
      )}
    </div>
  );
};
