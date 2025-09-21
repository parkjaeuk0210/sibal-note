export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  createdAt: number;
  displayName?: string;
  photoURL?: string;
}

export type ChatMode = 'shared' | 'inactive';
