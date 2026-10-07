export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'sticker';

export interface MessageReply {
  id: string;
  senderName: string;
  content: string;
  type: string;
}

export interface SeenInfo {
  userName: string;
  userAvatar?: string;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: MessageType;
  content: string;
  caption?: string;
  mediaName?: string;
  timestamp: number;
  reactions: Record<string, string>; // userId -> emoji
  seenBy?: Record<string, SeenInfo>; // userId -> SeenInfo
  replyTo?: MessageReply;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: 'J' | 'E' | 'custom';
  statusText: string;
  themeHue: PinkThemeId;
}

export interface ActiveUser {
  id: string;
  name: string;
  avatar: string;
  statusText?: string;
  lastActive: number;
  isTyping?: boolean;
}

export type PinkThemeId = 'rose' | 'blush' | 'barbie' | 'cherry' | 'lavender-pink';

export interface PinkTheme {
  id: PinkThemeId;
  name: string;
  nameAr: string;
  bgGradient: string;
  bubbleSender: string;
  bubbleSenderText: string;
  bubbleReceiver: string;
  accent: string;
  glow: string;
  primaryHex: string;
}
