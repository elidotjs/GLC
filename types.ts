export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
  username: string;
  isStreaming?: boolean;
}

export interface Theme {
  name: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  userBubble: string;
  aiBubble: string;
  bgGradient: string;
  headerBg: string;
  textColor?: string;
  isGlossy?: boolean;
  isDark?: boolean;
}

export interface Settings {
  username: string;
  theme: string;
  apiKey: string;
  systemInstruction: string;
}

export interface SavedPrompt {
  id: string;
  title: string;
  text: string;
}

export interface Personality {
  id: string;
  name: string;
  instruction: string;
}