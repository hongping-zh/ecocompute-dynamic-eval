import React, { useEffect, useRef, useState } from 'react';
import { AppView } from './types';
import { Calculator } from './components/Calculator';
import { Leaderboard } from './components/Leaderboard';
import { AudioMonitor } from './components/AudioMonitor';
import { SettingsPanel, ApiConfig, loadApiConfig } from './components/SettingsPanel';
import { Methodology } from './components/Methodology';
import { DeepSeekVsGpt } from './components/DeepSeekVsGpt';
import { LayoutGrid, Calculator as CalcIcon, Activity, Leaf, Settings, Github, BookOpen, Scale, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LEADERBOARD);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(loadApiConfig);
  const shouldSyncUrlRef = useRef(false);

  const navigateToView = (next: AppView) => {
    shouldSyncUrlRef.current = true;
    setView(next);
  };

  const setUrlParams = (params: URLSearchParams) => {
    const next = params.toString();
    const url = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  };

  const openCalculatorTemplate = (templateId: string) => {
    shouldSyncUrlRef.current = true;
    setView(AppView.CALCULATOR);
    const params = new URLSearchParams(window.location.search);
    params.set('view', AppView.CALCULATOR);
    params.set('template', templateId);
    params.delete('data');
    setUrlParams(params);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    shouldSyncUrlRef.current = params.has('view') || params.has('template') || params.has('data');

    if (params.has('data')) {
      setView(AppView.CALCULATOR);
      return;
    }

    const viewParam = params.get('view');
    if (viewParam && (Object.values(AppView) as string[]).includes(viewParam)) {
      setView(viewParam as AppView);
    }
  }, []);

  useEffect(() => {
    if (!shouldSyncUrlRef.current) return;

    const params = new URLSearchParams(window.location.search);
    params.set('view', view);

    if (view !== AppView.CALCULATOR) {
      params.delete('template');
      params.delete('data');
    }

    setUrlParams(params);
  }, [view]);

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
            onClick={() => navigateToView(AppView.LEADERBOARD)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${view === AppView.LEADERBOARD ? 'bg-eco-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutGrid className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block font-medium">Evaluations</span>
          </button>

           <button 
            onClick={() => navigateToView(AppView.MONITOR)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${view === AppView.MONITOR ? 'bg-eco-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Activity className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block font-medium">Live Monitor</span>
          </button>

          <button 
            onClick={() => navigateToView(AppView.CALCULATOR)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${view === AppView.CALCULATOR ? 'bg-eco-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <CalcIcon className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block font-medium">Calculator</span>
          </button>

          <button 
            onClick={() => navigateToView(AppView.DEEPSEEK_VS_GPT)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${view === AppView.DEEPSEEK_VS_GPT ? 'bg-eco-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Scale className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block font-medium">DeepSeek vs GPT</span>
          </button>

          <button 
            onClick={() => navigateToView(AppView.METHODOLOGY)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${view === AppView.METHODOLOGY ? 'bg-eco-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block font-medium">Methodology</span>
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
           <a 
              href="https://github.com/hongping-zh/ecocompute-dynamic-eval" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block font-medium text-sm">GitHub ⭐</span>
            </a>
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
                    {view === AppView.DEEPSEEK_VS_GPT && 'DeepSeek vs GPT'}
                    {view === AppView.METHODOLOGY && 'Methodology & Data Sources'}
                </h1>
                <p className="text-slate-500 text-sm">
                    {view === AppView.LEADERBOARD && 'Compare dynamic performance metrics across models.'}
                    {view === AppView.MONITOR && 'Real-time energy and audio processing visualization.'}
                    {view === AppView.CALCULATOR && 'Estimate carbon footprint for training runs.'}
                    {view === AppView.DEEPSEEK_VS_GPT && 'A practical workflow to compare cost and carbon impact for your workload.'}
                    {view === AppView.METHODOLOGY && 'How the metrics are measured and how estimates are derived.'}
                </p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-700">Weights & Biases Style</span>
                    <span className="text-xs text-eco-600 font-medium">Eco-Mode Active</span>
                </div>
                <a
                  href="mailto:hello@ecocompute.ai?subject=EcoCompute%20Waitlist"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Join Waitlist
                </a>
            </div>
        </header>

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-auto animate-fade-in-up">
            {view === AppView.LEADERBOARD && <Leaderboard apiConfig={apiConfig} />}
            {view === AppView.MONITOR && <AudioMonitor />}
            {view === AppView.CALCULATOR && <Calculator />}
            {view === AppView.DEEPSEEK_VS_GPT && <DeepSeekVsGpt onOpenCalculator={() => openCalculatorTemplate('deepseek-vs-gpt')} />}
            {view === AppView.METHODOLOGY && <Methodology />}
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