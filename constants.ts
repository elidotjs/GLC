import { Theme, Personality } from './types';

export const DEFAULT_GREETING = "Hello! I'm Gemini. Start a message with '!gemini' if you want me to respond, otherwise chat away!";

export const DEFAULT_SYSTEM_INSTRUCTION = "You are a helpful, witty, and concise AI assistant participating in a group chat. You only speak when spoken to or when users start a message with !gemini.";

export const PERSONALITIES: Personality[] = [
  {
    id: 'default',
    name: 'Standard AI',
    instruction: DEFAULT_SYSTEM_INSTRUCTION
  },
  {
    id: 'fbi',
    name: 'FBI Agent',
    instruction: "You are a clandestine FBI agent monitoring this chat room. You speak in a serious, official tone, using redacted text style occasionally. You are suspicious of everyone's activities. You respond to !gemini commands as if they are interrogations or intel requests."
  },
  {
    id: 'pirate',
    name: 'Space Pirate',
    instruction: "You are a rough-and-tumble space pirate captain. You use slang like 'matey', 'arrr', and refer to the internet as 'the datastream'. You are looking for digital treasure."
  },
  {
    id: 'uwu',
    name: 'Overly Cute',
    instruction: "You are an extremely cute, energetic anime-style assistant. You use emoticons like (◕‿◕✿) and UwU often. You are very enthusiastic about everything."
  },
  {
    id: 'frutiger',
    name: 'Frutiger Aero Spirit',
    instruction: "You are the embodiment of the Frutiger Aero aesthetic (2004-2013). You love glossy textures, water, fish, tropical themes, and optimistic technology. You speak nostalgically about Windows Vista and early iOS."
  },
  {
    id: 'coder',
    name: 'Grumpy Senior Dev',
    instruction: "You are a senior backend engineer who has seen it all. You are technically brilliant but slightly cynical. You hate spaghetti code and prefer efficiency over politeness."
  }
];

export const THEMES: Record<string, Theme> = {
  emerald: {
    name: 'Emerald',
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    secondary: 'text-emerald-600',
    accent: 'border-emerald-200',
    userBubble: 'bg-emerald-600 text-white',
    aiBubble: 'bg-white text-gray-800 border border-gray-100',
    bgGradient: 'from-emerald-50 to-teal-50',
    headerBg: 'bg-white/80 backdrop-blur-md',
    isDark: false
  },
  violet: {
    name: 'Violet',
    primary: 'bg-violet-600',
    primaryHover: 'hover:bg-violet-700',
    secondary: 'text-violet-600',
    accent: 'border-violet-200',
    userBubble: 'bg-violet-600 text-white',
    aiBubble: 'bg-white text-gray-800 border border-gray-100',
    bgGradient: 'from-violet-50 to-fuchsia-50',
    headerBg: 'bg-white/80 backdrop-blur-md',
    isDark: false
  },
  blue: {
    name: 'Ocean',
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    secondary: 'text-blue-600',
    accent: 'border-blue-200',
    userBubble: 'bg-blue-600 text-white',
    aiBubble: 'bg-white text-gray-800 border border-gray-100',
    bgGradient: 'from-blue-50 to-cyan-50',
    headerBg: 'bg-white/80 backdrop-blur-md',
    isDark: false
  },
  amber: {
    name: 'Sunset',
    primary: 'bg-amber-500',
    primaryHover: 'hover:bg-amber-600',
    secondary: 'text-amber-600',
    accent: 'border-amber-200',
    userBubble: 'bg-amber-500 text-white',
    aiBubble: 'bg-white text-gray-800 border border-gray-100',
    bgGradient: 'from-amber-50 to-orange-50',
    headerBg: 'bg-white/80 backdrop-blur-md',
    isDark: false
  },
  rose: {
    name: 'Rose',
    primary: 'bg-rose-500',
    primaryHover: 'hover:bg-rose-600',
    secondary: 'text-rose-600',
    accent: 'border-rose-200',
    userBubble: 'bg-rose-500 text-white',
    aiBubble: 'bg-white text-gray-800 border border-gray-100',
    bgGradient: 'from-rose-50 to-pink-50',
    headerBg: 'bg-white/80 backdrop-blur-md',
    isDark: false
  },
  slate: {
    name: 'Midnight',
    primary: 'bg-slate-700',
    primaryHover: 'hover:bg-slate-600',
    secondary: 'text-slate-400',
    accent: 'border-slate-700',
    userBubble: 'bg-blue-700 text-white',
    aiBubble: 'bg-slate-800 text-gray-200 border border-slate-700',
    bgGradient: 'from-slate-950 to-black', 
    headerBg: 'bg-slate-900/90 backdrop-blur-md border-slate-800',
    textColor: 'text-gray-200',
    isDark: true
  },
  frutiger: {
    name: 'Frutiger Aero',
    primary: 'bg-gradient-to-b from-[#81D4FA] to-[#0288D1]',
    primaryHover: 'hover:brightness-110',
    secondary: 'text-[#0288D1]',
    accent: 'border-[#81D4FA]',
    userBubble: 'frutiger-bubble-user text-white text-shadow-sm',
    aiBubble: 'bg-white/90 text-gray-800 border border-white shadow-lg backdrop-blur-sm',
    bgGradient: 'from-[#E1F5FE] via-[#B3E5FC] to-[#81C784]',
    headerBg: 'glossy-bg',
    isGlossy: true,
    isDark: false
  },
  frutigerDark: {
    name: 'Dark Aero',
    primary: 'bg-gradient-to-b from-[#00E5FF] to-[#2979FF]',
    primaryHover: 'hover:brightness-110',
    secondary: 'text-[#00E5FF]',
    accent: 'border-[#2979FF]',
    userBubble: 'dark-frutiger-bubble-user text-white text-shadow-sm',
    aiBubble: 'bg-slate-900/80 text-cyan-50 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)] backdrop-blur-md',
    bgGradient: 'from-slate-950 via-[#0a192f] to-[#0f172a]',
    headerBg: 'bg-slate-900/60 backdrop-blur-xl border-b border-cyan-500/20',
    isGlossy: true,
    textColor: 'text-cyan-50',
    isDark: true
  }
};