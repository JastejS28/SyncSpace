export type ChatMessage = {
  role: 'user' | 'ai';
  text: string;
};

export type RemoteCursor = {
  x: number;
  y: number;
  name: string;
  color: string;
};

export type AccessMode = 'RESTRICTED' | 'VIEW' | 'EDIT';
