import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalculatorState } from '../types';
import { HARDWARE_OPTIONS } from '../constants';
import { Leaf, Cloud, Download, Upload, RotateCcw, BookOpen, ChevronDown, ChevronUp, Sparkles, GitCompare, X, Link2, Check } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// 数值格式化工具
const formatCurrency = (value: number): string => {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(4)}`;
};

const formatNumber = (value: number, unit: string): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ${unit}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K ${unit}`;
  return `${value.toFixed(1)} ${unit}`;
};

// URL 分享功能
const encodeStateToURL = (state: any, compareState: any): string => {
  try {
    const data = { s: state, c: compareState };
    const encoded = btoa(JSON.stringify(data));
    return `${window.location.origin}${window.location.pathname}?data=${encoded}`;
  } catch (e) {
    console.error('Failed to encode state');
    return window.location.href;
  }
};

const decodeStateFromURL = (): { state: any; compareState: any } | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      const decoded = JSON.parse(atob(data));
      return { state: decoded.s, compareState: decoded.c };
    }
  } catch (e) {
    console.error('Failed to decode URL state');
  }
  return null;
};

// API 成本数据 ($/1M tokens) - 2026年2月最新价格
const API_PRICING = {
  'deepseek-v3': { input: 0.27, output: 1.10, name: 'DeepSeek-V3 (671B)', desc: '满血版 MoE 架构' },
  'deepseek-v3-lite': { input: 0.07, output: 0.28, name: 'DeepSeek-V3-Lite', desc: '蒸馏版，性价比之王' },
  'deepseek-r1': { input: 0.55, output: 2.19, name: 'DeepSeek-R1', desc: '推理增强版' },
  'gpt-4o': { input: 2.50, output: 10.00, name: 'GPT-4o', desc: 'OpenAI 旗舰' },
  'gpt-4o-mini': { input: 0.15, output: 0.60, name: 'GPT-4o-mini', desc: 'OpenAI 轻量版' },
  'claude-3.5-sonnet': { input: 3.00, output: 15.00, name: 'Claude 3.5 Sonnet', desc: 'Anthropic 旗舰' },
  'gemini-1.5-flash': { input: 0.075, output: 0.30, name: 'Gemini 1.5 Flash', desc: 'Google 快速版' },
  'gemini-2.0-flash': { input: 0.10, output: 0.40, name: 'Gemini 2.0 Flash', desc: 'Google 最新版' },
};

// 预设模板库 - DeepSeek 主推案例在最前
const PRESET_TEMPLATES = [
  // ⭐ 主推案例：DeepSeek API 成本计算
  {
    id: 'deepseek-api-cost',
    name: '⭐ DeepSeek API 成本计算器',
    description: '计算 DeepSeek V3 满血版 vs 蒸馏版的真实成本差异',
    config: { hardware: 'rtx5090', count: 1, hours: 24, pue: 1.2, region: 'global' },
    apiModel: 'deepseek-v3',
    compareModel: 'deepseek-v3-lite',
    tokensPerDay: 1000000,
    featured: true
  },
  {
    id: 'deepseek-vs-gpt',
    name: '🔥 DeepSeek vs GPT-4o 成本对比',
    description: '同等质量下，DeepSeek 能省多少钱？',
    config: { hardware: 'a100', count: 1, hours: 24, pue: 1.2, region: 'global' },
    apiModel: 'deepseek-v3',
    compareModel: 'gpt-4o',
    tokensPerDay: 500000
  },
  {
    id: 'deepseek-r1-compare',
    name: '🧠 DeepSeek-R1 推理版成本',
    description: 'R1 推理增强版 vs 标准 V3 版本',
    config: { hardware: 'h100', count: 1, hours: 24, pue: 1.1, region: 'global' },
    apiModel: 'deepseek-r1',
    compareModel: 'deepseek-v3',
    tokensPerDay: 200000
  },
  {
    id: 'startup-api-budget',
    name: '🚀 创业公司 API 预算',
    description: '日均 100 万 tokens 的月度成本估算',
    config: { hardware: 'a100', count: 2, hours: 24, pue: 1.3, region: 'global' },
    apiModel: 'deepseek-v3-lite',
    tokensPerDay: 1000000
  },
  {
    id: 'enterprise-scale',
    name: '🏢 企业级大规模调用',
    description: '日均 1000 万 tokens 的成本对比',
    config: { hardware: 'h100', count: 8, hours: 24, pue: 1.2, region: 'global' },
    apiModel: 'deepseek-v3',
    compareModel: 'claude-3.5-sonnet',
    tokensPerDay: 10000000
  },
  {
    id: 'personal-dev',
    name: '👨‍💻 个人开发者日常',
    description: '轻度使用场景的月度成本',
    config: { hardware: 't4', count: 1, hours: 8, pue: 1.2, region: 'global' },
    apiModel: 'gemini-1.5-flash',
    tokensPerDay: 50000
  }
];

