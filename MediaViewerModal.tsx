import React from 'react';
import { X, Download, Maximize, User } from 'lucide-react';

interface MediaViewerModalProps {
  media: {
    url: string;
    type: 'image' | 'video';
    caption?: string;
    senderName: string;
  } | null;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ media, onClose }) => {
  if (!media) return null;

  const handleDownload = async () => {
    try {
      const a = document.createElement('a');
      a.href = media.url;
      a.download = `JE-media-${Date.now()}.${media.type === 'image' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(media.url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 text-white">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          <User className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-semibold">بواسطة {media.senderName}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
            title="تحميل إلى جهازك"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-rose-500 rounded-full text-white backdrop-blur-md transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
        {media.type === 'image' ? (
          <img
            src={media.url}
            alt="صورة مكبرة"
            className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        ) : (
          <video
            src={media.url}
            controls
            autoPlay
            className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl bg-black"
          />
        )}

        {media.caption && (
          <div className="mt-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-white text-xs max-w-lg text-center border border-white/10">
            {media.caption}
          </div>
        )}
      </div>
    </div>
  );
};
