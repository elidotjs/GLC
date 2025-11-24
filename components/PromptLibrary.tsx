import React, { useState, useEffect } from 'react';
import { Book, Plus, Trash2, X } from 'lucide-react';
import { SavedPrompt, Theme } from '../types';

interface PromptLibraryProps {
  onSelectPrompt: (text: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  theme: Theme;
}

const DEFAULT_PROMPTS: SavedPrompt[] = [
  { id: '1', title: 'Summarize', text: '!gemini Summarize the following text in a concise bulleted list:' },
  { id: '2', title: 'Code Review', text: '!gemini Review the following code for bugs and performance improvements:' },
  { id: '3', title: 'Creative Story', text: '!gemini Write a creative short story about ' },
  { id: '4', title: 'Explain Like I\'m 5', text: '!gemini Explain this concept to me like I am 5 years old:' }
];

const PromptLibrary: React.FC<PromptLibraryProps> = ({ onSelectPrompt, isOpen, setIsOpen, theme }) => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('!gemini ');

  useEffect(() => {
    const saved = localStorage.getItem('gemini-saved-prompts');
    if (saved) {
      setPrompts(JSON.parse(saved));
    } else {
      setPrompts(DEFAULT_PROMPTS);
      localStorage.setItem('gemini-saved-prompts', JSON.stringify(DEFAULT_PROMPTS));
    }
  }, []);

  const savePrompts = (newPrompts: SavedPrompt[]) => {
    setPrompts(newPrompts);
    localStorage.setItem('gemini-saved-prompts', JSON.stringify(newPrompts));
  };

  const handleAddPrompt = () => {
    if (!newTitle.trim() || !newText.trim()) return;
    
    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      text: newText.trim()
    };
    
    savePrompts([...prompts, newPrompt]);
    setNewTitle('');
    setNewText('!gemini ');
    setIsAdding(false);
  };

  const handleDeletePrompt = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    savePrompts(prompts.filter(p => p.id !== id));
  };

  return (
    <div className="relative z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-xl transition-all flex items-center justify-center h-[42px] w-[42px] mb-0.5
           ${isOpen ? 'bg-gray-200 text-gray-800' : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-black/5'}
        `}
        title="Custom Prompts"
      >
        <Book size={20} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-14 left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 overflow-hidden">
            
            {/* Header */}
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">Saved Prompts</h3>
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`p-1.5 rounded-md transition-colors ${isAdding ? 'bg-gray-200 text-gray-800' : 'text-blue-600 hover:bg-blue-50'}`}
                title="Create New Prompt"
              >
                {isAdding ? <X size={16} /> : <Plus size={16} />}
              </button>
            </div>

            {/* List or Form */}
            <div className="max-h-80 overflow-y-auto">
              {isAdding ? (
                <div className="p-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                    <input 
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                      placeholder="My Prompt"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Prompt Text</label>
                    <textarea 
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none h-24"
                      placeholder="!gemini ..."
                      value={newText}
                      onChange={e => setNewText(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleAddPrompt}
                    disabled={!newTitle.trim() || !newText.trim()}
                    className={`w-full py-2 rounded-lg text-sm font-medium text-white transition-colors
                      ${!newTitle.trim() || !newText.trim() ? 'bg-gray-300' : theme.primary}
                    `}
                  >
                    Save Prompt
                  </button>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {prompts.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">No saved prompts yet.</div>
                  ) : (
                    prompts.map(prompt => (
                      <div 
                        key={prompt.id}
                        onClick={() => {
                          onSelectPrompt(prompt.text);
                          setIsOpen(false);
                        }}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="text-sm font-medium text-gray-800 truncate">{prompt.title}</div>
                          <div className="text-xs text-gray-400 truncate opacity-80">{prompt.text}</div>
                        </div>
                        <button 
                          onClick={(e) => handleDeletePrompt(e, prompt.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PromptLibrary;