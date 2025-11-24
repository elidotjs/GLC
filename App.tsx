import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, Trash2, MessageSquare, Zap, Users } from 'lucide-react';
import ChatBubble from './components/ChatBubble';
import ThemeSelector from './components/ThemeSelector';
import ApiKeySettings from './components/ApiKeySettings';
import PromptLibrary from './components/PromptLibrary';
import PersonalitySelector from './components/PersonalitySelector';
import { initializeChatSession, streamResponse } from './services/geminiService';
import { THEMES, DEFAULT_GREETING, DEFAULT_SYSTEM_INSTRUCTION } from './constants';
import { Message, Settings } from './types';

const App = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(() => {
    const saved = localStorage.getItem('gemini-chat-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Backwards compatibility for settings saved before systemInstruction existed
      if (!parsed.systemInstruction) {
        parsed.systemInstruction = DEFAULT_SYSTEM_INSTRUCTION;
      }
      return parsed;
    }
    return null;
  });
  const [tempUsername, setTempUsername] = useState('');
  
  // Menu Visibility States
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isApiKeyMenuOpen, setIsApiKeyMenuOpen] = useState(false);
  const [isPromptMenuOpen, setIsPromptMenuOpen] = useState(false);
  const [isPersonalityMenuOpen, setIsPersonalityMenuOpen] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Secret URL Check
  useEffect(() => {
    if (window.location.pathname === '/clear_chat') {
      localStorage.removeItem('gemini-chat-history');
      window.history.replaceState(null, '', '/');
      setMessages([]);
    }
  }, []);

  // Load messages from localStorage on initial load
  useEffect(() => {
    const savedMessages = localStorage.getItem('gemini-chat-history');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const initialMsg: Message = {
        id: 'init-1',
        text: DEFAULT_GREETING,
        sender: 'ai',
        timestamp: Date.now(),
        username: 'Gemini'
      };
      setMessages([initialMsg]);
      localStorage.setItem('gemini-chat-history', JSON.stringify([initialMsg]));
    }
  }, []);

  // Re-initialize chat session when API key or System Instruction changes
  useEffect(() => {
    if (settings?.apiKey) {
      initializeChatSession(settings.apiKey, settings.systemInstruction);
    }
  }, [settings?.apiKey, settings?.systemInstruction]);

  // Listen for storage changes to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gemini-chat-history' && e.newValue) {
        const newMessages = JSON.parse(e.newValue);
        setMessages(newMessages);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-save settings
  useEffect(() => {
    if (settings) {
      localStorage.setItem('gemini-chat-settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const activeTheme = settings && THEMES[settings.theme] ? THEMES[settings.theme] : THEMES.emerald;
  const textColor = activeTheme.textColor || 'text-gray-800';

  const updateMessagesInStorage = (newMsg: Message) => {
     const current = JSON.parse(localStorage.getItem('gemini-chat-history') || '[]');
     const next = [...current, newMsg];
     setMessages(next);
     localStorage.setItem('gemini-chat-history', JSON.stringify(next));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUsername.trim()) return;
    
    const newSettings: Settings = {
      username: tempUsername.trim(),
      theme: 'emerald',
      apiKey: settings?.apiKey || '',
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION
    };
    
    setSettings(newSettings);
    
    const joinMsg: Message = {
       id: Date.now().toString(),
       text: `${newSettings.username} joined the chat`,
       sender: 'system',
       timestamp: Date.now(),
       username: 'System'
    };
    updateMessagesInStorage(joinMsg);
  };

  const handleLogout = () => {
    if (settings) {
       const leaveMsg: Message = {
         id: Date.now().toString(),
         text: `${settings.username} left the chat`,
         sender: 'system',
         timestamp: Date.now(),
         username: 'System'
      };
      updateMessagesInStorage(leaveMsg);
    }
    setSettings(null);
    setTempUsername('');
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to delete all messages for everyone?')) {
      const resetMsg: Message = {
        id: Date.now().toString(),
        text: "History cleared.",
        sender: 'system',
        timestamp: Date.now(),
        username: 'System'
      };
      setMessages([resetMsg]);
      localStorage.setItem('gemini-chat-history', JSON.stringify([resetMsg]));
    }
  };

  const changeTheme = (newTheme: string) => {
    if (settings) {
      setSettings({ ...settings, theme: newTheme });
    }
  };

  const saveApiKey = (newApiKey: string) => {
    const oldApiKey = settings?.apiKey;
    if (settings) {
        setSettings(prev => prev ? ({ ...prev, apiKey: newApiKey }) : null);
        
        if (oldApiKey !== newApiKey && settings.username) {
            const apiKeyChangeMsg: Message = {
                id: Date.now().toString(),
                text: `${settings.username} updated the API key.`,
                sender: 'system',
                timestamp: Date.now(),
                username: 'System'
            };
            updateMessagesInStorage(apiKeyChangeMsg);
        }
    }
  };

  const updateSystemInstruction = (newInstruction: string) => {
    if (settings) {
      setSettings({ ...settings, systemInstruction: newInstruction });
      // Announce the change
      const sysChangeMsg: Message = {
        id: Date.now().toString(),
        text: `${settings.username} changed the AI personality.`,
        sender: 'system',
        timestamp: Date.now(),
        username: 'System'
      };
      updateMessagesInStorage(sysChangeMsg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectPrompt = (promptText: string) => {
    setInputValue(promptText);
    inputRef.current?.focus();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !settings) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // 1. Create User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: Date.now(),
      username: settings.username
    };

    updateMessagesInStorage(userMsg);

    // 2. Check for Gemini Trigger
    if (userText.toLowerCase().startsWith('!gemini')) {
      const prompt = userText.substring(7).trim(); 
      if (!prompt) { 
          setIsTyping(false);
          setTimeout(() => inputRef.current?.focus(), 100);
          return;
      }

      if (!settings.apiKey) {
          const noApiKeyMsg: Message = {
              id: (Date.now() + 0.5).toString(),
              text: `Error: Gemini API Key is missing. Please set it via the Key icon in the header.`,
              sender: 'system',
              timestamp: Date.now(),
              username: 'System'
          };
          updateMessagesInStorage(noApiKeyMsg);
          setIsTyping(false);
          return;
      }

      setIsTyping(true);

      const aiMsgId = (Date.now() + 1).toString();
      const initialAiMsg: Message = {
        id: aiMsgId,
        text: '',
        sender: 'ai',
        timestamp: Date.now(),
        username: 'Gemini',
        isStreaming: true
      };
      
      setMessages(prev => { 
          const next = [...prev, initialAiMsg];
          localStorage.setItem('gemini-chat-history', JSON.stringify(next));
          return next;
      });

      try {
        let fullResponse = "";
        const stream = streamResponse(prompt, settings.apiKey, settings.systemInstruction);

        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === aiMsgId ? { ...msg, text: fullResponse } : msg
            );
            localStorage.setItem('gemini-chat-history', JSON.stringify(updated));
            return updated;
          });
        }
        
        setMessages(prev => {
          const updated = prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg
          );
          localStorage.setItem('gemini-chat-history', JSON.stringify(updated));
          return updated;
        });

      } catch (err) {
        console.error(err);
      } finally {
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } else {
       setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // --- RENDER: ONBOARDING ---
  if (!settings || !settings.username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 font-sans">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 transform transition-all hover:scale-[1.01]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
              <MessageSquare size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome to Gemini Live</h1>
            <p className="text-gray-500 mt-2">Join the chat room. Use <code className="bg-gray-100 px-1 rounded text-sm">!gemini</code> to summon AI.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Choose a Username</label>
              <input
                id="username"
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/50"
                placeholder="e.g. CyberPunk2077"
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              disabled={!tempUsername.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              Join Chat
              <Zap size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN APP ---
  const footerBg = activeTheme.isDark ? 'bg-slate-900/80 border-cyan-900/30' : 'bg-white/80 border-gray-200/50';
  
  // Input container background: glossy or flat based on theme
  const inputContainerBg = activeTheme.isGlossy 
    ? 'glossy-bg' 
    : (activeTheme.isDark ? 'bg-slate-800' : 'bg-gray-50');

  // Ring/Border logic
  const inputRing = activeTheme.primary.includes('gradient') 
    ? 'ring-blue-400' 
    : activeTheme.primary.replace('bg-', 'ring-');

  // Input Text Color logic
  const inputTextColor = activeTheme.isDark 
    ? 'text-gray-100 placeholder-slate-400' 
    : 'text-gray-800 placeholder-gray-400';

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br ${activeTheme.bgGradient} transition-colors duration-500`}>
      
      {/* HEADER */}
      <header className={`${activeTheme.headerBg} border-b border-gray-200/20 sticky top-0 z-30 px-4 py-3 shadow-sm transition-all duration-300`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${activeTheme.primary} flex items-center justify-center text-white shadow-md transition-all duration-300 hidden sm:flex`}>
              <Users size={20} />
            </div>
            <div>
              <h1 className={`font-bold leading-tight ${textColor} text-lg sm:text-xl`}>Global Chat</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                <span className={`text-xs font-medium opacity-80 ${textColor}`}>{settings.username}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
             <PersonalitySelector 
              currentInstruction={settings.systemInstruction}
              onSelectInstruction={updateSystemInstruction}
              isOpen={isPersonalityMenuOpen}
              setIsOpen={setIsPersonalityMenuOpen}
            />

            <ApiKeySettings
              currentApiKey={settings.apiKey}
              onSaveApiKey={saveApiKey}
              isOpen={isApiKeyMenuOpen}
              setIsOpen={setIsApiKeyMenuOpen}
            />
            <ThemeSelector 
              currentTheme={settings.theme} 
              onSelectTheme={changeTheme}
              isOpen={isThemeMenuOpen}
              setIsOpen={setIsThemeMenuOpen}
            />
            
            <div className="h-6 w-px bg-gray-400/20 mx-1"></div>

            <button 
              onClick={clearHistory}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/10 rounded-full transition-colors"
              title="Clear Chat History"
            >
              <Trash2 size={20} />
            </button>

            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/10 rounded-full transition-colors"
              title="Leave Chat"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth" ref={chatContainerRef}>
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          {messages.map((msg) => (
            <ChatBubble 
              key={msg.id} 
              message={msg} 
              theme={activeTheme} 
              isCurrentUser={msg.username === settings.username && msg.sender !== 'ai'}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT AREA */}
      <footer className={`${footerBg} backdrop-blur-md border-t p-4 pb-6 md:pb-6 sticky bottom-0 z-30`}>
        <div className="max-w-4xl mx-auto">
          {/* Input Container */}
          <div 
            className={`flex flex-row items-end gap-2 border ${activeTheme.accent} rounded-2xl px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-offset-2 ring-opacity-50 transition-all 
            ${inputContainerBg} ${inputRing}`}
          >
            
            {/* Left Button (Prompt Library) */}
            <div className="flex-shrink-0 pb-1">
              <PromptLibrary 
                onSelectPrompt={handleSelectPrompt} 
                isOpen={isPromptMenuOpen} 
                setIsOpen={setIsPromptMenuOpen}
                theme={activeTheme}
              />
            </div>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... Start with !gemini for AI"
              rows={1}
              className={`flex-1 bg-transparent px-2 py-3 outline-none resize-none max-h-32 overflow-y-auto ${inputTextColor}`}
              disabled={isTyping}
              style={{ minHeight: '44px' }}
            />

            {/* Right Button (Send) */}
            <div className="flex-shrink-0 pb-1">
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className={`transition-all flex items-center justify-center h-[42px] w-[42px] rounded-xl
                  ${!inputValue.trim() || isTyping 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                    : `${activeTheme.primary} ${activeTheme.primaryHover} text-white shadow-md transform hover:scale-105 active:scale-95`
                  }
                `}
              >
                <Send size={18} className={inputValue.trim() && !isTyping ? "ml-0.5" : ""} />
              </button>
            </div>
          </div>
          
          <div className="text-center mt-2 flex justify-center items-center gap-2">
             <p className="text-[10px] text-gray-400">
               Shift+Enter for new line • Local Chat Sync Enabled
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;