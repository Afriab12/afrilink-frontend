'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Send,
  MoreVertical,
  CheckCheck,
  ShieldAlert,
  Ban,
  ArrowLeft,
  X,
  Sparkles,
  Paperclip,
  Smile,
  ImagePlus,
  Phone,
  Video,
  Languages,
} from 'lucide-react';
import { Conversation, Message, User } from '@/types';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ReportModal } from '@/features/moderation/ReportModal';
import { BlockUserModal } from '@/features/moderation/BlockUserModal';
import { useChat } from '@/stores/chatContext';
import { useAuth } from '@/stores/authContext';
import { formatTime, formatDate } from '@/lib/utils';
import { ConversationList } from './ConversationList';
import { TranslateButton } from './TranslateButton';
import { AudioPlayer } from './AudioPlayer';
import { messagingService } from '@/services/messagingService';
import { languageService } from '@/services/languageService';
import { voiceService } from '@/services/voiceService';
import { EmojiPickerPopover } from '@/components/ui/EmojiPickerPopover';

// Phase 0: Lazy-load VoiceRecorder chunk to keep shared bundles ultralight
const VoiceRecorder = dynamic(
  () => import('./VoiceRecorder').then((m) => m.VoiceRecorder),
  { ssr: false }
);

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
  const [isRecordingActive, setIsRecordingActive] = useState(false);

  // Translation & Voice State
  const [userLangPrefs] = useState(() => languageService.getUserLanguagePreferences());
  const [translatedMessages, setTranslatedMessages] = useState<
    Record<string, { translatedText: string; sourceLang: string; targetLang: string }>
  >({});
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});
  const [messageViewModes, setMessageViewModes] = useState<Record<string, 'original' | 'translated'>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    // Auto-grow textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    if (activeConversation) {
      messagingService.sendTypingStatus(activeConversation.id, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        messagingService.sendTypingStatus(activeConversation.id, false);
      }, 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() && !mediaUrlInput.trim()) return;

    if (activeConversation) {
      messagingService.sendTypingStatus(activeConversation.id, false);
    }

    sendMessage(messageText.trim(), mediaUrlInput.trim() || undefined);
    setMessageText('');
    setMediaUrlInput('');
    setShowMediaInput(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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

  const hasContent = Boolean(messageText.trim() || mediaUrlInput.trim());

  return (
    <div className="w-full max-w-full min-w-0 flex flex-1 h-[calc(100vh-120px)] min-h-[580px] rounded-2xl border border-white/[0.06] bg-surface-1/40 overflow-hidden shadow-2xl">
      {/* LEFT COLUMN: CONVERSATIONS LIST (w-80 flex-shrink-0 border-r border-white/[0.06]) */}
      <div
        className={`w-full md:w-80 flex-shrink-0 border-r border-white/[0.06] ${
          activeConversation ? 'hidden md:flex' : 'flex'
        } flex-col h-full bg-surface-1`}
      >
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation?.id || null}
          onSelectConversation={(id) => setActiveConversationId(id)}
          onStartChatWithUser={(user) => startConversationWithUser(user)}
        />
      </div>

      {/* RIGHT COLUMN: ACTIVE CHAT STREAM (flex-1 min-w-0 flex flex-col) */}
      <div
        className={`flex-1 min-w-0 flex flex-col h-full bg-surface-0 ${
          activeConversation ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* THREAD HEADER (h-14 avatar 32px, name, status text, Phone Video MoreVertical h-4 w-4) */}
            <div className="h-14 px-4 border-b border-white/[0.06] flex items-center justify-between bg-surface-1/40 backdrop-blur-sm z-10 shrink-0 select-none">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button to conversation list */}
                <button
                  type="button"
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 -ml-1 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
                </button>

                {/* Avatar 32px */}
                <UserAvatar
                  src={activeConversation.participant.avatarUrl}
                  alt={activeConversation.participant.fullName}
                  username={activeConversation.participant.username}
                  userId={activeConversation.participant.id}
                  size="sm"
                  className="w-8 h-8 rounded-full ring-1 ring-white/10 shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/profile/${activeConversation.participant.username}`}
                      className="text-sm font-semibold text-white/90 hover:text-emerald-400 transition-colors font-sora truncate block"
                    >
                      {activeConversation.participant.fullName}
                    </Link>
                  </div>
                  {/* Status text */}
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active now</span>
                  </p>
                </div>
              </div>

              {/* Thread Action Controls: Phone, Video, MoreVertical h-4 w-4 */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Voice call"
                  aria-label="Voice call"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Video call"
                  aria-label="Video call"
                >
                  <Video className="h-4 w-4" strokeWidth={1.75} />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
                    aria-label="Conversation options"
                  >
                    <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                  </button>

                  {showOptionsDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface-4 rounded-xl shadow-2xl border border-white/[0.08] py-1.5 z-50 text-xs">
                      <Link
                        href={`/profile/${activeConversation.participant.username}`}
                        className="flex items-center gap-2 px-3.5 py-2 text-white/70 hover:text-white hover:bg-white/[0.04]"
                        onClick={() => setShowOptionsDropdown(false)}
                      >
                        <span>View African Profile</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsDropdown(false);
                          setIsReportModalOpen(true);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-white/70 hover:text-white hover:bg-white/[0.04]"
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-white/40" strokeWidth={1.75} />
                        <span>Report Dialogue</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsDropdown(false);
                          setIsBlockModalOpen(true);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-red-400 hover:bg-red-500/10"
                      >
                        <Ban className="h-3.5 w-3.5" strokeWidth={1.75} />
                        <span>Block User</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MESSAGE THREAD HISTORY */}
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3"
              role="log"
              aria-live="polite"
            >
              {messages.length > 0 ? (
                messages.map((msg, index) => {
                  const isMine = msg.senderId === currentUser?.id || msg.sender?.id === currentUser?.id;
                  const isTranslated = messageViewModes[msg.id] === 'translated';
                  const translation = translatedMessages[msg.id];
                  const displayContent = isTranslated && translation ? translation.translatedText : msg.content;
                  const targetLangObj = languageService.getLanguageByCode(userLangPrefs.preferredLanguage);
                  const isAudio =
                    Boolean(msg.audioUrl) ||
                    Boolean(
                      msg.mediaUrl &&
                        (msg.mediaUrl.startsWith('blob:') ||
                          msg.mediaUrl.includes('voice') ||
                          msg.mediaUrl.includes('audio'))
                    );

                  // Date Separator calculation
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const showDateSeparator =
                    !prevMsg ||
                    new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

                  return (
                    <React.Fragment key={msg.id}>
                      {/* Date separators text-[10px] text-white/15 */}
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-4">
                          <span className="text-[10px] text-white/15 px-3 py-0.5 rounded-full bg-white/[0.02] border border-white/[0.04] font-medium select-none">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      )}

                      {/* BUBBLE ROW */}
                      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-1`}>
                        <div
                          className={`leading-relaxed ${
                            isMine
                              ? 'self-end max-w-[75%] bg-emerald-700/40 rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white/90'
                              : 'self-start max-w-[75%] bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-white/80'
                          }`}
                        >
                          {/* Attached Image (if present and not audio) */}
                          {msg.mediaUrl && !isAudio && (
                            <div className="mb-2 rounded-xl overflow-hidden max-h-60 bg-black/20">
                              <img
                                src={msg.mediaUrl}
                                alt="Attached media"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* VOICE BUBBLE: Play 32x32 rounded-full; CSS waveform bars; duration */}
                          {isAudio ? (
                            <div>
                              <AudioPlayer
                                audioUrl={msg.audioUrl || msg.mediaUrl}
                                isMine={isMine}
                                duration="0:32"
                              />

                              {/* Translation row below: border-t border-white/[0.04] mt-2 pt-2 */}
                              <div className="border-t border-white/[0.04] mt-2 pt-2 flex items-start gap-2">
                                <Languages className="h-3.5 w-3.5 text-amber-400/60 shrink-0 mt-0.5" strokeWidth={1.75} />
                                <div className="flex-1 min-w-0">
                                  <p className="italic text-xs text-white/40 leading-relaxed">
                                    {isTranslated && translation ? translation.translatedText : msg.content}
                                  </p>
                                </div>
                                <span className="text-[9px] bg-amber-500/10 text-amber-400/60 px-1.5 py-0.5 rounded font-mono shrink-0">
                                  Yoruba → English
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="whitespace-pre-wrap break-words">{displayContent}</p>

                              {/* Translation row if text is translated */}
                              {isTranslated && translation && (
                                <div className="border-t border-white/[0.04] mt-2 pt-2 flex items-start gap-2">
                                  <Languages className="h-3.5 w-3.5 text-amber-400/60 shrink-0 mt-0.5" strokeWidth={1.75} />
                                  <p className="italic text-xs text-white/40 leading-relaxed flex-1">
                                    {translation.translatedText}
                                  </p>
                                  <span className="text-[9px] bg-amber-500/10 text-amber-400/60 px-1.5 py-0.5 rounded font-mono shrink-0">
                                    Yoruba → English
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Metadata: Timestamp text-[9px] text-white/15; outgoing CheckCheck h-3 w-3 read=emerald / delivered=muted */}
                        <div
                          className={`flex items-center gap-1.5 mt-1 px-1 text-[9px] text-white/15 select-none ${
                            isMine ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMine && (
                            <CheckCheck
                              className={`h-3 w-3 ${msg.isRead ? 'text-emerald-400' : 'text-white/30'}`}
                              strokeWidth={1.75}
                            />
                          )}

                          {/* Quick Translate toggle for text messages */}
                          {!isAudio && (
                            <TranslateButton
                              isTranslated={isTranslated}
                              isLoading={translatingIds[msg.id]}
                              targetLanguageName={targetLangObj?.name || 'English'}
                              onClick={() => handleToggleTranslation(msg)}
                              isMine={isMine}
                            />
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/30 space-y-2 select-none">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-emerald-400 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-sm text-white/90 font-sora">
                    Start Dialogue
                  </h3>
                  <p className="text-xs text-white/40 max-w-xs">
                    Send a direct note to {activeConversation.participant.fullName} across borders.
                  </p>
                </div>
              )}

              {/* Typing indicator bubble */}
              {isPartnerTyping && (
                <div className="flex items-center gap-2 text-xs text-white/40 italic p-2 bg-white/[0.04] rounded-xl w-fit">
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

            {/* Media URL Input Box (if opened via ImagePlus) */}
            {showMediaInput && (
              <div className="px-4 py-2 bg-surface-1 border-t border-white/[0.06] flex items-center gap-2 shrink-0">
                <input
                  type="url"
                  placeholder="Paste media link URL..."
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaInput(false)}
                  className="text-white/40 hover:text-white p-1"
                  aria-label="Close media input"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            )}

            {/* FLOATING INPUT CONSOLE (default vs recording state) */}
            {/* transform bar, do not animate height */}
            <div className="shrink-0 flex-1 min-w-0 max-h-[140px]">
              <div
                className={`mx-4 mb-4 rounded-2xl flex items-end gap-2 p-2 min-h-[48px] pointer-events-auto transition-colors ${
                  isRecordingActive
                    ? 'border border-red-500/20 bg-red-500/5'
                    : 'bg-white/[0.04] border border-white/[0.06]'
                }`}
              >
                {isRecordingActive ? (
                  // RECORDING STATE (transform bar, do not animate height)
                  <VoiceRecorder
                    onSendVoice={handleSendVoice}
                    disabled={!activeConversation}
                    onRecordingStateChange={setIsRecordingActive}
                  />
                ) : (
                  // DEFAULT INPUT CONSOLE:
                  // Left: Smile ImagePlus Paperclip h-4 w-4 in 32x32 hit targets
                  // Textarea flex-1 min-h-[32px] max-h-[120px] resize-none bg-transparent
                  // Right: empty → Mic in 36x36 bg-emerald-600/20; has text → Send 36x36 bg-emerald-600
                  <>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Smile in 32x32 hit target with EmojiPicker */}
                      <EmojiPickerPopover
                        onSelectEmoji={(emoji) => setMessageText((prev) => prev + emoji)}
                        placement="top"
                        buttonClassName="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors p-0"
                      />

                      {/* ImagePlus in 32x32 hit target */}
                      <button
                        type="button"
                        onClick={() => setShowMediaInput(!showMediaInput)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          showMediaInput || mediaUrlInput
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                        }`}
                        title="Attach image"
                        aria-label="Attach image"
                      >
                        <ImagePlus className="h-4 w-4" strokeWidth={1.75} />
                      </button>

                      {/* Paperclip in 32x32 hit target */}
                      <button
                        type="button"
                        onClick={() => setShowMediaInput(!showMediaInput)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="Attach file"
                        aria-label="Attach file"
                      >
                        <Paperclip className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>

                    {/* Textarea flex-1 min-h-[32px] max-h-[120px] resize-none bg-transparent */}
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      placeholder={`Message ${activeConversation.participant.fullName}...`}
                      value={messageText}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      className="flex-1 min-h-[32px] max-h-[120px] resize-none bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none py-1.5 px-2 leading-relaxed"
                    />

                    {/* Right Action: empty → Mic in 36x36 bg-emerald-600/20; has text → Send 36x36 bg-emerald-600 */}
                    <div className="shrink-0 flex items-center">
                      {hasContent ? (
                        <button
                          type="button"
                          onClick={() => handleSendMessage()}
                          className="w-9 h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 flex items-center justify-center transition-all active:scale-95 pointer-events-auto cursor-pointer"
                          aria-label="Send message"
                          title="Send message"
                        >
                          <Send className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      ) : (
                        <VoiceRecorder
                          onSendVoice={handleSendVoice}
                          disabled={!activeConversation}
                          onRecordingStateChange={setIsRecordingActive}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/30 space-y-3 select-none">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-emerald-400">
              <Sparkles className="h-8 w-8 text-[#D9A441]" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-bold text-white/90 font-sora">
              Select an African Dialogue
            </h3>
            <p className="text-xs text-white/40 max-w-xs leading-relaxed">
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
