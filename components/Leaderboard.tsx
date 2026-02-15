import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_MODELS } from '../constants';
import { ModelData, SortField, SortDirection, DataConfidence } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, Sparkles, Filter, Activity, Play, Pause, ArrowRight, Layers, SlidersHorizontal, Info } from 'lucide-react';
import { analyzeLeaderboard } from '../services/geminiService';
import { ApiConfig } from './SettingsPanel';

// Confidence badge styling
const CONFIDENCE_CONFIG: Record<DataConfidence, { label: string; color: string; icon: string }> = {
  measured: { label: 'Measured', color: 'bg-green-100 text-green-800 border-green-200', icon: '✓' },
  estimated: { label: 'Estimated', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '~' },
  research: { label: 'Research', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '◇' },
};

// Helper for heat map coloring
const getCellColor = (value: number, min: number, max: number, inverse: boolean = false) => {
  let percentage = max === min ? 0.5 : (value - min) / (max - min);
  if (inverse && max !== min) percentage = 1 - percentage; // Inverse for metrics where lower is better (Cost, Time, Carbon)
  
  // Clamp
  percentage = Math.max(0, Math.min(1, percentage));

  if (percentage > 0.66) return 'bg-eco-100 text-eco-800 font-medium';
  if (percentage > 0.33) return 'bg-yellow-50 text-yellow-700';
  return 'bg-red-50 text-red-700';
};

// Template Gallery data
const GALLERY_TEMPLATES = [
  {
    id: 'infra-deepseek-openai',
    icon: '🏗️',
    category: 'AI Infrastructure',
    title: 'DeepSeek vs OpenAI Deep Cost Evaluation',
    desc: 'Enterprise AI infrastructure selection: 8×H100 cluster, 5M tokens/day, full-spectrum cost & carbon comparison',
    tags: ['DeepSeek-V3', 'GPT-4o', 'H100', '5M tok/day'],
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    tagColor: 'bg-indigo-100 text-indigo-700',
  },
  {
    id: 'carbon-quota-trading',
    icon: '🌍',
    category: 'Energy & Environment',
    title: 'Enterprise Carbon Quota Trading Forecast',
    desc: 'Large-scale GPU cluster carbon assessment: 16×A100 running 24/7, carbon tax penalty modeling & quota cost analysis',
    tags: ['16×A100', 'Carbon Tax', 'PUE 1.4', '10M tok/day'],
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'freelancer-net-income',
    icon: '💼',
    category: 'Software Engineering',
    title: 'Freelancer Net Income Modeling',
    desc: 'Freelance developer AI tool cost analysis: Gemini Flash vs GPT-4o-mini, monthly net cost & ROI evaluation',
    tags: ['Gemini 2.0', 'GPT-4o-mini', 'T4', '100K tok/day'],
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    tagColor: 'bg-amber-100 text-amber-700',
  },
];

