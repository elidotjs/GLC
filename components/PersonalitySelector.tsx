import React, { useState } from 'react';
import { Brain, Check } from 'lucide-react';
import { PERSONALITIES } from '../constants';
import { Personality } from '../types';

interface PersonalitySelectorProps {
  currentInstruction: string;
  onSelectInstruction: (instruction: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ currentInstruction, onSelectInstruction, isOpen, setIsOpen }) => {
  const [customText, setCustomText] = useState('');
  
  // Identify if current is one of the presets
  const activePreset = PERSONALITIES.find(p => p.instruction === currentInstruction);
  const isCustom = !activePreset && currentInstruction.trim().length > 0;

  const handleCustomApply = () => {
    if (customText.trim()) {
      onSelectInstruction(customText.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full hover:bg-black/5 transition-colors ${isOpen ? 'bg-black/5' : ''}`}
        title="AI Personality & Instructions"
      >
        <Brain size={20} className="text-gray-400 hover:text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">AI Personality</h3>
            
            <div className="space-y-1 mb-3 max-h-60 overflow-y-auto">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectInstruction(p.instruction);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors group flex items-start justify-between
                    ${currentInstruction === p.instruction ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                   <div>
                     <div className="font-medium">{p.name}</div>
                     <div className="text-[10px] opacity-70 line-clamp-2">{p.instruction}</div>
                   </div>
                   {currentInstruction === p.instruction && <Check size={14} className="mt-1 flex-shrink-0" />}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 px-2">
               <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Custom Instruction</label>
               <textarea 
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none mb-2"
                  rows={3}
                  placeholder="e.g. You are a medieval knight..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
               />
               <button 
                onClick={handleCustomApply}
                disabled={!customText.trim()}
                className="w-full bg-gray-900 text-white text-xs py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
               >
                 Apply Custom Personality
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PersonalitySelector;