// 本地存储 key
const STORAGE_KEY = 'ecocompute_calculator_state';

// 扩展状态类型
interface ExtendedState extends CalculatorState {
  tokensPerDay?: number;
  apiModel?: string;
}

export const Calculator: React.FC = () => {
  // 从本地存储加载初始状态
  // 默认加载 DeepSeek 主推案例
  const getDefaultState = (): ExtendedState => ({
    hardware: 'rtx5090', 
    count: 1, 
    hours: 24, 
    pue: 1.2, 
    region: 'global', 
    tokensPerDay: 1000000, 
    apiModel: 'deepseek-v3'
  });

  const getDefaultCompareState = (): ExtendedState => ({
    hardware: 'rtx5090', 
    count: 1, 
    hours: 24, 
    pue: 1.2, 
    region: 'global', 
    tokensPerDay: 1000000, 
    apiModel: 'deepseek-v3-lite'
  });

  const loadSavedState = (): ExtendedState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved calculator state');
    }
    return getDefaultState();
  };

  // 从 URL 或本地存储加载状态
  const loadInitialState = () => {
    const urlState = decodeStateFromURL();
    if (urlState?.state) return urlState.state;
    return loadSavedState();
  };

  const loadInitialCompareState = () => {
    const urlState = decodeStateFromURL();
    if (urlState?.compareState) return urlState.compareState;
    return getDefaultCompareState();
  };

  const [state, setState] = useState<ExtendedState>(loadInitialState);
  const [compareState, setCompareState] = useState<ExtendedState | null>(loadInitialCompareState);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showChart, setShowChart] = useState<'pie' | 'bar' | 'compare' | null>('compare');
  const [configCollapsed, setConfigCollapsed] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭模板下拉菜单
  useEffect(() => {
    if (!showTemplates) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(e.target as Node)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTemplates]);
  const templateAppliedRef = useRef(false);

  useEffect(() => {
    if (templateAppliedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    if (params.has('data')) return;

    const templateId = params.get('template');
    if (!templateId) return;

    const template = PRESET_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const nextState: ExtendedState = {
      ...template.config,
      tokensPerDay: (template as any).tokensPerDay || 100000,
      apiModel: (template as any).apiModel || 'deepseek-v3'
    };
    setState(nextState);

    if ((template as any).compareModel) {
      setCompareState({
        ...template.config,
        tokensPerDay: (template as any).tokensPerDay || 100000,
        apiModel: (template as any).compareModel
      });
      setShowChart('compare');
    }

    templateAppliedRef.current = true;
  }, []);

  // 自动保存到本地存储
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 复制分享链接
  const copyShareLink = async () => {
    const url = encodeStateToURL(state, compareState);
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (e) {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // 计算结果
  const calculateResults = (s: ExtendedState) => {
    const hw = HARDWARE_OPTIONS.find(h => h.value === s.hardware);
    const power = hw ? hw.power : 200;
    const kwh = (power * s.count * s.hours * s.pue) / 1000;
    const co2 = kwh * 0.475;
    
    // API 成本计算
    const tokens = s.tokensPerDay || 100000;
    const pricing = API_PRICING[s.apiModel as keyof typeof API_PRICING] || API_PRICING['deepseek-v3'];
    const dailyCost = (tokens / 1000000) * ((pricing.input + pricing.output) / 2);
    const monthlyCost = dailyCost * 30;
    
    return { power, kwh, co2, dailyCost, monthlyCost, tokens, pricing };
  };

  const results = useMemo(() => calculateResults(state), [state]);
  const compareResults = useMemo(() => compareState ? calculateResults(compareState) : null, [compareState]);

  const handleChange = (field: keyof ExtendedState, value: string | number) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  // 应用模板
  const applyTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    const newState: ExtendedState = {
      ...template.config,
      tokensPerDay: (template as any).tokensPerDay || 100000,
      apiModel: (template as any).apiModel || 'deepseek-v3'
    };
    setState(newState);
    
    // 如果模板有对比模型，自动启用对比模式
    if ((template as any).compareModel) {
      setCompareState({
        ...template.config,
        tokensPerDay: (template as any).tokensPerDay || 100000,
        apiModel: (template as any).compareModel
      });
      setShowChart('compare');
    }
    setShowTemplates(false);
  };

  // 启用对比模式
  const enableCompareMode = () => {
    setCompareState({ ...state, apiModel: 'gpt-4o' });
    setShowChart('compare');
  };

  // 重置为默认值（DeepSeek 主推案例）
  const resetToDefault = () => {
    setState(getDefaultState());
    setCompareState(getDefaultCompareState());
    setShowChart('compare');
  };

  // 导出为 JSON
  const exportConfig = () => {
    const exportData = {
      config: state,
      compareConfig: compareState,
      result: {
        co2_kg: results.co2,
        kwh: results.kwh,
        dailyCost: results.dailyCost,
        monthlyCost: results.monthlyCost
      },
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecocompute-comparison-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入 JSON
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.config) setState(data.config);
        if (data.compareConfig) setCompareState(data.compareConfig);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // 生成 AI 解释（纯文本，不含 Markdown 语法）
  const generateInsight = (): { main: string; detail: string } => {
    if (compareState && compareResults) {
      const savings = ((compareResults.monthlyCost - results.monthlyCost) / compareResults.monthlyCost * 100).toFixed(0);
      const cheaper = results.monthlyCost < compareResults.monthlyCost ? state.apiModel : compareState.apiModel;
      const diff = Math.abs(results.monthlyCost - compareResults.monthlyCost).toFixed(2);
      return {
        main: `Using ${API_PRICING[cheaper as keyof typeof API_PRICING]?.name || cheaper} saves ${formatCurrency(Number(diff))}/month (${Math.abs(Number(savings))}% less).`,
        detail: `At ${formatNumber(state.tokensPerDay || 0, 'tokens/day')}, the annual savings would be ${formatCurrency(Number(diff) * 12)}. Cost assumes a 50:50 input/output token ratio.`
      };
    }
    
    return {
      main: `Your setup uses ${results.kwh.toFixed(1)} kWh/day, producing ${results.co2.toFixed(2)} kg CO₂.`,
      detail: `API costs: ${formatCurrency(results.dailyCost)}/day (${formatCurrency(results.monthlyCost)}/month). Cost assumes a 50:50 input/output token ratio.`
    };
  };

  // 对比图表数据（硬件相同时不显示 CO₂，因为碳排放只跟硬件有关）
  const sameHardware = compareState?.hardware === state.hardware && compareState?.count === state.count && compareState?.hours === state.hours && compareState?.pue === state.pue;
  const comparisonBarData = compareState ? [
    { 
      name: 'Monthly ($)',
      A: results.monthlyCost,
      B: compareResults?.monthlyCost || 0,
      labelA: API_PRICING[state.apiModel as keyof typeof API_PRICING]?.name || 'Plan A',
      labelB: API_PRICING[compareState.apiModel as keyof typeof API_PRICING]?.name || 'Plan B'
    },
    {
      name: 'Daily ($)',
      A: results.dailyCost,
      B: compareResults?.dailyCost || 0
    },
    ...(!sameHardware ? [{
      name: 'CO₂ (kg)',
      A: results.co2,
      B: compareResults?.co2 || 0
    }] : [])
  ] : [];

  // 饼图数据
  const pieData = [
    { name: 'GPU Power', value: results.power * state.count, color: '#10b981' },
    { name: 'PUE Overhead', value: results.power * state.count * (state.pue - 1), color: '#f59e0b' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-center sm:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
            <Leaf className="w-6 h-6 text-eco-500" />
            AI Cost & Carbon Calculator
          </h2>
          <p className="text-xs text-slate-500 mt-1">Compare API costs, energy usage, and carbon footprint</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <div className="relative" ref={templateDropdownRef}>
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
            </button>
            
            {showTemplates && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="p-2 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">Quick Start Templates</span>
                </div>
                {PRESET_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full p-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div className="font-medium text-sm text-slate-800">{template.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{template.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {!compareState && (
            <button 
              onClick={enableCompareMode}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          )}
          
          <button 
            onClick={copyShareLink}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${linkCopied ? 'bg-eco-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
            title="Copy share link"
          >
            {linkCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{linkCopied ? 'Copied!' : 'Share'}</span>
          </button>

          <button onClick={exportConfig} className="p-2 bg-eco-50 text-eco-700 rounded-lg hover:bg-eco-100" title="Export JSON">
            <Download className="w-4 h-4" />
          </button>
          
          <label className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer" title="Import JSON">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={importConfig} className="hidden" />
          </label>
          
          <button onClick={resetToDefault} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Config Panel - Collapsible on mobile */}
        <div className={`lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${configCollapsed ? 'max-h-14' : ''}`}>
          <button 
            onClick={() => setConfigCollapsed(!configCollapsed)}
            className="w-full p-4 flex items-center justify-between lg:hidden bg-slate-50 border-b border-slate-100"
          >
            <span className="font-semibold text-slate-700">Configuration</span>
            {configCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          <div className={`p-4 space-y-4 ${configCollapsed ? 'hidden lg:block' : ''}`}>
            {/* API Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">API Model (Plan A)</label>
              <select 
                value={state.apiModel || 'deepseek-v3'}
                onChange={(e) => handleChange('apiModel', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                {Object.entries(API_PRICING).map(([key, val]) => (
                  <option key={key} value={key}>{val.name} (${val.input}/${val.output})</option>
                ))}
              </select>
            </div>

            {/* Compare Model */}
            {compareState && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Compare Model (Plan B)</label>
                  <button onClick={() => setCompareState(null)} className="text-slate-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <select 
                  value={compareState.apiModel || 'gpt-4o'}
                  onChange={(e) => setCompareState(prev => prev ? {...prev, apiModel: e.target.value} : null)}
                  className="w-full p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-sm"
                >
                  {Object.entries(API_PRICING).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tokens per day */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tokens/Day</label>
              <input 
                type="number" 
                value={state.tokensPerDay || 100000}
                onChange={(e) => handleChange('tokensPerDay', parseInt(e.target.value) || 100000)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
              <div className="flex gap-1 flex-wrap">
                {[100000, 500000, 1000000, 5000000].map(t => (
                  <button 
                    key={t} 
                    onClick={() => handleChange('tokensPerDay', t)}
                    className={`px-2 py-1 text-xs rounded ${state.tokensPerDay === t ? 'bg-eco-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {t >= 1000000 ? `${t/1000000}M` : `${t/1000}K`}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Hardware</label>
              <select 
                value={state.hardware}
                onChange={(e) => handleChange('hardware', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                {HARDWARE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">GPUs</label>
                <input type="number" min="1" value={state.count} onChange={(e) => handleChange('count', parseInt(e.target.value) || 1)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Hours</label>
                <input type="number" min="1" value={state.hours} onChange={(e) => handleChange('hours', parseFloat(e.target.value) || 1)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">PUE</label>
                <input type="number" min="1" max="2" step="0.1" value={state.pue} onChange={(e) => handleChange('pue', parseFloat(e.target.value) || 1.2)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Cost Cards with formatted values */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-eco-50 to-emerald-50 p-4 rounded-xl border border-eco-100">
              <div className="text-xs text-eco-600 font-medium">Daily Cost</div>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(results.dailyCost)}</div>
              <div className="text-xs text-slate-500">{results.pricing.name}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
              <div className="text-xs text-purple-600 font-medium">Monthly Cost</div>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(results.monthlyCost)}</div>
              <div className="text-xs text-slate-500">{formatNumber(state.tokensPerDay || 0, 'tokens/day')}</div>
            </div>
          </div>

          {/* Compare Results with savings indicator */}
          {compareState && compareResults && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Plan B Daily</div>
                  <div className="text-xl font-bold text-slate-700">{formatCurrency(compareResults.dailyCost)}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Plan B Monthly</div>
                  <div className="text-xl font-bold text-slate-700">{formatCurrency(compareResults.monthlyCost)}</div>
                </div>
              </div>
              {/* Savings Badge */}
              {results.monthlyCost !== compareResults.monthlyCost && (
                <div className={`p-3 rounded-xl text-center text-sm font-medium ${results.monthlyCost < compareResults.monthlyCost ? 'bg-eco-100 text-eco-800' : 'bg-red-100 text-red-800'}`}>
                  {results.monthlyCost < compareResults.monthlyCost 
                    ? `🎉 Plan A saves ${formatCurrency(compareResults.monthlyCost - results.monthlyCost)}/month (${((1 - results.monthlyCost / compareResults.monthlyCost) * 100).toFixed(0)}% less)`
                    : `⚠️ Plan B saves ${formatCurrency(results.monthlyCost - compareResults.monthlyCost)}/month`
                  }
                </div>
              )}
            </div>
          )}

          {/* Carbon Stats with units */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="w-5 h-5 text-eco-500" />
              <span className="font-semibold text-slate-700">Carbon Footprint</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-slate-800">{results.co2.toFixed(1)}<span className="text-xs font-normal text-slate-500 ml-1">kg</span></div>
                <div className="text-xs text-slate-500">CO₂/day</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{results.kwh.toFixed(1)}<span className="text-xs font-normal text-slate-500 ml-1">kWh</span></div>
                <div className="text-xs text-slate-500">Energy/day</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{Math.ceil(results.co2 * 4)}<span className="text-xs font-normal text-slate-500 ml-1">km</span></div>
                <div className="text-xs text-slate-500">Car equiv.</div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          {(() => { const insight = generateInsight(); return (
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-900">💡 {insight.main}</p>
                <p className="text-xs text-indigo-700 mt-1">{insight.detail}</p>
              </div>
            </div>
          </div>
          ); })()}
        </div>

        {/* Chart Panel */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Visualization</span>
            <div className="flex gap-1">
              <button 
                onClick={() => setShowChart('compare')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${showChart === 'compare' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Compare
              </button>
              <button 
                onClick={() => setShowChart('pie')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${showChart === 'pie' ? 'bg-eco-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Pie
              </button>
            </div>
          </div>
          
          <div className="h-56 md:h-64">
            {showChart === 'compare' && compareState && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonBarData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="A" name={API_PRICING[state.apiModel as keyof typeof API_PRICING]?.name || 'Plan A'} fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="B" name={API_PRICING[compareState.apiModel as keyof typeof API_PRICING]?.name || 'Plan B'} fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {showChart === 'compare' && !compareState && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <GitCompare className="w-10 h-10 mb-2 opacity-50" />
                <p>Click "Compare" button above</p>
                <p className="text-xs mt-1">to enable comparison mode</p>
              </div>
            )}
            
            {showChart === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(0)} W`} />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {!showChart && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <div className="text-4xl mb-2">📊</div>
                <p>Select a chart type</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};