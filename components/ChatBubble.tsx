import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Zap } from 'lucide-react';
import { Message, Theme } from '../types';

interface ChatBubbleProps {
  message: Message;
  theme: Theme;
  isCurrentUser: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, theme, isCurrentUser }) => {
  const isSystem = message.sender === 'system';
  const isAi = message.sender === 'ai';
  
  let alignClass = 'justify-start';
  if (isSystem) alignClass = 'justify-center';
  else if (isCurrentUser) alignClass = 'justify-end';

  if (isSystem) {
    return (
      <div className={`flex w-full mb-4 ${alignClass}`}>
        <span className="text-xs text-gray-400 bg-gray-100/50 px-2 py-1 rounded-full">{message.text}</span>
      </div>
    );
  }
  
  return (
    <div className={`flex w-full mb-4 ${alignClass}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 group`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
          ${isCurrentUser ? (theme.isGlossy ? 'glossy-bg border border-white/50' : theme.primary) : (isAi ? 'bg-gradient-to-br from-blue-100 to-purple-100' : 'bg-gray-300')} 
          shadow-sm overflow-hidden`}
        >
          {isCurrentUser ? (
            <User size={16} className={theme.isGlossy ? "text-gray-700" : "text-white"} />
          ) : isAi ? (
            <Zap size={16} className="text-purple-600" />
          ) : (
            <span className="text-xs font-bold text-gray-600">{message.username.substring(0,2).toUpperCase()}</span>
          )}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className={`text-xs font-semibold ${isCurrentUser ? theme.secondary : (theme.textColor || 'text-gray-500')}`}>
              {message.username}
            </span>
            <span className="text-[10px] opacity-60">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div 
            className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed break-words overflow-hidden
              ${isCurrentUser 
                ? `${theme.userBubble} rounded-tr-none` 
                : `${theme.aiBubble} rounded-tl-none`}
            `}
          >
            {message.sender === 'ai' ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{message.text}</ReactMarkdown>
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 align-middle bg-current opacity-50 animate-pulse"/>
                )}
              </div>
            ) : (
               <div className="whitespace-pre-wrap">{message.text}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;