import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, UserProfile, ActiveUser } from '../types';
import { sounds } from '../utils/audio';

export function useChatSocket(currentUser: UserProfile) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; timestamp: number }>>({});
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const pingIntervalRef = useRef<any>(null);
  const currentUserRef = useRef<UserProfile>(currentUser);
  currentUserRef.current = currentUser;

  // Initialize and maintain WebSocket connection
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Determine WS protocol and URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);

        // Announce user presence
        ws.send(
          JSON.stringify({
            type: 'user:join',
            user: {
              id: currentUserRef.current.id,
              name: currentUserRef.current.name,
              avatar: currentUserRef.current.avatar,
              statusText: currentUserRef.current.statusText,
              lastActive: Date.now(),
            },
          })
        );

        // Heartbeat keepalive
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'init': {
              if (Array.isArray(data.messages)) {
                setMessages(data.messages);
              }
              if (Array.isArray(data.activeUsers)) {
                setActiveUsers(data.activeUsers);
              }
              break;
            }

            case 'presence:update': {
              if (Array.isArray(data.activeUsers)) {
                setActiveUsers(data.activeUsers);
              }
              break;
            }

            case 'user:typing': {
              const { userId, userName, isTyping } = data;
              setTypingUsers((prev) => {
                const next = { ...prev };
                if (isTyping && userId !== currentUserRef.current.id) {
                  next[userId] = { name: userName, timestamp: Date.now() };
                } else {
                  delete next[userId];
                }
                return next;
              });
              break;
            }

            case 'message:new': {
              const newMsg: Message = data.message;
              setMessages((prev) => {
                // Deduplicate check
                if (prev.some((m) => m.id === newMsg.id)) {
                  return prev;
                }
                return [...prev, newMsg];
              });

              // Play sound
              if (newMsg.senderId === currentUserRef.current.id) {
                sounds.playSend();
              } else {
                sounds.playReceive();
                // If viewing chat, immediately mark as seen
                if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(
                      JSON.stringify({
                        type: 'messages:mark_seen',
                        readerId: currentUserRef.current.id,
                        readerName: currentUserRef.current.name,
                        readerAvatar: currentUserRef.current.avatar,
                      })
                    );
                  }
                }
              }
              break;
            }

            case 'messages:seen_update': {
              const { readerId, readerName, readerAvatar, timestamp, messageIds } = data;
              const idSet = new Set(messageIds || []);
              setMessages((prev) =>
                prev.map((msg) => {
                  if (idSet.has(msg.id)) {
                    return {
                      ...msg,
                      seenBy: {
                        ...(msg.seenBy || {}),
                        [readerId]: {
                          userName: readerName,
                          userAvatar: readerAvatar,
                          timestamp,
                        },
                      },
                    };
                  }
                  return msg;
                })
              );
              break;
            }

            case 'message:reaction_update': {
              const { messageId, reactions } = data;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === messageId ? { ...msg, reactions } : msg
                )
              );
              sounds.playHeart();
              break;
            }

            case 'message:deleted': {
              const { messageId } = data;
              setMessages((prev) => prev.filter((m) => m.id !== messageId));
              break;
            }

            case 'chat:cleared': {
              setMessages([]);
              break;
            }

            case 'pong':
              break;
          }
        } catch (err) {
          console.error('Error handling WS message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        // Schedule auto reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        setConnectionError('جاري إعادة الاتصال بالسيرفر...');
      };
    } catch (err: any) {
      setConnectionError(err.message || 'خطأ في الاتصال');
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  }, []);

  // Connect on mount & cleanup on unmount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Clean stale typing indicators every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [id, item] of Object.entries(next)) {
          if (now - item.timestamp > 4000) {
            delete next[id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update presence when user profile changes
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'user:join',
          user: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            statusText: currentUser.statusText,
            lastActive: Date.now(),
          },
        })
      );
    }
  }, [currentUser]);

  // Send message action
  const sendMessage = useCallback(
    (payload: {
      type: Message['type'];
      content: string;
      caption?: string;
      mediaName?: string;
      replyTo?: Message['replyTo'];
    }) => {
      const tempId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const messageData: Message = {
        id: tempId,
        senderId: currentUserRef.current.id,
        senderName: currentUserRef.current.name,
        senderAvatar: currentUserRef.current.avatar,
        type: payload.type,
        content: payload.content,
        caption: payload.caption,
        mediaName: payload.mediaName,
        timestamp: Date.now(),
        reactions: {},
        replyTo: payload.replyTo,
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'message:send',
            message: messageData,
          })
        );
      } else {
        // Fallback optimistic display if network lag
        setMessages((prev) => [...prev, messageData]);
      }
    },
    []
  );

  // Send typing notification
  const sendTyping = useCallback((isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'user:typing',
          isTyping,
        })
      );
    }
  }, []);

  // Send reaction
  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'message:react',
            messageId,
            emoji,
            userId: currentUserRef.current.id,
          })
        );
      }
    },
    []
  );

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'message:delete',
          messageId,
        })
      );
    }
  }, []);

  // Clear chat
  const clearChat = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat:clear',
        })
      );
    }
  }, []);

  // Mark messages as seen by current user
  const markSeen = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'messages:mark_seen',
          readerId: currentUserRef.current.id,
          readerName: currentUserRef.current.name,
          readerAvatar: currentUserRef.current.avatar,
        })
      );
    }
  }, []);

  // Listen to visibility change & focus to mark seen when tab is active
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        markSeen();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    // Initial trigger
    const t = setTimeout(() => {
      markSeen();
    }, 800);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      clearTimeout(t);
    };
  }, [markSeen, currentUser.id]);

  return {
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
  };
}
