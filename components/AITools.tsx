import React, { useState, useRef, useEffect } from 'react';
import { Brain, MessageSquare, FileText, Image, Database, X, ChevronRight, Sparkles, Download, Crop, Palette, ZoomIn, Loader2, FileJson } from 'lucide-react';
import { execute, getTraceLog, exportTraceDataset } from '../services/engine';
import { ApiConfig, loadApiConfig } from './SettingsPanel';
import { ProviderId } from '../services/types';

interface AIToolsProps {
  onChatWithImage?: () => void;
  onExtractText?: () => void;
  onSaveToKnowledge?: () => void;
}

export const AITools: React.FC<AIToolsProps> = ({ onChatWithImage, onExtractText, onSaveToKnowledge }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showImageTools, setShowImageTools] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [resultPanel, setResultPanel] = useState<{ title: string; text: string; trace_id: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowImageTools(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ESC 关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowImageTools(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Unified execution via the control plane
  const executeTask = async (taskType: string, prompt: string, title: string) => {
    setExecuting(true);
    setActiveAction(taskType);
    const config = loadApiConfig();

    try {
      const result = await execute(
        {
          input: {
            task_type: taskType as any,
            prompt,
          },
          objective: 'balanced',
          constraints: {
            preferred_provider: config.provider as ProviderId,
            fallback_providers: ['demo'],
            max_tokens: 200,
          },
        },
        config.apiKey,
      );

      setResultPanel({
        title,
        text: result.success && result.data ? result.data.text : `Error: ${result.error}`,
        trace_id: result.trace.trace_id,
      });
    } catch (err) {
      setResultPanel({
        title,
        text: `Execution failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        trace_id: 'error',
      });
    } finally {
      setExecuting(false);
      setActiveAction(null);
      setIsOpen(false);
      setShowImageTools(false);
    }
  };

  const handleAction = (action: string, callback?: () => void) => {
    setActiveAction(action);
    setTimeout(() => {
      setActiveAction(null);
      setIsOpen(false);
      setShowImageTools(false);
      callback?.();
    }, 300);
  };

  // Export all execution traces as dataset JSON
  const handleExportTraces = () => {
    const traces = getTraceLog();
    if (traces.length === 0) {
      alert('No execution traces yet. Use AI Tools to generate some first.');
      return;
    }
    const json = exportTraceDataset();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecocompute-traces-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    handleAction('export-traces');
  };

  const menuItems = [
    {
      id: 'chat',
      icon: MessageSquare,
      label: 'Chat with Image',
      description: 'Ask AI about charts & data',
      onClick: () => executeTask(
        'chat_with_image',
        'Describe the current EcoCompute dashboard view. What insights can you provide about the AI model comparison data shown?',
        'Chat with Image'
      ),
    },
    {
      id: 'extract',
      icon: FileText,
      label: 'Extract Text',
      description: 'OCR from screenshots',
      onClick: () => executeTask(
        'extract_text',
        'Extract and summarize the key metrics visible in the current EcoCompute dashboard: model names, accuracy scores, carbon impact values, and energy efficiency ratings.',
        'Extract Text'
      ),
    },
    {
      id: 'image-tools',
      icon: Image,
      label: 'Image Tools',
      description: 'Crop, resize, enhance',
      hasSubmenu: true,
      onClick: () => setShowImageTools(!showImageTools),
    },
    {
      id: 'save',
      icon: Database,
      label: 'Save to Knowledge Base',
      description: 'Store for future reference',
      onClick: () => executeTask(
        'summarize',
        'Create a concise knowledge base entry summarizing the current EcoCompute session: key findings about model efficiency, cost comparisons, and carbon impact insights.',
        'Save to Knowledge Base'
      ),
    },
    {
      id: 'export-traces',
      icon: FileJson,
      label: 'Export Trace Dataset',
      description: 'Download all execution traces',
      onClick: handleExportTraces,
    },
  ];

  const imageToolItems = [
    { id: 'screenshot', icon: Crop, label: 'Screenshot & Crop', onClick: () => handleAction('screenshot') },
    { id: 'enhance', icon: Palette, label: 'Enhance Quality', onClick: () => handleAction('enhance') },
    { id: 'zoom', icon: ZoomIn, label: 'Zoom & Inspect', onClick: () => handleAction('zoom') },
    { id: 'export', icon: Download, label: 'Export as PNG', onClick: () => handleAction('export') },
  ];

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-[90]">
      {/* Main Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 animate-fade-in-up">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden w-72 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-white font-bold text-lg tracking-tight">AI Tools</span>
              </div>
              <button
                onClick={() => { setIsOpen(false); setShowImageTools(false); }}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group relative
                    ${activeAction === item.id ? 'bg-eco-600/20' : 'hover:bg-slate-800'}
                    ${item.id === 'image-tools' && showImageTools ? 'bg-slate-800' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                    ${activeAction === item.id ? 'bg-eco-500' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                    <item.icon className={`w-4.5 h-4.5 ${activeAction === item.id ? 'text-white' : 'text-slate-300'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-white">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.description}</div>
                  </div>
                  {item.hasSubmenu && (
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${showImageTools ? 'rotate-90' : ''}`} />
                  )}
                </button>
              ))}
            </div>

            {/* Image Tools Submenu */}
            {showImageTools && (
              <div className="border-t border-slate-700/50 p-2 bg-slate-800/50 animate-fade-in">
                {imageToolItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${activeAction === item.id ? 'bg-eco-600/20' : 'hover:bg-slate-700/50'}`}
                  >
                    <item.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Executing indicator */}
            {executing && (
              <div className="px-4 py-3 border-t border-slate-700/50 bg-indigo-900/30">
                <div className="flex items-center gap-2 text-xs text-indigo-300">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Executing via control plane...</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Sparkles className="w-3 h-3" />
                  <span>Execution Control Plane</span>
                </div>
                <span className="text-[10px] text-slate-600">{getTraceLog().length} traces</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Panel */}
      {resultPanel && !isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 animate-fade-in-up">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden w-80">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <span className="text-sm font-semibold text-white">{resultPanel.title}</span>
              <button
                onClick={() => setResultPanel(null)}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="px-4 py-3 max-h-48 overflow-auto custom-scrollbar">
              <p className="text-sm text-slate-300 leading-relaxed">{resultPanel.text}</p>
            </div>
            <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
              <span className="text-[10px] text-slate-600 font-mono">{resultPanel.trace_id}</span>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (isOpen) setShowImageTools(false); }}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group
          ${isOpen 
            ? 'bg-slate-800 shadow-slate-900/50 rotate-0' 
            : 'bg-gradient-to-br from-purple-600 to-indigo-700 shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105'
          }`}
        title="AI Tools"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-slate-300" />
        ) : (
          <Brain className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Pulse ring when closed */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full animate-ping bg-purple-500/20 pointer-events-none" style={{ animationDuration: '3s' }} />
      )}
    </div>
  );
};
