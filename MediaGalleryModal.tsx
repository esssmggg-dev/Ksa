import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, Film, Download } from 'lucide-react';
import { Message } from '../types';

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSelectMedia: (media: {
    url: string;
    type: 'image' | 'video';
    caption?: string;
    senderName: string;
  }) => void;
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSelectMedia,
}) => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  if (!isOpen) return null;

  // Filter media messages
  const mediaMessages = messages.filter(
    (m) => (m.type === 'image' || m.type === 'video') && m.content
  );

  const filtered = mediaMessages.filter((m) => {
    if (filter === 'all') return true;
    return m.type === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-pink-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-sm font-bold">ألبوم ذكريات J&E 🎀</h2>
              <p className="text-[11px] text-pink-100">
                {mediaMessages.length} صورة ومقطع مشترك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="p-3 bg-pink-50/70 border-b border-pink-100 flex items-center justify-center gap-2 shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-pink-700 hover:bg-pink-100'
            }`}
          >
            الكل ({mediaMessages.length})
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              filter === 'image'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-pink-700 hover:bg-pink-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            الصور ({mediaMessages.filter((m) => m.type === 'image').length})
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              filter === 'video'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-pink-700 hover:bg-pink-100'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            المقاطع ({mediaMessages.filter((m) => m.type === 'video').length})
          </button>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Film className="w-12 h-12 mx-auto text-pink-300/80 mb-2 stroke-1" />
              <p className="text-xs font-semibold text-pink-600">
                لا توجد صور أو مقاطع مرسلة حتى الآن
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                شارك أول صورة أو مقطع فيديو مع صديقك! 🌸
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() =>
                    onSelectMedia({
                      url: msg.content,
                      type: msg.type as 'image' | 'video',
                      caption: msg.caption,
                      senderName: msg.senderName,
                    })
                  }
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-pointer border border-pink-100 hover:shadow-lg transition-all"
                >
                  {msg.type === 'image' ? (
                    <img
                      src={msg.content}
                      alt="صورة"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                      <video
                        src={msg.content}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="p-2.5 rounded-full bg-pink-500/80 text-white shadow-md">
                          <Video className="w-5 h-5" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hover Caption Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-bold truncate">{msg.senderName}</p>
                    {msg.caption && <p className="truncate opacity-80">{msg.caption}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
