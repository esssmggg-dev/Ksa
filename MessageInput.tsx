import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Video, 
  Smile, 
  Mic, 
  Square, 
  X, 
  Reply, 
  Loader2,
  Sparkles,
  Paperclip
} from 'lucide-react';
import { Message, MessageReply, PinkTheme } from '../types';
import { CUTE_STICKERS } from '../utils/themes';

interface MessageInputProps {
  theme: PinkTheme;
  replyTo: Message | null;
  onClearReply: () => void;
  onSendMessage: (payload: {
    type: Message['type'];
    content: string;
    caption?: string;
    mediaName?: string;
    replyTo?: MessageReply;
  }) => void;
  onTyping: (isTyping: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  theme,
  replyTo,
  onClearReply,
  onSendMessage,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Pending media attachment preview before sending
  const [pendingMedia, setPendingMedia] = useState<{
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
    caption: string;
  } | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimerRef = useRef<any>(null);

  // Trigger typing notification
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Upload file to server
  const uploadFile = async (file: File): Promise<string> => {
    const base64 = await fileToBase64(file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        dataBase64: base64,
      }),
    });

    if (!res.ok) {
      throw new Error('Upload failed');
    }
    const data = await res.json();
    return data.url;
  };

  // Handle file selections
  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPendingMedia({
      file,
      previewUrl,
      type,
      caption: '',
    });
    // Reset file input
    e.target.value = '';
  };

  // Send pending media
  const handleSendPendingMedia = async () => {
    if (!pendingMedia) return;
    setIsUploading(true);

    try {
      const serverUrl = await uploadFile(pendingMedia.file);
      onSendMessage({
        type: pendingMedia.type,
        content: serverUrl,
        caption: pendingMedia.caption.trim() || undefined,
        mediaName: pendingMedia.file.name,
        replyTo: replyTo
          ? {
              id: replyTo.id,
              senderName: replyTo.senderName,
              content:
                replyTo.type === 'text'
                  ? replyTo.content
                  : replyTo.type === 'image'
                  ? '📷 صورة'
                  : '🎥 مقطع فيديو',
              type: replyTo.type,
            }
          : undefined,
      });

      // Cleanup
      URL.revokeObjectURL(pendingMedia.previewUrl);
      setPendingMedia(null);
      onClearReply();
    } catch (err) {
      alert('حدث خطأ أثناء رفع الملف. يرجى المحاولة مجدداً.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Send plain text message
  const handleSend = () => {
    if (pendingMedia) {
      handleSendPendingMedia();
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    onSendMessage({
      type: 'text',
      content: trimmed,
      replyTo: replyTo
        ? {
            id: replyTo.id,
            senderName: replyTo.senderName,
            content:
              replyTo.type === 'text'
                ? replyTo.content
                : replyTo.type === 'image'
                ? '📷 صورة'
                : '🎥 مقطع فيديو',
            type: replyTo.type,
          }
        : undefined,
    });

    setText('');
    onClearReply();
    onTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Send instant sticker
  const handleSendSticker = (sticker: string) => {
    onSendMessage({
      type: 'sticker',
      content: sticker,
      replyTo: replyTo
        ? {
            id: replyTo.id,
            senderName: replyTo.senderName,
            content: replyTo.content,
            type: replyTo.type,
          }
        : undefined,
    });
    setShowStickers(false);
    onClearReply();
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
          type: 'audio/webm',
        });

        setIsUploading(true);
        try {
          const serverUrl = await uploadFile(audioFile);
          onSendMessage({
            type: 'audio',
            content: serverUrl,
          });
        } catch (err) {
          console.error('Audio upload failed:', err);
        } finally {
          setIsUploading(false);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('لم نتمكن من الوصول إلى الميكروفون. يرجى السماح بصلاحيات الصوت.');
      console.error(err);
    }
  };

  const stopRecording = (discard = false) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (discard) {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      } else {
        mediaRecorderRef.current.stop();
      }
    }
  };

  return (
    <div className="relative z-10 p-3 bg-white/90 backdrop-blur-md border-t border-pink-200/80 shadow-lg">
      <div className="max-w-5xl mx-auto">
        {/* Reply Quote preview bar */}
        {replyTo && (
          <div className="flex items-center justify-between bg-pink-100/90 border border-pink-300/70 rounded-2xl px-3 py-1.5 mb-2 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 overflow-hidden">
              <Reply className="w-4 h-4 text-pink-600 rotate-180 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-pink-700">{replyTo.senderName}: </span>
                <span className="text-slate-600">
                  {replyTo.type === 'text'
                    ? replyTo.content
                    : replyTo.type === 'image'
                    ? '📷 صورة'
                    : '🎥 مقطع فيديو'}
                </span>
              </div>
            </div>
            <button
              onClick={onClearReply}
              className="p-1 text-pink-500 hover:text-pink-800 rounded-full hover:bg-pink-200/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pending Media Preview Dialog */}
        {pendingMedia && (
          <div className="mb-3 p-3 bg-white rounded-2xl border-2 border-pink-300 shadow-md animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-pink-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                معاينة {pendingMedia.type === 'image' ? 'الصورة' : 'المقطع'} قبل الإرسال
              </span>
              <button
                onClick={() => {
                  URL.revokeObjectURL(pendingMedia.previewUrl);
                  setPendingMedia(null);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="w-36 h-36 rounded-xl overflow-hidden bg-black/10 shrink-0 flex items-center justify-center">
                {pendingMedia.type === 'image' ? (
                  <img
                    src={pendingMedia.previewUrl}
                    alt="معاينة"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={pendingMedia.previewUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 w-full flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="أضف تعليقاً لطيفاً (اختياري)..."
                  value={pendingMedia.caption}
                  onChange={(e) =>
                    setPendingMedia({ ...pendingMedia, caption: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl border border-pink-200 focus:outline-hidden focus:border-pink-500 bg-pink-50/50"
                />
                <button
                  onClick={handleSendPendingMedia}
                  disabled={isUploading}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-white shadow-md ${
                    isUploading
                      ? 'bg-pink-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      جاري الرفع والإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 rotate-180" />
                      إرسال الآن 🌸
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stickers / Emoji popup drawer */}
        {showStickers && (
          <div className="mb-2 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-pink-200 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-pink-100 text-xs font-bold text-pink-700">
              <span>ملصقات وردية ولطيفة لـ J&E 🎀</span>
              <button
                onClick={() => setShowStickers(false)}
                className="text-pink-400 hover:text-pink-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-10 gap-2 max-h-36 overflow-y-auto p-1">
              {CUTE_STICKERS.map((stk, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendSticker(stk)}
                  className="text-2xl hover:scale-130 transition-transform p-1 rounded-lg hover:bg-pink-100/60"
                  title="إرسال كملصق"
                >
                  {stk}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice Recording Active Bar */}
        {isRecording ? (
          <div className="flex items-center justify-between bg-rose-50 border-2 border-rose-300 rounded-2xl px-4 py-2.5 animate-pulse">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
              <span>جاري تسجيل رسالة صوتية...</span>
              <span className="font-mono text-sm mr-2">
                {Math.floor(recordingSeconds / 60)}:
                {(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => stopRecording(true)}
                className="p-1.5 text-slate-500 hover:text-rose-700 rounded-lg text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={() => stopRecording(false)}
                className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Send className="w-3 h-3 rotate-180" />
                إرسال التسجيل
              </button>
            </div>
          </div>
        ) : (
          /* Normal Message Input Row */
          <div className="flex items-end gap-1.5 sm:gap-2">
            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleSelectFile(e, 'image')}
            />
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={(e) => handleSelectFile(e, 'video')}
            />

            {/* Media Attachment buttons */}
            <div className="flex items-center gap-0.5">
              {/* Photo button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-2.5 rounded-xl text-pink-600 hover:bg-pink-100/80 transition-all border border-pink-200/60"
                title="إرسال صورة"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Video button */}
              <button
                onClick={() => videoInputRef.current?.click()}
                className="p-2 sm:p-2.5 rounded-xl text-pink-600 hover:bg-pink-100/80 transition-all border border-pink-200/60"
                title="إرسال مقطع فيديو"
              >
                <Video className="w-5 h-5" />
              </button>

              {/* Stickers button */}
              <button
                onClick={() => setShowStickers(!showStickers)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all border border-pink-200/60 ${
                  showStickers
                    ? 'bg-pink-500 text-white'
                    : 'text-pink-600 hover:bg-pink-100/80'
                }`}
                title="ملصقات وإيموجي"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>

            {/* Main Textarea */}
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                rows={1}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك لـ J&E هنا... 🌸"
                className="w-full resize-none max-h-32 min-h-[42px] py-2.5 px-3.5 text-sm rounded-2xl bg-pink-50/70 border border-pink-200 focus:bg-white focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-slate-800 placeholder-pink-400/80 transition-all"
              />
            </div>

            {/* Right button: Send or Voice Record */}
            {text.trim() ? (
              <button
                onClick={handleSend}
                disabled={isUploading}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-300/50 hover:scale-105 active:scale-95 transition-all"
                title="إرسال"
              >
                <Send className="w-5 h-5 rotate-180" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="p-2.5 rounded-2xl text-pink-600 hover:bg-pink-100/80 transition-all border border-pink-200/60"
                title="تسجيل رسالة صوتية"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
