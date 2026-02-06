import React, { useState, useEffect, useCallback } from 'react';
import { CalculatorState } from '../types';
import { HARDWARE_OPTIONS } from '../constants';
import { Leaf, Cloud, Download, Upload, RotateCcw, BookOpen, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// 预设模板库
const PRESET_TEMPLATES = [
  {
    id: 'personal-carbon',
    name: '🌱 Personal AI Carbon Footprint',
    description: 'Estimate your daily AI usage impact',
    config: { hardware: 't4', count: 1, hours: 8, pue: 1.2, region: 'global' }
  },
  {
    id: 'startup-inference',
    name: '🚀 Startup Inference Server',
    description: 'Small-scale production deployment',
    config: { hardware: 'a100', count: 2, hours: 24, pue: 1.3, region: 'global' }
  },
  {
    id: 'research-training',
    name: '🔬 Research Training Job',
    description: 'Multi-GPU training workload',
    config: { hardware: 'h100', count: 8, hours: 72, pue: 1.1, region: 'global' }
  },
  {
    id: 'edge-deployment',
    name: '📱 Edge/Mobile Deployment',
    description: 'Low-power edge inference',
    config: { hardware: 'cpu', count: 1, hours: 24, pue: 1.0, region: 'global' }
  },
  {
    id: 'enterprise-cluster',
    name: '🏢 Enterprise AI Cluster',
    description: 'Large-scale enterprise deployment',
    config: { hardware: 'rtx5090', count: 16, hours: 168, pue: 1.4, region: 'global' }
  }
];

// 本地存储 key
const STORAGE_KEY = 'ecocompute_calculator_state';

export const Calculator: React.FC = () => {
  // 从本地存储加载初始状态
  const loadSavedState = (): CalculatorState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved calculator state');
    }
    return { hardware: 'rtx5090', count: 1, hours: 24, pue: 1.2, region: 'global' };
  };

  const [state, setState] = useState<CalculatorState>(loadSavedState);
  const [result, setResult] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showChart, setShowChart] = useState<'pie' | 'bar' | null>(null);

  // 自动保存到本地存储
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 计算结果
  const hw = HARDWARE_OPTIONS.find(h => h.value === state.hardware);
  const power = hw ? hw.power : 200;
  const kwh = (power * state.count * state.hours * state.pue) / 1000;
  const co2 = kwh * 0.475; // kg CO2

  useEffect(() => {
    setResult(co2);
  }, [co2]);

  const handleChange = (field: keyof CalculatorState, value: string | number) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  // 应用模板
  const applyTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    setState(template.config);
    setShowTemplates(false);
  };

  // 重置为默认值
  const resetToDefault = () => {
    setState({ hardware: 'rtx5090', count: 1, hours: 24, pue: 1.2, region: 'global' });
  };

  // 导出为 JSON
  const exportConfig = () => {
    const exportData = {
      config: state,
      result: {
        co2_kg: result,
        kwh: kwh,
        equivalent_km: Math.ceil(result * 4)
      },
      timestamp: new Date().toISOString(),
      hardware_info: hw
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecocompute-carbon-${Date.now()}.json`;
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
        if (data.config) {
          setState(data.config);
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // 图表数据
  const pieData = [
    { name: 'GPU Power', value: power * state.count, color: '#10b981' },
    { name: 'PUE Overhead', value: power * state.count * (state.pue - 1), color: '#f59e0b' },
  ];

  const barData = HARDWARE_OPTIONS.slice(0, 5).map(opt => ({
    name: opt.label.split(' ')[1], // 提取 GPU 名称
    power: opt.power,
    co2: ((opt.power * state.count * state.hours * state.pue) / 1000) * 0.475,
    isCurrent: opt.value === state.hardware
  }));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
            <Leaf className="w-7 h-7 md:w-8 md:h-8 text-eco-500" />
            Carbon Footprint Calculator
          </h2>
          <p className="text-sm text-slate-500 mt-1">Estimate the environmental impact of your AI workloads.</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Templates Dropdown */}
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
          
          <button 
            onClick={exportConfig}
            className="flex items-center gap-2 px-3 py-2 bg-eco-50 text-eco-700 rounded-lg hover:bg-eco-100 text-sm font-medium transition-colors"
            title="Export configuration"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
            <input type="file" accept=".json" onChange={importConfig} className="hidden" />
          </label>
          
          <button 
            onClick={resetToDefault}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Hardware Type</label>
            <select 
              value={state.hardware}
              onChange={(e) => handleChange('hardware', e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-eco-500 outline-none text-sm"
            >
              {HARDWARE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">GPU Count</label>
              <input 
                type="number" 
                min="1"
                value={state.count}
                onChange={(e) => handleChange('count', parseInt(e.target.value) || 1)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-eco-500 outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Hours</label>
              <input 
                type="number" 
                min="1"
                value={state.hours}
                onChange={(e) => handleChange('hours', parseFloat(e.target.value) || 1)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-eco-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">PUE (Efficiency)</label>
            <div className="flex items-center gap-2">
               <input 
                type="range" 
                min="1.0"
                max="2.0"
                step="0.05"
                value={state.pue}
                onChange={(e) => handleChange('pue', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco-600"
              />
              <span className="text-sm font-mono text-slate-600 w-10">{state.pue.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-400">1.0 ideal · 1.2 Google · 1.5 standard</p>
          </div>
          
          {/* Quick Stats */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Power Draw</span>
              <span className="font-medium text-slate-700">{(power * state.count).toLocaleString()} W</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Energy Used</span>
              <span className="font-medium text-slate-700">{kwh.toFixed(2)} kWh</span>
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-1 bg-gradient-to-br from-eco-50 to-emerald-50 p-5 rounded-2xl border border-eco-100 flex flex-col justify-center items-center text-center space-y-5">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Cloud className={`w-10 h-10 md:w-12 md:h-12 text-eco-500 transition-all duration-500 ${result > 10 ? 'opacity-100' : 'opacity-80'}`} />
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
              {result.toFixed(2)}
              <span className="text-xl md:text-2xl text-slate-500 ml-2 font-normal">kg CO₂e</span>
            </div>
            <p className="text-eco-700 mt-2 font-medium">Estimated Emissions</p>
          </div>
          
          <div className="w-full space-y-2">
            <div className="bg-white/60 p-3 rounded-xl text-sm text-slate-600">
              🚗 Driving <span className="font-bold text-slate-800">{Math.ceil(result * 4)} km</span>
            </div>
            <div className="bg-white/60 p-3 rounded-xl text-sm text-slate-600">
              🌳 Absorb in <span className="font-bold text-slate-800">{Math.ceil(result / 21)} trees/year</span>
            </div>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Visualization</span>
            <div className="flex gap-1">
              <button 
                onClick={() => setShowChart(showChart === 'pie' ? null : 'pie')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${showChart === 'pie' ? 'bg-eco-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Pie
              </button>
              <button 
                onClick={() => setShowChart(showChart === 'bar' ? null : 'bar')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${showChart === 'bar' ? 'bg-eco-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Compare
              </button>
            </div>
          </div>
          
          <div className="h-48 md:h-56">
            {showChart === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(0)} W`} />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {showChart === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} kg CO₂`} />
                  <Bar dataKey="co2" fill="#10b981" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#059669' : '#d1fae5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {!showChart && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <div className="text-4xl mb-2">📊</div>
                <p>Select a chart type above</p>
                <p className="text-xs mt-1">to visualize your data</p>
              </div>
            )}
          </div>
          
          <p className="text-xs text-slate-400 text-center">
            Click chart buttons to toggle visualization
          </p>
        </div>
      </div>
    </div>
  );
};