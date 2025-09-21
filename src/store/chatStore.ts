import { create } from 'zustand';
import { ChatMessage, ChatMode } from '../types/chat';
import { FirebaseChatMessage } from '../types/firebase';
import { 
  subscribeToSharedChatMessages,
  sendSharedChatMessage,
} from '../lib/sharedCanvas';

interface ChatInitializeOptions {
  mode: ChatMode;
  chatId: string | null;
}

interface ChatSenderMeta {
  userId?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface ChatStoreState {
  messages: ChatMessage[];
  mode: ChatMode;
  chatId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  unreadCount: number;
  unsubscribe: (() => void) | null;
  initialize: (options: ChatInitializeOptions) => void;
  sendMessage: (content: string, meta: ChatSenderMeta) => Promise<void>;
  toggleOpen: () => void;
  cleanup: () => void;
}

const normalizeChatMessages = (records: Record<string, FirebaseChatMessage>): ChatMessage[] => {
  return Object.entries(records)
    .map(([id, message]) => ({
      id: message.id ?? id,
      userId: message.userId,
      content: message.content,
      createdAt: message.createdAt ?? 0,
      displayName: message.displayName,
      photoURL: message.photoURL,
    }))
    .sort((a, b) => a.createdAt - b.createdAt);
};

export const useChatStore = create<ChatStoreState>((set, get) => ({
  messages: [],
  mode: 'inactive',
  chatId: null,
  isOpen: false,
  isLoading: false,
  isSending: false,
  error: null,
  unreadCount: 0,
  unsubscribe: null,

  initialize: ({ mode, chatId }: ChatInitializeOptions) => {
    const currentMode = get().mode;
    const currentChatId = get().chatId;

    if (currentMode === mode && currentChatId === (chatId ?? null)) {
      return;
    }

    const existingUnsubscribe = get().unsubscribe;
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    if (mode !== 'shared' || !chatId) {
      set({
        mode,
        chatId: null,
        messages: [],
        isLoading: false,
        error: null,
        unreadCount: 0,
        unsubscribe: null,
      });
      return;
    }

    set({
      mode,
      chatId,
      messages: [],
      isLoading: true,
      error: null,
      unreadCount: 0,
      unsubscribe: null,
    });

    const unsubscribe = subscribeToSharedChatMessages(chatId, (records) => {
      const normalized = normalizeChatMessages(records);

      set((state) => {
        const hadHistory = state.messages.length > 0;
        const previousIds = new Set(state.messages.map((message) => message.id));
        const newMessagesCount = hadHistory
          ? normalized.reduce((count, message) => (
              previousIds.has(message.id) ? count : count + 1
            ), 0)
          : 0;

        return {
          messages: normalized,
          isLoading: false,
          unreadCount: state.isOpen ? 0 : state.unreadCount + newMessagesCount,
        };
      });
    });

    set({ unsubscribe });
  },

  sendMessage: async (content: string, meta: ChatSenderMeta) => {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const { mode, chatId } = get();
    if (mode !== 'shared' || !chatId) {
      set({ error: '공유 캔버스에서만 채팅을 사용할 수 있어요.' });
      return;
    }

    if (!meta.userId) {
      set({ error: '채팅을 사용하려면 로그인해 주세요.' });
      return;
    }

    set({ isSending: true, error: null });

    try {
      await sendSharedChatMessage(chatId, {
        userId: meta.userId,
        content: trimmed,
        createdAt: Date.now(),
        displayName: meta.displayName || undefined,
        photoURL: meta.photoURL || undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '메시지를 보낼 수 없습니다.';
      set({ error: message });
    } finally {
      set({ isSending: false });
    }
  },

  toggleOpen: () => {
    set((state) => {
      const nextOpen = !state.isOpen;
      return {
        isOpen: nextOpen,
        unreadCount: nextOpen ? 0 : state.unreadCount,
        error: nextOpen ? null : state.error,
      };
    });
  },

  cleanup: () => {
    const existingUnsubscribe = get().unsubscribe;
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    set({
      messages: [],
      chatId: null,
      mode: 'inactive',
      isLoading: false,
      isSending: false,
      error: null,
      unreadCount: 0,
      unsubscribe: null,
    });
  },
}));
