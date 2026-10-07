import React, { useState } from 'react';
import { X, Search, MessageSquare, ArrowLeft } from 'lucide-react';
import { Message } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSelectMessage: (messageId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSelectMessage,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim()
    ? messages.filter(
        (m) =>
          (m.type === 'text' && m.content.toLowerCase().includes(query.toLowerCase())) ||
          (m.caption && m.caption.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const formatTime = (ts: number) => {
    try {
      const d = new Date(ts);
      return new Intl.DateTimeFormat('ar-SA', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(d);
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-pink-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            <h2 className="text-sm font-bold">البحث في محادثات J&E</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 bg-pink-50/70 border-b border-pink-100">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-pink-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن كلمة، ذكرى، رسالة..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-white border border-pink-200 focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {query.trim() === '' ? (
            <p className="text-center py-10 text-xs text-slate-400">
              اكتب كلمة للبحث في رسائل الشات 🌸
            </p>
          ) : results.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-400">
              لم نجد أي رسالة تطابق "{query}"
            </p>
          ) : (
            results.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  onSelectMessage(msg.id);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-white hover:bg-pink-50/80 border border-pink-100 hover:border-pink-300 transition-all cursor-pointer flex items-start gap-2.5"
              >
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-pink-200"
                />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-pink-700">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400">{formatTime(msg.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-snug line-clamp-2">
                    {msg.type === 'text' ? msg.content : msg.caption || 'مرفق وسائط'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
