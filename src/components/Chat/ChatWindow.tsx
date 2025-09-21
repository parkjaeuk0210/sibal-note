import { useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useStoreMode } from '../../contexts/StoreProvider';
import { useSharedCanvasStore } from '../../store/sharedCanvasStore';
import { useAuth } from '../../contexts/AuthContext';

const formatTime = (timestamp: number) => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getInitials = (name?: string, fallback?: string) => {
  const source = name?.trim() || fallback?.trim();
  if (!source) {
    return 'U';
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return source.slice(0, 1).toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const fallbackAvatarColors = ['#6366f1', '#ec4899', '#06b6d4', '#f97316', '#22c55e'];

export const ChatWindow = () => {
  const { user, loading: authLoading } = useAuth();
  const { isSharedMode } = useStoreMode();
  const canvasId = useSharedCanvasStore((state) => state.canvasId);
  const participants = useSharedCanvasStore((state) => state.participants);

  const messages = useChatStore((state) => state.messages);
  const isOpen = useChatStore((state) => state.isOpen);
  const toggleOpen = useChatStore((state) => state.toggleOpen);
  const initializeChat = useChatStore((state) => state.initialize);
  const cleanupChat = useChatStore((state) => state.cleanup);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isLoading = useChatStore((state) => state.isLoading);
  const isSending = useChatStore((state) => state.isSending);
  const chatMode = useChatStore((state) => state.mode);
  const error = useChatStore((state) => state.error);
  const unreadCount = useChatStore((state) => state.unreadCount);

  const [draft, setDraft] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canUseSharedChat = isSharedMode && !!canvasId;
  const isChatActive = chatMode === 'shared' && canUseSharedChat;
  const canSendMessage = isChatActive && !!user?.uid;

  useEffect(() => {
    if (canUseSharedChat) {
      initializeChat({ mode: 'shared', chatId: canvasId });
    } else {
      initializeChat({ mode: 'inactive', chatId: null });
    }

    return () => {
      cleanupChat();
    };
  }, [canUseSharedChat, canvasId, initializeChat, cleanupChat]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const container = messageListRef.current;
    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages, isOpen]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    const maxHeight = 120;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [draft]);

  const placeholder = useMemo(() => {
    if (!isChatActive) {
      return '공유 캔버스를 열면 대화할 수 있어요.';
    }
    if (!user?.uid) {
      return authLoading ? '계정 정보를 확인하는 중입니다…' : '로그인 후 메시지를 보낼 수 있어요.';
    }
    return '메시지를 입력하세요…';
  }, [authLoading, isChatActive, user?.uid]);

  const handleSend = async () => {
    if (!draft.trim()) {
      return;
    }

    await sendMessage(draft, {
      userId: user?.uid,
      displayName: user?.displayName || user?.email || '익명 사용자',
      photoURL: user?.photoURL,
    });

    setDraft('');
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    await handleSend();
  };

  const renderMessages = () => {
    if (!isChatActive) {
      return (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-400 dark:text-gray-500">
          공유 캔버스에서 여러 명이 함께 접속하면 카톡처럼 바로 대화할 수 있어요.
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">
          불러오는 중…
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">
          아직 메시지가 없어요. 첫 메시지를 남겨보세요!
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {messages.map((message, index) => {
          const isOwn = !!user && message.userId === user.uid;
          const participant = participants?.[message.userId];
          const displayName = message.displayName
            || participant?.displayName
            || participant?.email
            || '익명 사용자';
          const avatarUrl = message.photoURL || participant?.photoURL;
          const avatarColor = participant?.color
            || fallbackAvatarColors[index % fallbackAvatarColors.length];

          const initials = getInitials(displayName, message.userId);

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwn ? 'flex-row-reverse text-right' : 'flex-row'}`}
            >
              <div className="flex flex-shrink-0 items-start">
                <div
                  className="relative h-9 w-9 overflow-hidden rounded-full border border-white/40 shadow-sm"
                  style={{
                    backgroundColor: avatarUrl ? undefined : `${avatarColor}20`,
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-full w-full items-center justify-center text-sm font-semibold text-white"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </span>
                  )}
                </div>
              </div>
              <div className={`flex max-w-[78%] flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    {displayName}
                  </span>
                  <span>{formatTime(message.createdAt)}</span>
                </div>
                <div
                  className={`w-full rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isOwn
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[10000] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="pointer-events-auto flex w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-2xl shadow-gray-900/10 backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900">
          <div className="flex items-center justify-between px-4 py-3 bg-blue-500 text-white">
            <div>
              <p className="text-sm font-semibold">채팅</p>
              <p className="text-xs text-white/80">실시간으로 대화하세요</p>
            </div>
            <button
              type="button"
              onClick={toggleOpen}
              className="rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="채팅 닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            ref={messageListRef}
            className="max-h-[65vh] min-h-[260px] overflow-y-auto px-4 py-5 [scrollbar-width:thin]"
          >
            {renderMessages()}
          </div>

          <div className="border-t border-gray-200/70 bg-gray-50/60 px-4 py-3 dark:border-gray-700/60 dark:bg-gray-900">
            {error && (
              <div className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                className="w-full resize-none rounded-2xl border border-gray-200/70 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder={placeholder}
                disabled={!canSendMessage || isSending}
                aria-label="메시지 입력"
              />
              <div className="flex items-center justify-between gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span className="truncate">
                  {isChatActive
                    ? (user?.uid ? 'Enter 키로 전송, Shift+Enter로 줄바꿈' : '로그인 후 대화를 보낼 수 있어요.')
                    : '공유 캔버스 참여자와 대화할 수 있어요.'}
                </span>
                <button
                  type="submit"
                  disabled={!canSendMessage || !draft.trim() || isSending}
                  className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    !canSendMessage || !draft.trim() || isSending
                      ? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isSending ? '전송 중…' : '전송'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className={`pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transition transform ${
          isOpen ? 'scale-95 shadow-xl' : 'hover:scale-105 hover:shadow-xl'
        }`}
        aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8h10M7 12h6m7-2a9 9 0 11-17.94 3.5L3 21l3.5-.06A9 9 0 0120 10z"
          />
        </svg>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1.5 -right-1.5 inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
