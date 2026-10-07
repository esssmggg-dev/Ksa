import React from 'react';

interface TypingIndicatorProps {
  typingUsers: Record<string, { name: string; timestamp: number }>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  const users = Object.values(typingUsers);
  if (users.length === 0) return null;

  const names = users.map((u) => u.name).join(' و ');

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-pink-600 animate-fadeIn">
      <div className="flex items-center gap-1 bg-pink-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-pink-200/60 shadow-xs">
        <span className="font-semibold text-pink-700">{names}</span>
        <span>يكتب الآن</span>
        <div className="flex items-center gap-1 mr-1">
          <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};
