import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';

interface ApiKeySettingsProps {
  currentApiKey: string;
  onSaveApiKey: (key: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ currentApiKey, onSaveApiKey, isOpen, setIsOpen }) => {
  const [tempApiKeyInput, setTempApiKeyInput] = useState(currentApiKey || '');

  useEffect(() => {
    setTempApiKeyInput(currentApiKey || '');
  }, [currentApiKey]);

  const handleSave = () => {
    onSaveApiKey(tempApiKeyInput);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full hover:bg-black/5 transition-colors ${isOpen ? 'bg-black/5' : ''}`}
        title="Set Gemini API Key"
      >
        <Key size={20} className="text-gray-400 hover:text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Gemini API Key</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="apiKeyInput" className="block text-xs font-medium text-gray-700 mb-1">Your API Key</label>
                <input
                  id="apiKeyInput"
                  type="password"
                  value={tempApiKeyInput}
                  onChange={(e) => setTempApiKeyInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none text-sm bg-gray-50"
                  placeholder="AIzaSy... (e.g., from Google AI Studio)"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!tempApiKeyInput.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Key
              </button>
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                <span className="font-semibold">Important:</span> For some advanced models, you need an API key from a paid GCP project. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Learn more about billing.</a>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApiKeySettings;
