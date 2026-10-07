import { PinkTheme, PinkThemeId } from '../types';

export const PINK_THEMES: Record<PinkThemeId, PinkTheme> = {
  rose: {
    id: 'rose',
    name: 'Rose Quartz',
    nameAr: 'وردي كلاسيكي رقيق',
    bgGradient: 'from-pink-50 via-rose-50 to-pink-100',
    bubbleSender: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200/50',
    bubbleSenderText: 'text-white',
    bubbleReceiver: 'bg-white/95 text-slate-800 border border-pink-100 shadow-sm',
    accent: 'text-pink-600',
    glow: 'shadow-pink-300/40',
    primaryHex: '#ec4899',
  },
  blush: {
    id: 'blush',
    name: 'Peach Blush',
    nameAr: 'وردي خوخي دافئ',
    bgGradient: 'from-rose-50 via-orange-50/30 to-pink-100',
    bubbleSender: 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-rose-200/50',
    bubbleSenderText: 'text-white',
    bubbleReceiver: 'bg-white/95 text-slate-800 border border-rose-100 shadow-sm',
    accent: 'text-rose-500',
    glow: 'shadow-rose-300/40',
    primaryHex: '#f43f5e',
  },
  barbie: {
    id: 'barbie',
    name: 'Barbie Glow',
    nameAr: 'وردي باربي زاهي',
    bgGradient: 'from-pink-100 via-fuchsia-50 to-pink-200',
    bubbleSender: 'bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white shadow-pink-300/60',
    bubbleSenderText: 'text-white',
    bubbleReceiver: 'bg-white/95 text-slate-800 border border-pink-200 shadow-sm',
    accent: 'text-pink-700',
    glow: 'shadow-pink-400/50',
    primaryHex: '#db2777',
  },
  cherry: {
    id: 'cherry',
    name: 'Cherry Blossom',
    nameAr: 'وردي كرزي شاعري',
    bgGradient: 'from-pink-50 via-red-50/20 to-rose-100',
    bubbleSender: 'bg-gradient-to-r from-rose-500 to-red-400 text-white shadow-rose-300/50',
    bubbleSenderText: 'text-white',
    bubbleReceiver: 'bg-white/95 text-slate-800 border border-rose-100 shadow-sm',
    accent: 'text-rose-600',
    glow: 'shadow-rose-400/40',
    primaryHex: '#e11d48',
  },
  'lavender-pink': {
    id: 'lavender-pink',
    name: 'Pastel Dream',
    nameAr: 'وردي لافندر حالم',
    bgGradient: 'from-purple-50 via-pink-50 to-pink-100',
    bubbleSender: 'bg-gradient-to-r from-pink-500 to-purple-400 text-white shadow-purple-200/50',
    bubbleSenderText: 'text-white',
    bubbleReceiver: 'bg-white/95 text-slate-800 border border-purple-100 shadow-sm',
    accent: 'text-pink-600',
    glow: 'shadow-purple-300/40',
    primaryHex: '#d946ef',
  },
};

export const AVATAR_PRESETS = [
  {
    id: 'j-default',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    label: 'J (افتراضي)',
  },
  {
    id: 'e-default',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    label: 'E (افتراضي)',
  },
  {
    id: 'cute-girl',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    label: 'ابتسامة وردية',
  },
  {
    id: 'cool-boy',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    label: 'شاب لطيف',
  },
  {
    id: 'anime-cat',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80',
    label: 'قطة لطيفة',
  },
  {
    id: 'flowers',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&auto=format&fit=crop&q=80',
    label: 'أزهار وردية',
  },
];

export const CUTE_STICKERS = [
  '💖', '🌸', '🎀', '🧸', '💌', '✨', '🍓', '🌷', '🧁', '🫂',
  '🥰', '🥺', '🌹', '🦋', '🍰', '💐', '🦄', '🕊️', '🍬', '💞'
];

export const QUICK_REACTIONS = ['💖', '🌸', '✨', '🥰', '😂', '🥺', '💌', '🔥'];
