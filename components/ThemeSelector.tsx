import React from 'react';
import { Palette } from 'lucide-react';
import { THEMES } from '../constants';

interface ThemeSelectorProps {
  currentTheme: string;
  onSelectTheme: (themeKey: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onSelectTheme, isOpen, setIsOpen }) => {
  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full hover:bg-black/5 transition-colors ${isOpen ? 'bg-black/5' : ''}`}
        title="Change Theme"
      >
        <Palette size={20} className="text-gray-400 hover:text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Select Theme</h3>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {Object.keys(THEMES).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    onSelectTheme(key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${currentTheme === key ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <div className={`w-4 h-4 rounded-full ${THEMES[key].primary} border border-gray-200`} />
                  {THEMES[key].name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;