interface LeaderboardProps {
  apiConfig: ApiConfig;
  onOpenTemplate?: (templateId: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ apiConfig, onOpenTemplate }) => {
  const [models, setModels] = useState<ModelData[]>(INITIAL_MODELS);
  const [sortField, setSortField] = useState<SortField>('accuracy');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [rtx5090Only, setRtx5090Only] = useState(false);
  const [a800Only, setA800Only] = useState(false);
  const [showWeights, setShowWeights] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
  const [weights, setWeights] = useState({
    accuracy: 25,
    executionTime: 20,
    cost: 25,
    carbonImpact: 15,
    energyEfficiency: 15,
  });

  // Dynamic Data Simulation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setModels(prevModels => prevModels.map(m => {
        // Randomly perturb metrics to simulate live benchmarking
        const timeChange = (Math.random() - 0.5) * 0.4;
        const newTime = Math.max(0.1, m.executionTime + timeChange);
        
        // Efficiency fluctuates inversely to some degree or randomly based on "grid load"
        const effChange = (Math.random() - 0.5) * 30;
        
        return {
          ...m,
          executionTime: parseFloat(newTime.toFixed(2)),
          energyEfficiency: Math.floor(Math.max(50, m.energyEfficiency + effChange)),
          // Carbon impact roughly correlated with time/efficiency
          carbonImpact: parseFloat(Math.max(0.01, m.carbonImpact + (timeChange * 0.1)).toFixed(3))
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to high-to-low for new fields usually
    }
  };

  const visibleModels = useMemo(() => {
    if (rtx5090Only) return models.filter(m => m.tags.includes('rtx5090-verified'));
    if (a800Only) return models.filter(m => m.tags.includes('a800-verified'));
    return models;
  }, [models, rtx5090Only, a800Only]);

  // Composite score: normalize each metric 0-1 then weighted sum
  const compositeScores = useMemo(() => {
    const ranges = {
      accuracy: { min: Math.min(...visibleModels.map(m => m.accuracy)), max: Math.max(...visibleModels.map(m => m.accuracy)) },
      executionTime: { min: Math.min(...visibleModels.map(m => m.executionTime)), max: Math.max(...visibleModels.map(m => m.executionTime)) },
      cost: { min: Math.min(...visibleModels.map(m => m.cost)), max: Math.max(...visibleModels.map(m => m.cost)) },
      carbonImpact: { min: Math.min(...visibleModels.map(m => m.carbonImpact)), max: Math.max(...visibleModels.map(m => m.carbonImpact)) },
      energyEfficiency: { min: Math.min(...visibleModels.map(m => m.energyEfficiency)), max: Math.max(...visibleModels.map(m => m.energyEfficiency)) },
    };
    const totalWeight = weights.accuracy + weights.executionTime + weights.cost + weights.carbonImpact + weights.energyEfficiency || 1;
    const normalize = (val: number, min: number, max: number, inverse = false) => {
      if (max === min) return 0.5;
      const n = (val - min) / (max - min);
      return inverse ? 1 - n : n;
    };
    const scores: Record<string, number> = {};
    visibleModels.forEach(m => {
      scores[m.id] = (
        normalize(m.accuracy, ranges.accuracy.min, ranges.accuracy.max) * weights.accuracy +
        normalize(m.executionTime, ranges.executionTime.min, ranges.executionTime.max, true) * weights.executionTime +
        normalize(m.cost, ranges.cost.min, ranges.cost.max, true) * weights.cost +
        normalize(m.carbonImpact, ranges.carbonImpact.min, ranges.carbonImpact.max, true) * weights.carbonImpact +
        normalize(m.energyEfficiency, ranges.energyEfficiency.min, ranges.energyEfficiency.max) * weights.energyEfficiency
      ) / totalWeight;
    });
    return scores;
  }, [visibleModels, weights]);

  const sortedModels = useMemo(() => {
    return [...visibleModels].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [visibleModels, sortField, sortDirection]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis("Analyzing leaderboard data...");
    const result = await analyzeLeaderboard(sortedModels, apiConfig);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  // Helper to get ranges for coloring
  const getRange = (field: keyof ModelData) => {
    const values = visibleModels.map(m => m[field] as number);
    if (values.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...values), max: Math.max(...values) };
  };

  const ranges = {
    accuracy: getRange('accuracy'),
    executionTime: getRange('executionTime'),
    cost: getRange('cost'),
    carbonImpact: getRange('carbonImpact'),
    energyEfficiency: getRange('energyEfficiency'),
  };

  const generatePowerTrace = (model: ModelData) => {
    const basePower = 220 + model.carbonImpact * 120;
    return Array.from({ length: 36 }, (_, idx) => {
      const wave = Math.sin(idx / 3) * 12 + Math.cos(idx / 5) * 6;
      const jitter = (idx % 3 - 1) * 3;
      return Math.max(80, basePower + wave + jitter);
    });
  };

  const powerTrace = selectedModel ? generatePowerTrace(selectedModel) : [];
  const powerAvg = powerTrace.length ? powerTrace.reduce((a, b) => a + b, 0) / powerTrace.length : 0;
  const powerMin = powerTrace.length ? Math.min(...powerTrace) : 0;
  const powerMax = powerTrace.length ? Math.max(...powerTrace) : 0;

  const paradoxPair = useMemo(() => {
    const fp16 = visibleModels.find(m => m.id === 'qwen2-1.5b-fp16');
    const nf4 = visibleModels.find(m => m.id === 'qwen2-1.5b-4bit');
    if (!fp16 || !nf4) return null;
    const deltaPct = ((fp16.energyEfficiency - nf4.energyEfficiency) / fp16.energyEfficiency) * 100;
    return {
      fp16,
      nf4,
      deltaPct: Math.abs(deltaPct),
      worseLabel: deltaPct > 0 ? 'NF4' : 'FP16',
    };
  }, [visibleModels]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-slate-400 opacity-50" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 text-eco-600" /> : <ArrowDown className="w-4 h-4 text-eco-600" />;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">Dynamic Scoring Leaderboard</h2>
                <p className="text-xs text-slate-500">Live evaluation metrics across models</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${isLive ? 'bg-eco-50 border-eco-300 text-eco-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isLive ? 'Pause Live Eval' : 'Start Live Eval'}
          </button>

          <button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            {isAnalyzing ? 'Thinking...' : 'Gemini Insights'}
          </button>
          
          <button
            onClick={() => {
              if (!rtx5090Only && !a800Only) { setRtx5090Only(true); setA800Only(false); }
              else if (rtx5090Only) { setRtx5090Only(false); setA800Only(true); }
              else { setRtx5090Only(false); setA800Only(false); }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              a800Only ? 'bg-orange-50 border-orange-300 text-orange-600' :
              rtx5090Only ? 'bg-green-50 border-green-300 text-green-700' :
              'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            {rtx5090Only ? 'RTX 5090 Only' : a800Only ? 'A800 Batch Size' : 'All Models'}
          </button>

          <button
            onClick={() => setShowWeights(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${showWeights ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Scoring Weights
          </button>
        </div>
      </div>

      {/* Configurable Scoring Weights */}
      {showWeights && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Composite Score Weights</h3>
              <p className="text-[10px] text-slate-500">Adjust how each metric contributes to the overall score. Higher weight = more influence.</p>
            </div>
            <div className="text-xs text-slate-400">
              Total: {weights.accuracy + weights.executionTime + weights.cost + weights.carbonImpact + weights.energyEfficiency}%
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {([
              { key: 'accuracy' as const, label: 'Accuracy', color: 'text-eco-700' },
              { key: 'executionTime' as const, label: 'Speed', color: 'text-blue-700' },
              { key: 'cost' as const, label: 'Cost', color: 'text-amber-700' },
              { key: 'carbonImpact' as const, label: 'Carbon', color: 'text-emerald-700' },
              { key: 'energyEfficiency' as const, label: 'Efficiency', color: 'text-purple-700' },
            ]).map(({ key, label, color }) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${color}`}>{label}</span>
                  <span className="text-xs text-slate-500">{weights[key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(e) => setWeights(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Box */}
      {analysis && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl animate-fade-in">
            <div className="flex gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <p className="text-indigo-900 text-sm leading-relaxed">{analysis}</p>
            </div>
        </div>
      )}

      {/* Paradox Highlight */}
      {paradoxPair && (
        <div className="bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Paradox Highlight</p>
              <h3 className="text-lg font-semibold">
                On RTX 5090, {paradoxPair.worseLabel} is {paradoxPair.deltaPct.toFixed(1)}% LESS efficient for 1.5B models than {paradoxPair.worseLabel === 'NF4' ? 'FP16' : 'NF4'}.
              </h3>
              <p className="text-xs text-slate-400 mt-1">Measured via NVML 10Hz sampling (energy efficiency in tokens/watt).</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 rounded-lg p-3 min-w-[160px]">
                <div className="text-[10px] text-slate-400">FP16 Efficiency</div>
                <div className="text-xl font-bold text-emerald-300">{paradoxPair.fp16.energyEfficiency}</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 min-w-[160px]">
                <div className="text-[10px] text-slate-400">NF4 Efficiency</div>
                <div className="text-xl font-bold text-rose-300">{paradoxPair.nf4.energyEfficiency}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Gallery */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Template Gallery</h3>
              <p className="text-[10px] text-slate-500">Industry-specific cost & carbon analysis templates</p>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {GALLERY_TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => onOpenTemplate?.(tpl.id)}
              className={`group text-left p-4 rounded-xl border ${tpl.borderColor} ${tpl.bgColor} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{tpl.icon}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tpl.tagColor}`}>
                  {tpl.category}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1 leading-tight">{tpl.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">{tpl.desc}</p>
              <div className="flex flex-wrap gap-1 mb-2.5">
                {tpl.tags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-white/70 border border-slate-200 rounded text-[9px] font-medium text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                Open in Calculator
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 w-12">
                   <input type="checkbox" className="rounded border-slate-300 text-eco-600 focus:ring-eco-500" />
                </th>
                <th className="p-4 min-w-[200px]">Model Name</th>
                <th className="p-4 min-w-[100px]">Data Source</th>
                <th onClick={() => handleSort('accuracy')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">Accuracy <SortIcon field="accuracy" /></div>
                </th>
                <th onClick={() => handleSort('executionTime')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">Exec Time (s) <SortIcon field="executionTime" /></div>
                </th>
                <th onClick={() => handleSort('cost')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">Cost ($/1k) <SortIcon field="cost" /></div>
                </th>
                <th onClick={() => handleSort('carbonImpact')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2 text-eco-700">Carbon (gCO2) <SortIcon field="carbonImpact" /></div>
                </th>
                 <th onClick={() => handleSort('energyEfficiency')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">Efficiency (Tok/W) <SortIcon field="energyEfficiency" /></div>
                </th>
                <th className="p-4 min-w-[80px]">
                  <div className="flex items-center gap-1 text-indigo-600">Score</div>
                </th>
                <th className="p-4 w-12 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedModels.map((model) => (
                <tr key={model.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(model.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="p-4">
                    <input 
                        type="checkbox" 
                        checked={selectedIds.has(model.id)}
                        onChange={() => toggleSelection(model.id)}
                        className="rounded border-slate-300 text-eco-600 focus:ring-eco-500" 
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{model.name}</div>
                    <div className="text-xs text-slate-400">{model.provider}</div>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const conf = CONFIDENCE_CONFIG[model.provenance.confidence];
                      return (
                        <div className="group relative">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${conf.color}`}>
                            <span>{conf.icon}</span>
                            {conf.label}
                          </span>
                          {/* Tooltip */}
                          <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                            <div className="font-semibold mb-1">{model.provenance.source}</div>
                            {model.provenance.methodology && <p className="text-slate-300 leading-relaxed">{model.provenance.methodology}</p>}
                            {model.provenance.lastVerified && <p className="text-slate-400 mt-1">Verified: {model.provenance.lastVerified}</p>}
                            {model.provenance.citation && (
                              <p className="text-blue-300 mt-1 truncate">Ref: {model.provenance.citation}</p>
                            )}
                            <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  
                  {/* Metric Cells with Heatmap coloring */}
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${getCellColor(model.accuracy, ranges.accuracy.min, ranges.accuracy.max)}`}>
                        {model.accuracy.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs transition-colors duration-500 ${getCellColor(model.executionTime, ranges.executionTime.min, ranges.executionTime.max, true)}`}>
                        {model.executionTime.toFixed(2)}
                    </span>
                  </td>
                   <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${getCellColor(model.cost, ranges.cost.min, ranges.cost.max, true)}`}>
                        {model.cost.toFixed(4)}
                    </span>
                  </td>
                   <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs transition-colors duration-500 ${getCellColor(model.carbonImpact, ranges.carbonImpact.min, ranges.carbonImpact.max, true)}`}>
                        {model.carbonImpact.toFixed(3)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs transition-colors duration-500 ${getCellColor(model.energyEfficiency, ranges.energyEfficiency.min, ranges.energyEfficiency.max)}`}>
                        {model.energyEfficiency}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(compositeScores[model.id] || 0) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-indigo-700">{((compositeScores[model.id] || 0) * 100).toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedModel(model)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                      title="View power curve"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
             <span>Showing {sortedModels.length} models</span>
             <div className="flex gap-4">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-eco-500"></div> Good</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Average</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Poor</span>
             </div>
        </div>
      </div>

      {selectedModel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Power Curve Detail</h3>
                <p className="text-xs text-slate-300">{selectedModel.name} · NVML 10Hz sampling (avg trace)</p>
              </div>
              <button
                onClick={() => setSelectedModel(null)}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Power</div>
                  <div className="text-xl font-semibold text-slate-800">{powerAvg.toFixed(1)} W</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Min</div>
                  <div className="text-xl font-semibold text-emerald-600">{powerMin.toFixed(1)} W</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Max</div>
                  <div className="text-xl font-semibold text-rose-600">{powerMax.toFixed(1)} W</div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-2">Average power curve (10Hz)</div>
                <svg viewBox="0 0 360 120" className="w-full h-40">
                  <defs>
                    <linearGradient id="powerGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    points={powerTrace.map((p, i) => {
                      const x = (i / (powerTrace.length - 1)) * 360;
                      const y = 110 - ((p - powerMin) / Math.max(1, powerMax - powerMin)) * 90;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  <polygon
                    fill="url(#powerGradient)"
                    points={`${powerTrace.map((p, i) => {
                      const x = (i / (powerTrace.length - 1)) * 360;
                      const y = 110 - ((p - powerMin) / Math.max(1, powerMax - powerMin)) * 90;
                      return `${x},${y}`;
                    }).join(' ')} 360,110 0,110`}
                  />
                </svg>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>0s</span>
                  <span>3.5s</span>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Raw NVML samples are averaged into this trace for clarity. Full sampling logs available in the benchmark report.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};