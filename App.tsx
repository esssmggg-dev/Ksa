import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Sparkles, 
  ChevronDown, 
  MessageCircle, 
  Users, 
  Send,
  AlertCircle,
  Download,
  Apple,
  FileArchive
} from 'lucide-react';
import { Message, UserProfile, PinkThemeId } from './types';
import { PINK_THEMES, AVATAR_PRESETS } from './utils/themes';
import { useChatSocket } from './hooks/useChatSocket';
import { Header } from './components/Header';
import { MessageItem } from './components/MessageItem';
import { MessageInput } from './components/MessageInput';
import { TypingIndicator } from './components/TypingIndicator';
import { ProfileModal } from './components/ProfileModal';
import { ThemeModal } from './components/ThemeModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { MediaGalleryModal } from './components/MediaGalleryModal';
import { SearchModal } from './components/SearchModal';
import { IosInstallModal } from './components/IosInstallModal';
import { InviteModal } from './components/InviteModal';

// Storage key
const PROFILE_KEY = 'je_pink_chat_profile_v2';

export default function App() {
  // Public URL for friend invitation & iOS installation
  const publicAppUrl =
    typeof window !== 'undefined'
      ? window.location.origin.replace('ais-dev-', 'ais-pre-')
      : 'https://ais-pre-6gg4y2clqdit4pxd3lmtod-585941804250.europe-west1.run.app';

  // Load or initialize user profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    // Check if entered with ?role=E
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get('role');
      if (roleParam === 'E') {
        return {
          id: `user-e-${Math.random().toString(36).substring(2, 7)}`,
          name: 'E',
          avatar: AVATAR_PRESETS[1].url,
          role: 'E',
          statusText: 'دائماً معك بكل حب 🎀',
          themeHue: 'rose',
        };
      }
    }

    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    // Default to 'J'
    return {
      id: `user-j-${Math.random().toString(36).substring(2, 7)}`,
      name: 'J',
      avatar: AVATAR_PRESETS[0].url,
      role: 'J',
      statusText: 'أفضل صديق للأبد 🌸',
      themeHue: 'rose',
    };
  });

  // Current pink theme
  const currentTheme = PINK_THEMES[currentUser.themeHue || 'rose'] || PINK_THEMES.rose;

  // Real-time WebSocket hook
  const {
    messages,
    activeUsers,
    typingUsers,
    isConnected,
    connectionError,
    sendMessage,
    sendTyping,
    reactToMessage,
    deleteMessage,
    clearChat,
    markSeen,
  } = useChatSocket(currentUser);

  // Mark messages as seen when messages change or user opens the app
  useEffect(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      markSeen();
    }
  }, [messages.length, currentUser.id, markSeen]);

  // UI state
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isIosInstallOpen, setIsIosInstallOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  // Media viewer modal state
  const [activeMedia, setActiveMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    caption?: string;
    senderName: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Save profile to local storage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length]);

  // Handle scroll detection for jump-to-bottom button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

  // Quick switch role between J and E
  const handleSwitchUserQuick = (role: 'J' | 'E') => {
    const defaultAvatar =
      role === 'J' ? AVATAR_PRESETS[0].url : AVATAR_PRESETS[1].url;

    const updated: UserProfile = {
      ...currentUser,
      id: `user-${role.toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`,
      name: role,
      avatar: defaultAvatar,
      role,
      statusText: role === 'J' ? 'أفضل صديق للأبد 🌸' : 'دائماً معك بكل حب 🎀',
    };
    setCurrentUser(updated);
  };

  // Save updated profile
  const handleSaveProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
  };

  // Change pink theme
  const handleSelectTheme = (themeId: PinkThemeId) => {
    setCurrentUser((prev) => ({
      ...prev,
      themeHue: themeId,
    }));
  };

  // Jump to specific searched message
  const handleSelectSearchedMessage = (messageId: string) => {
    const el = document.getElementById(`msg-container-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-pink-200/50', 'transition-colors', 'duration-500');
      setTimeout(() => {
        el.classList.remove('bg-pink-200/50');
      }, 2000);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden bg-gradient-to-b ${currentTheme.bgGradient} font-['Cairo'] antialiased`}
      dir="rtl"
    >
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        activeUsers={activeUsers}
        isConnected={isConnected}
        theme={currentTheme}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenTheme={() => setIsThemeOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenInvite={() => setIsInviteOpen(true)}
        onOpenIosInstall={() => setIsIosInstallOpen(true)}
        onClearChat={clearChat}
        onSwitchUserQuick={handleSwitchUserQuick}
      />

      {/* Prominent Quick Download Bar */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 text-white px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs z-10 animate-fadeIn border-b border-pink-400/40">
        <div className="flex items-center gap-1.5 font-bold">
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>تحميل ملفات المشروع لجهازك:</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/JE-Pink-Chat-Source.zip"
            download="JE-Pink-Chat-Source.zip"
            className="bg-white text-pink-700 hover:bg-pink-50 font-bold px-2.5 py-1 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1 text-[11px]"
          >
            <FileArchive className="w-3.5 h-3.5 text-pink-600" />
            <span>تحميل ملف الموقع (ZIP)</span>
          </a>
          <a
            href="/JE-Pink-Chat.ipa"
            download="JE-Pink-Chat.ipa"
            className="bg-black/20 hover:bg-black/30 text-white font-bold px-2.5 py-1 rounded-xl transition-transform active:scale-95 flex items-center gap-1 border border-white/30 text-[11px]"
          >
            <Apple className="w-3.5 h-3.5" />
            <span>تحميل الآيفون (IPA)</span>
          </a>
        </div>
      </div>

      {/* Connection warning bar if disconnected */}
      {connectionError && (
        <div className="bg-rose-500/90 text-white text-xs px-4 py-1.5 flex items-center justify-center gap-2 font-medium shadow-inner animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{connectionError}</span>
        </div>
      )}

      {/* Chat Messages Body */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-1 relative"
      >
        <div className="max-w-5xl mx-auto flex flex-col justify-end min-h-full">
          {/* Welcome Card for J&E */}
          <div className="text-center my-6 p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-pink-200/80 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-400 via-rose-300 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Heart className="w-8 h-8 text-white fill-white animate-pulse" />
            </div>
            <h2 className="text-xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent">
              شات J&E الوردي
            </h2>
            <p className="text-xs text-pink-800/80 mt-1.5 leading-relaxed font-medium">
              مساحة خاصة بينك وبين صديقك لإرسال الرسائل، الصور، ومقاطع الفيديو بنفس الوقت وبشكل فوري 🌸✨
            </p>

            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-pink-100 text-[11px] text-pink-600 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> بث فوري مباشر
              </span>
              <span>•</span>
              <span>📷 صور ومقاطع</span>
              <span>•</span>
              <span>🎀 لون وردي مميز</span>
            </div>
          </div>

          {/* Messages list */}
          {messages.map((message) => (
            <div id={`msg-container-${message.id}`} key={message.id} className="rounded-2xl transition-colors">
              <MessageItem
                message={message}
                isOwn={message.senderId === currentUser.id}
                theme={currentTheme}
                currentUserId={currentUser.id}
                onReact={reactToMessage}
                onReply={(msg) => setReplyingMessage(msg)}
                onDelete={deleteMessage}
                onOpenMedia={(media) => setActiveMedia(media)}
              />
            </div>
          ))}

          {/* Typing Indicator */}
          <TypingIndicator typingUsers={typingUsers} />

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Jump to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-20 left-6 z-30 p-2.5 rounded-full bg-pink-500 text-white shadow-lg hover:bg-pink-600 transition-all active:scale-90 flex items-center justify-center"
          title="الانتقال إلى آخر الرسائل"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Message Input Dock */}
      <MessageInput
        theme={currentTheme}
        replyTo={replyingMessage}
        onClearReply={() => setReplyingMessage(null)}
        onSendMessage={sendMessage}
        onTyping={sendTyping}
      />

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
      />

      <ThemeModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentThemeId={currentUser.themeHue || 'rose'}
        onSelectTheme={handleSelectTheme}
      />

      <MediaViewerModal
        media={activeMedia}
        onClose={() => setActiveMedia(null)}
      />

      <MediaGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        messages={messages}
        onSelectMedia={(media) => {
          setIsGalleryOpen(false);
          setActiveMedia(media);
        }}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        messages={messages}
        onSelectMessage={handleSelectSearchedMessage}
      />

      <IosInstallModal
        isOpen={isIosInstallOpen}
        onClose={() => setIsIosInstallOpen(false)}
        publicAppUrl={publicAppUrl}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        publicAppUrl={publicAppUrl}
      />
    </div>
  );
}
