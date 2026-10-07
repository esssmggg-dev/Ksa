import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const app = express();
const server = http.createServer(app);

// Increase body limit for image & video uploads (up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Storage folders
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded media
app.use('/uploads', express.static(UPLOADS_DIR));

// Message data types
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
  type: 'text' | 'image' | 'video' | 'audio' | 'sticker';
  content: string; // text message or media URL/data
  caption?: string;
  mediaName?: string;
  timestamp: number;
  reactions: Record<string, string>; // userId -> emoji
  seenBy?: Record<string, SeenInfo>; // userId -> SeenInfo
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
    type: string;
  };
}

export interface UserPresence {
  id: string;
  name: string;
  avatar: string;
  statusText?: string;
  lastActive: number;
  isTyping?: boolean;
}

// In-memory message store with disk persistence
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
let messages: Message[] = [];

// Seed default welcome message if empty
if (fs.existsSync(MESSAGES_FILE)) {
  try {
    const raw = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    messages = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse messages.json:', err);
    messages = [];
  }
}

if (messages.length === 0) {
  messages = [
    {
      id: 'welcome-1',
      senderId: 'user-j',
      senderName: 'J',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'أهلاً يا صديقي! مرحباً بك في شات J&E الوردي الخاص بنا 🌸💖',
      timestamp: Date.now() - 3600000,
      reactions: { 'user-e': '💖' },
    },
    {
      id: 'welcome-2',
      senderId: 'user-e',
      senderName: 'E',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'يا هلا! نقدر هنا نرسل كل الصور والمقاطع ونسولف بنفس الوقت بكل حب ولون وردي لطيف 🎀✨',
      timestamp: Date.now() - 1800000,
      reactions: { 'user-j': '✨' },
    },
  ];
}

function saveMessagesToDisk() {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save messages to disk:', err);
  }
}

// Connected clients tracking
interface ConnectedClient {
  ws: WebSocket;
  user: UserPresence;
}
const clients = new Map<WebSocket, UserPresence>();

// Setup WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(data: any, excludeWs?: WebSocket) {
  const payload = JSON.stringify(data);
  for (const [clientWs] of clients) {
    if (clientWs.readyState === WebSocket.OPEN && clientWs !== excludeWs) {
      clientWs.send(payload);
    }
  }
}

function getActiveUsersList(): UserPresence[] {
  const userMap = new Map<string, UserPresence>();
  for (const user of clients.values()) {
    if (user.id) {
      userMap.set(user.id, user);
    }
  }
  return Array.from(userMap.values());
}

wss.on('connection', (ws: WebSocket) => {
  // Temporary user representation
  const defaultUser: UserPresence = {
    id: `guest-${Math.random().toString(36).substring(2, 9)}`,
    name: 'صديق J&E',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastActive: Date.now(),
  };
  clients.set(ws, defaultUser);

  // Send initial state: message history and online users
  ws.send(
    JSON.stringify({
      type: 'init',
      messages,
      activeUsers: getActiveUsersList(),
    })
  );

  ws.on('message', (rawData: string) => {
    try {
      const data = JSON.parse(rawData.toString());
      const current = clients.get(ws) || defaultUser;

      switch (data.type) {
        case 'user:join': {
          if (data.user) {
            clients.set(ws, {
              ...data.user,
              lastActive: Date.now(),
            });
            broadcast({
              type: 'presence:update',
              activeUsers: getActiveUsersList(),
            });

            // Automatically mark prior messages as seen by this user
            const readerId = data.user.id;
            const readerName = data.user.name;
            const readerAvatar = data.user.avatar;
            let updatedCount = 0;
            const now = Date.now();
            const updatedMessageIds: string[] = [];

            for (const msg of messages) {
              if (msg.senderId !== readerId) {
                if (!msg.seenBy) msg.seenBy = {};
                if (!msg.seenBy[readerId]) {
                  msg.seenBy[readerId] = {
                    userName: readerName,
                    userAvatar: readerAvatar,
                    timestamp: now,
                  };
                  updatedCount++;
                  updatedMessageIds.push(msg.id);
                }
              }
            }

            if (updatedCount > 0) {
              saveMessagesToDisk();
              broadcast({
                type: 'messages:seen_update',
                readerId,
                readerName,
                readerAvatar,
                timestamp: now,
                messageIds: updatedMessageIds,
              });
            }
          }
          break;
        }

        case 'messages:mark_seen': {
          const readerId = data.readerId || current.id;
          const readerName = data.readerName || current.name;
          const readerAvatar = data.readerAvatar || current.avatar;
          if (!readerId) break;

          let updatedCount = 0;
          const now = Date.now();
          const updatedMessageIds: string[] = [];

          for (const msg of messages) {
            if (msg.senderId !== readerId) {
              if (!msg.seenBy) msg.seenBy = {};
              if (!msg.seenBy[readerId]) {
                msg.seenBy[readerId] = {
                  userName: readerName,
                  userAvatar: readerAvatar,
                  timestamp: now,
                };
                updatedCount++;
                updatedMessageIds.push(msg.id);
              }
            }
          }

          if (updatedCount > 0) {
            saveMessagesToDisk();
            broadcast({
              type: 'messages:seen_update',
              readerId,
              readerName,
              readerAvatar,
              timestamp: now,
              messageIds: updatedMessageIds,
            });
          }
          break;
        }

        case 'user:typing': {
          current.isTyping = Boolean(data.isTyping);
          current.lastActive = Date.now();
          clients.set(ws, current);
          broadcast(
            {
              type: 'user:typing',
              userId: current.id,
              userName: current.name,
              isTyping: Boolean(data.isTyping),
            },
            ws
          );
          break;
        }

        case 'message:send': {
          const msgPayload = data.message;
          if (!msgPayload || !msgPayload.content) return;

          const newMsg: Message = {
            id: msgPayload.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            senderId: current.id,
            senderName: current.name,
            senderAvatar: current.avatar,
            type: msgPayload.type || 'text',
            content: msgPayload.content,
            caption: msgPayload.caption || '',
            mediaName: msgPayload.mediaName,
            timestamp: Date.now(),
            reactions: {},
            replyTo: msgPayload.replyTo,
          };

          // Guard against duplicates
          if (!messages.some((m) => m.id === newMsg.id)) {
            messages.push(newMsg);
            // Keep last 1000 messages in memory
            if (messages.length > 1000) {
              messages = messages.slice(-1000);
            }
            saveMessagesToDisk();
          }

          // Broadcast to everyone (including sender for confirmation/sync)
          broadcast({
            type: 'message:new',
            message: newMsg,
          });
          break;
        }

        case 'message:react': {
          const { messageId, emoji, userId } = data;
          const msg = messages.find((m) => m.id === messageId);
          if (msg) {
            if (!msg.reactions) msg.reactions = {};
            if (msg.reactions[userId] === emoji) {
              delete msg.reactions[userId]; // toggle off
            } else {
              msg.reactions[userId] = emoji;
            }
            saveMessagesToDisk();

            broadcast({
              type: 'message:reaction_update',
              messageId,
              reactions: msg.reactions,
            });
          }
          break;
        }

        case 'message:delete': {
          const { messageId } = data;
          messages = messages.filter((m) => m.id !== messageId);
          saveMessagesToDisk();

          broadcast({
            type: 'message:deleted',
            messageId,
          });
          break;
        }

        case 'chat:clear': {
          messages = [];
          saveMessagesToDisk();
          broadcast({
            type: 'chat:cleared',
          });
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong', time: Date.now() }));
          break;
        }
      }
    } catch (err) {
      console.error('WS error parsing message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcast({
      type: 'presence:update',
      activeUsers: getActiveUsersList(),
    });
  });

  ws.on('error', (err) => {
    console.error('WebSocket connection error:', err);
    clients.delete(ws);
  });
});

