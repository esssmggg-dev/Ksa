import React, { useState } from 'react';
import { 
  Heart, 
  Smile, 
  Reply, 
  Trash2, 
  Copy, 
  CheckCheck, 
  Play, 
  Pause, 
  Maximize2,
  Volume2,
  Download
} from 'lucide-react';
import { Message, PinkTheme } from '../types';
import { QUICK_REACTIONS } from '../utils/themes';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  theme: PinkTheme;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onOpenMedia: (media: { url: string; type: 'image' | 'video'; caption?: string; senderName: string }) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  theme,
  currentUserId,
  onReact,
  onReply,
  onDelete,
  onOpenMedia,
}) => {
  const [showReactionBar, setShowReactionBar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Format timestamp in Arabic
  const formatTime = (ts: number) => {
    try {
      const date = new Date(ts);
      return new Intl.DateTimeFormat('ar-SA', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    } catch {
      return '';
    }
  };

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Group reactions by emoji
  const reactionCounts: Record<string, number> = {};
  let userReactedEmoji: string | null = null;
  if (message.reactions) {
    for (const [userId, emoji] of Object.entries(message.reactions)) {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
      if (userId === currentUserId) {
        userReactedEmoji = emoji;
      }
    }
  }

  // Check Seen status by others (excluding own user)
  const seenByOthers = message.seenBy
    ? Object.entries(message.seenBy).filter(([userId]) => userId !== currentUserId)
    : [];
  const isSeen = seenByOthers.length > 0;
  const firstSeen = isSeen ? seenByOthers[0][1] : null;

  // Audio note handling
  const handleToggleAudio = () => {
    const audioEl = document.getElementById(`audio-${message.id}`) as HTMLAudioElement;
    if (!audioEl) return;

    if (isPlayingAudio) {
      audioEl.pause();
      setIsPlayingAudio(false);
    } else {
      audioEl.play().catch(console.error);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div
      className={`group relative flex gap-2.5 my-2.5 max-w-[90%] sm:max-w-[78%] transition-all ${
        isOwn ? 'mr-auto flex-row-reverse' : 'ml-auto flex-row'
      }`}
      onMouseEnter={() => setShowReactionBar(true)}
      onMouseLeave={() => setShowReactionBar(false)}
    >
      {/* Sender Avatar */}
      <div className="shrink-0 self-end mb-1">
        <img
          src={message.senderAvatar}
          alt={message.senderName}
          className="w-8 h-8 rounded-full object-cover border-2 border-pink-200/90 shadow-xs"
          title={message.senderName}
        />
      </div>

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Name label */}
        <span className="text-[11px] font-bold text-pink-700/80 mb-0.5 px-1 flex items-center gap-1">
          {message.senderName}
          {isOwn && <span className="text-[9px] font-medium text-pink-400">(أنت)</span>}
        </span>

        {/* Message Bubble Container */}
        <div className="relative">
          {/* Floating Action Bar on hover/focus */}
          <div
            className={`absolute -top-9 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full shadow-md border border-pink-200 transition-opacity duration-200 ${
              isOwn ? 'left-0' : 'right-0'
            } ${showReactionBar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          >
            {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(message.id, emoji)}
                className={`p-1 text-sm hover:scale-125 transition-transform ${
                  userReactedEmoji === emoji ? 'bg-pink-100 rounded-full' : ''
                }`}
                title={`تفاعل بـ ${emoji}`}
              >
                {emoji}
              </button>
            ))}

            <div className="w-[1px] h-3.5 bg-pink-200 mx-0.5" />

            <button
              onClick={() => onReply(message)}
              className="p-1 text-pink-500 hover:text-pink-700 hover:scale-110 transition-transform"
              title="رد على الرسالة"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>

            {message.type === 'text' && (
              <button
                onClick={handleCopy}
                className="p-1 text-pink-500 hover:text-pink-700 hover:scale-110 transition-transform"
                title={copied ? 'تم النسخ!' : 'نسخ النص'}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}

            {isOwn && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 text-rose-500 hover:text-rose-700 hover:scale-110 transition-transform"
                title="حذف الرسالة للجميع"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bubble content */}
          <div
            className={`relative rounded-3xl px-4 py-2.5 shadow-sm transition-all overflow-hidden ${
              isOwn
                ? `${theme.bubbleSender} rounded-br-xs`
                : `${theme.bubbleReceiver} rounded-bl-xs`
            }`}
          >
            {/* Reply quote header if replying */}
            {message.replyTo && (
              <div
                className={`mb-2 p-2 rounded-xl text-xs border-r-3 ${
                  isOwn
                    ? 'bg-black/10 border-white/70 text-white/90'
                    : 'bg-pink-50 border-pink-400 text-pink-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1 text-[11px]">
                  <Reply className="w-3 h-3 rotate-180" />
                  <span>{message.replyTo.senderName}</span>
                </div>
                <div className="line-clamp-1 opacity-80 text-[11px] mt-0.5">
                  {message.replyTo.content}
                </div>
              </div>
            )}

            {/* TYPE: Text */}
            {message.type === 'text' && (
              <div>
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words dir-auto">
                  {message.content}
                </p>
                {message.content.includes('.ipa') && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-white/95 text-slate-800 border border-pink-200 shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-xl shadow-xs">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">JE-Pink-Chat.ipa</div>
                        <div className="text-[10px] text-pink-600 font-semibold">1.29 MB • حزمة تطبيق الآيفون</div>
                      </div>
                    </div>
                    <a
                      href="/JE-Pink-Chat.ipa"
                      download="JE-Pink-Chat.ipa"
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* TYPE: Image */}
            {message.type === 'image' && (
              <div className="flex flex-col gap-2">
                <div
                  className="relative group/media cursor-pointer rounded-2xl overflow-hidden bg-pink-950/10 border border-white/20"
                  onClick={() =>
                    onOpenMedia({
                      url: message.content,
                      type: 'image',
                      caption: message.caption,
                      senderName: message.senderName,
                    })
                  }
                >
                  <img
                    src={message.content}
                    alt="صورة مرسلة"
                    className="max-h-80 w-auto max-w-full rounded-2xl object-cover hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2 bg-white/80 rounded-full text-pink-600 shadow-md">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                {message.caption && (
                  <p className="text-xs font-medium px-1 leading-snug">{message.caption}</p>
                )}
              </div>
            )}

            {/* TYPE: Video */}
            {message.type === 'video' && (
              <div className="flex flex-col gap-2">
                <div className="relative rounded-2xl overflow-hidden bg-black/80 max-w-sm border border-white/20">
                  <video
                    src={message.content}
                    controls
                    preload="metadata"
                    className="max-h-72 w-full rounded-2xl object-contain bg-black"
                  />
                </div>
                {message.caption && (
                  <p className="text-xs font-medium px-1 leading-snug">{message.caption}</p>
                )}
              </div>
            )}

            {/* TYPE: Voice Note / Audio */}
            {message.type === 'audio' && (
              <div className="flex items-center gap-3 min-w-[200px] py-1">
                <audio
                  id={`audio-${message.id}`}
                  src={message.content}
                  onTimeUpdate={(e) => {
                    const audio = e.currentTarget;
                    if (audio.duration) {
                      setAudioProgress((audio.currentTime / audio.duration) * 100);
                    }
                  }}
                  onEnded={() => {
                    setIsPlayingAudio(false);
                    setAudioProgress(0);
                  }}
                />
                <button
                  onClick={handleToggleAudio}
                  className={`p-2.5 rounded-full shadow-md transition-transform active:scale-95 ${
                    isOwn
                      ? 'bg-white text-pink-600'
                      : 'bg-pink-500 text-white'
                  }`}
                >
                  {isPlayingAudio ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold opacity-90">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> تسجيل صوتي
                    </span>
                  </div>
                  {/* Waveform track */}
                  <div className="w-full bg-black/15 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 ${
                        isOwn ? 'bg-white' : 'bg-pink-500'
                      }`}
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TYPE: Sticker */}
            {message.type === 'sticker' && (
              <div className="text-5xl py-1 animate-bounce [animation-iteration-count:2]">
                {message.content}
              </div>
            )}

            {/* Timestamp & status ticks */}
            <div
              className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                isOwn ? 'text-white/85' : 'text-slate-400'
              }`}
            >
              <span>{formatTime(message.timestamp)}</span>
              {isOwn && (
                <span
                  className="flex items-center gap-0.5"
                  title={
                    isSeen && firstSeen
                      ? `تم العرض بواسطة ${firstSeen.userName} في ${formatTime(firstSeen.timestamp)}`
                      : 'تم الإرسال'
                  }
                >
                  <CheckCheck
                    className={`w-3.5 h-3.5 transition-all ${
                      isSeen ? 'text-pink-100 drop-shadow-xs font-bold' : 'text-white/60'
                    }`}
                  />
                  {isSeen && (
                    <span className="text-[9px] font-bold text-pink-100/95 tracking-tight">
                      تم العرض
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Seen Status Info Pill below bubble for sender */}
          {isOwn && isSeen && firstSeen && (
            <div className="flex items-center justify-end gap-1.5 mt-0.5 px-1 text-[10px] text-pink-600/90 font-semibold animate-fadeIn select-none">
              {firstSeen.userAvatar && (
                <img
                  src={firstSeen.userAvatar}
                  alt={firstSeen.userName}
                  className="w-3.5 h-3.5 rounded-full object-cover border border-pink-300 shadow-xs"
                />
              )}
              <span className="text-pink-600 flex items-center gap-1">
                <span>تم العرض بواسطة {firstSeen.userName}</span>
                <span className="text-pink-400 font-normal">({formatTime(firstSeen.timestamp)})</span>
              </span>
            </div>
          )}

          {/* Reaction badges pill below bubble */}
          {Object.keys(reactionCounts).length > 0 && (
            <div
              className={`absolute -bottom-3 flex items-center gap-1 z-10 ${
                isOwn ? 'left-2' : 'right-2'
              }`}
            >
              <div className="flex items-center bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-pink-200 shadow-xs text-xs gap-1 hover:scale-105 transition-transform cursor-pointer">
                {Object.entries(reactionCounts).map(([emoji, count]) => (
                  <span
                    key={emoji}
                    onClick={() => onReact(message.id, emoji)}
                    className="flex items-center gap-0.5"
                  >
                    <span>{emoji}</span>
                    {count > 1 && (
                      <span className="text-[10px] font-bold text-pink-700">{count}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
