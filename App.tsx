import React, { useState } from 'react';
import { AppView } from './types';
import { Calculator } from './components/Calculator';
import { Leaderboard } from './components/Leaderboard';
import { AudioMonitor } from './components/AudioMonitor';
import { SettingsPanel, ApiConfig, loadApiConfig } from './components/SettingsPanel';
import { LayoutGrid, Calculator as CalcIcon, Activity, Leaf, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LEADERBOARD);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(loadApiConfig);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col fixed h-full z-50 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-eco-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden lg:block">EcoCompute</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          <button 
            onClick={() => setView(AppView.LEADERBOARD)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${view === AppView.LEADERBOARD ? 'bg-eco-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutGrid className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block font-medium">Evaluations</span>
          </button>

           <button 
            onClick={() => setView(AppView.MONITOR)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${view === AppView.MONITOR ? 'bg-eco-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Activity className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block font-medium">Live Monitor</span>
          </button>

          <button 
            onClick={() => setView(AppView.CALCULATOR)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${view === AppView.CALCULATOR ? 'bg-eco-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <CalcIcon className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block font-medium">Calculator</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
           <button 
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block font-medium">Settings</span>
            </button>
           <div className="bg-slate-800 p-3 rounded-xl hidden lg:block">
              <p className="text-xs text-slate-400 mb-1">API Provider</p>
              <p className="text-sm font-medium text-eco-400 capitalize">{apiConfig.provider}</p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 h-screen overflow-hidden flex flex-col">
        <header className="mb-6 flex justify-between items-center">
            <div>
                 <h1 className="text-2xl font-bold text-slate-800">
                    {view === AppView.LEADERBOARD && 'Model Evaluations'}
                    {view === AppView.MONITOR && 'System Monitor'}
                    {view === AppView.CALCULATOR && 'Emissions Calculator'}
                </h1>
                <p className="text-slate-500 text-sm">
                    {view === AppView.LEADERBOARD && 'Compare dynamic performance metrics across models.'}
                    {view === AppView.MONITOR && 'Real-time energy and audio processing visualization.'}
                    {view === AppView.CALCULATOR && 'Estimate carbon footprint for training runs.'}
                </p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-700">Weights & Biases Style</span>
                    <span className="text-xs text-eco-600 font-medium">Eco-Mode Active</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                    <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
                </div>
            </div>
        </header>

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-auto animate-fade-in-up">
            {view === AppView.LEADERBOARD && <Leaderboard apiConfig={apiConfig} />}
            {view === AppView.MONITOR && <AudioMonitor />}
            {view === AppView.CALCULATOR && <Calculator />}
        </div>
      </main>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        config={apiConfig}
        onSave={setApiConfig}
      />
    </div>
  );
};

export default App;