// REST API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    activeClients: clients.size,
    messageCount: messages.length,
    timestamp: Date.now(),
  });
});

app.get('/api/messages', (_req, res) => {
  res.json({ messages });
});

// File upload endpoint for photos and videos (Base64 payload)
app.post('/api/upload', (req, res) => {
  try {
    const { fileName, fileType, dataBase64 } = req.body;
    if (!dataBase64 || !fileType) {
      return res.status(400).json({ error: 'Missing file data or file type' });
    }

    // Clean base64 string
    const base64Data = dataBase64.replace(/^data:[^;]+;base64,/, '');
    const extension = fileName
      ? path.extname(fileName)
      : fileType.startsWith('video/')
      ? '.mp4'
      : fileType.startsWith('audio/')
      ? '.webm'
      : '.jpg';

    const safeFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${extension}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const fileUrl = `/uploads/${safeFilename}`;
    return res.json({
      success: true,
      url: fileUrl,
      fileName: fileName || safeFilename,
      fileType,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to save file' });
  }
});

// Delete message endpoint
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  messages = messages.filter((m) => m.id !== id);
  saveMessagesToDisk();
  broadcast({
    type: 'message:deleted',
    messageId: id,
  });
  res.json({ success: true });
});

// Clear all messages
app.delete('/api/messages', (_req, res) => {
  messages = [];
  saveMessagesToDisk();
  broadcast({
    type: 'chat:cleared',
  });
  res.json({ success: true });
});

// IPA file download endpoints
const ipaFilePath = path.join(__dirname, 'public', 'downloads', 'JE-Pink-Chat.ipa');

app.get(['/JE-Pink-Chat.ipa', '/downloads/JE-Pink-Chat.ipa', '/api/download/ipa'], (_req, res) => {
  if (fs.existsSync(ipaFilePath)) {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="JE-Pink-Chat.ipa"');
    return res.sendFile(ipaFilePath);
  }
  return res.status(404).send('IPA file not found');
});

// Project source code zip download endpoint
const zipFilePath = path.join(__dirname, 'public', 'downloads', 'JE-Pink-Chat-Source.zip');

app.get(['/JE-Pink-Chat-Source.zip', '/downloads/JE-Pink-Chat-Source.zip', '/api/download/source'], (_req, res) => {
  if (fs.existsSync(zipFilePath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="JE-Pink-Chat-Source.zip"');
    return res.sendFile(zipFilePath);
  }
  return res.status(404).send('Source zip not found');
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (Boolean(process.env.PORT) && process.env.PORT !== '3000');

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 J&E Pink Chat Server running on port ${PORT}`);
  });
}

startServer();
