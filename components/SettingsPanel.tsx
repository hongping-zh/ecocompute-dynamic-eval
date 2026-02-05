import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Check, AlertCircle } from 'lucide-react';

export type ApiProvider = 'demo' | 'gemini' | 'openai' | 'groq';

export interface ApiConfig {
  provider: ApiProvider;
  apiKey: string;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

const PROVIDERS = [
  { 
    id: 'demo' as ApiProvider, 
    name: 'Demo Mode', 
    description: 'No API key required. Uses simulated responses.',
    color: 'bg-slate-100 border-slate-300 text-slate-700'
  },
  { 
    id: 'gemini' as ApiProvider, 
    name: 'Google Gemini', 
    description: 'Free tier available. Fast and efficient.',
    color: 'bg-blue-50 border-blue-300 text-blue-700',
    keyPlaceholder: 'AIza...',
    keyLink: 'https://aistudio.google.com/app/apikey'
  },
  { 
    id: 'openai' as ApiProvider, 
    name: 'OpenAI GPT', 
    description: 'GPT-4o model. Requires paid account.',
    color: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    keyPlaceholder: 'sk-...',
    keyLink: 'https://platform.openai.com/api-keys'
  },
  { 
    id: 'groq' as ApiProvider, 
    name: 'Groq', 
    description: 'Ultra-fast inference. Free tier available.',
    color: 'bg-orange-50 border-orange-300 text-orange-700',
    keyPlaceholder: 'gsk_...',
    keyLink: 'https://console.groq.com/keys'
  },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, config, onSave }) => {
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelectedProvider(config.provider);
    setApiKey(config.apiKey);
  }, [config, isOpen]);

  const handleSave = () => {
    const newConfig: ApiConfig = { provider: selectedProvider, apiKey };
    localStorage.setItem('ecocompute_api_config', JSON.stringify(newConfig));
    onSave(newConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectedProviderInfo = PROVIDERS.find(p => p.id === selectedProvider);
  const needsKey = selectedProvider !== 'demo';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">API Settings</h2>
                <p className="text-sm text-slate-300">Configure your AI provider</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Select Provider</label>
            <div className="grid grid-cols-2 gap-3">
              {PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    if (provider.id === 'demo') setApiKey('');
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedProvider === provider.id 
                      ? `${provider.color} border-current ring-2 ring-offset-2 ring-current/30` 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-sm">{provider.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{provider.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          {needsKey && selectedProviderInfo && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key
                </label>
                {'keyLink' in selectedProviderInfo && (
                  <a 
                    href={selectedProviderInfo.keyLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-eco-600 hover:underline"
                  >
                    Get API Key →
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={'keyPlaceholder' in selectedProviderInfo ? selectedProviderInfo.keyPlaceholder : 'Enter your API key'}
                  className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-eco-500 focus:border-eco-500 outline-none font-mono text-sm"
                />
                {apiKey && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Check className="w-5 h-5 text-eco-500" />
                  </div>
                )}
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Your API key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={needsKey && !apiKey}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              saved 
                ? 'bg-eco-500 text-white' 
                : needsKey && !apiKey
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper to load config from localStorage
export const loadApiConfig = (): ApiConfig => {
  try {
    const stored = localStorage.getItem('ecocompute_api_config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load API config from localStorage');
  }
  return { provider: 'demo', apiKey: '' };
};
