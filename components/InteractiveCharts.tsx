import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { Filter, Download, Eye, EyeOff, Info, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface DataPoint {
  model: string;
  params: string;
  quantization: string;
  gpu: string;
  energyPer1k: number;
  perplexity: number;
  throughput: number;
  memoryUsage: number;
  color?: string;
}

interface InteractiveChartsProps {
  data?: DataPoint[];
}

const defaultData: DataPoint[] = [
  { model: 'Yi-1.5-6B', params: '6B', quantization: 'FP16', gpu: 'RTX 4090D', energyPer1k: 245.8, perplexity: 10.2, throughput: 125.3, memoryUsage: 12.8 },
  { model: 'Yi-1.5-6B', params: '6B', quantization: 'INT8', gpu: 'RTX 4090D', energyPer1k: 642.3, perplexity: 10.9, throughput: 40.2, memoryUsage: 6.4 },
  { model: 'Yi-1.5-6B', params: '6B', quantization: 'NF4', gpu: 'RTX 4090D', energyPer1k: 232.7, perplexity: 11.8, throughput: 98.7, memoryUsage: 3.2 },
  { model: 'Qwen2.5-3B', params: '3B', quantization: 'FP16', gpu: 'RTX 4090D', energyPer1k: 142.3, perplexity: 12.1, throughput: 198.5, memoryUsage: 6.4 },
  { model: 'Qwen2.5-3B', params: '3B', quantization: 'INT8', gpu: 'RTX 4090D', energyPer1k: 372.1, perplexity: 12.8, throughput: 63.2, memoryUsage: 3.2 },
  { model: 'Qwen2.5-3B', params: '3B', quantization: 'NF4', gpu: 'RTX 4090D', energyPer1k: 189.7, perplexity: 14.2, throughput: 142.8, memoryUsage: 1.6 },
  { model: 'Phi-1.1B', params: '1.1B', quantization: 'FP16', gpu: 'RTX 4090D', energyPer1k: 78.4, perplexity: 15.3, throughput: 287.6, memoryUsage: 2.4 },
  { model: 'Phi-1.1B', params: '1.1B', quantization: 'INT8', gpu: 'RTX 4090D', energyPer1k: 205.2, perplexity: 16.1, throughput: 91.8, memoryUsage: 1.2 },
  { model: 'Phi-1.1B', params: '1.1B', quantization: 'NF4', gpu: 'RTX 4090D', energyPer1k: 104.9, perplexity: 18.7, throughput: 207.3, memoryUsage: 0.6 },
];

const quantizationColors = {
  'FP16': '#3b82f6',
  'INT8': '#ef4444', 
  'NF4': '#22c55e'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-bold text-gray-900 mb-2">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toFixed(2)} ${entry.dataKey === 'energyPer1k' ? 'J' : entry.dataKey === 'perplexity' ? 'PPL' : entry.dataKey === 'throughput' ? 'tok/s' : 'GB'}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-bold text-gray-900 mb-2">{`${data.model} - ${data.quantization}`}</p>
        <p className="text-xs text-gray-600">GPU: {data.gpu}</p>
        <p className="text-xs text-gray-600">Params: {data.params}</p>
        <p className="text-xs text-eco-600">Energy: {data.energyPer1k.toFixed(1)} J/1k tokens</p>
        <p className="text-xs text-blue-600">Perplexity: {data.perplexity.toFixed(1)}</p>
        <p className="text-xs text-purple-600">Throughput: {data.throughput.toFixed(1)} tok/s</p>
        <p className="text-xs text-orange-600">Memory: {data.memoryUsage.toFixed(1)} GB</p>
      </div>
    );
  }
  return null;
};

export default function InteractiveCharts({ data = defaultData }: InteractiveChartsProps) {
  const [selectedGPUs, setSelectedGPUs] = useState<string[]>(['RTX 4090D', 'RTX 5090', 'T4']);
  const [selectedModels, setSelectedModels] = useState<string[]>(['Yi-1.5-6B', 'Qwen2.5-3B', 'Phi-1.1B']);
  const [selectedQuantizations, setSelectedQuantizations] = useState<string[]>(['FP16', 'INT8', 'NF4']);
  const [showDetails, setShowDetails] = useState(true);
  const [chartType, setChartType] = useState<'energy' | 'scatter'>('energy');

  const uniqueGPUs = useMemo(() => [...new Set(data.map(d => d.gpu))], [data]);
  const uniqueModels = useMemo(() => [...new Set(data.map(d => d.model))], [data]);
  const uniqueQuantizations = useMemo(() => [...new Set(data.map(d => d.quantization))], [data]);

  const filteredData = useMemo(() => {
    return data.filter(d => 
      selectedGPUs.includes(d.gpu) &&
      selectedModels.includes(d.model) &&
      selectedQuantizations.includes(d.quantization)
    );
  }, [data, selectedGPUs, selectedModels, selectedQuantizations]);

  const handleGPUFilter = (gpu: string) => {
    setSelectedGPUs(prev => 
      prev.includes(gpu) ? prev.filter(g => g !== gpu) : [...prev, gpu]
    );
  };

  const handleModelFilter = (model: string) => {
    setSelectedModels(prev => 
      prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
    );
  };

  const handleQuantizationFilter = (quant: string) => {
    setSelectedQuantizations(prev => 
      prev.includes(quant) ? prev.filter(q => q !== quant) : [...prev, quant]
    );
  };

  const exportData = () => {
    const csv = [
      ['Model', 'Params', 'Quantization', 'GPU', 'Energy/1k (J)', 'Perplexity', 'Throughput (tok/s)', 'Memory (GB)'],
      ...filteredData.map(d => [d.model, d.params, d.quantization, d.gpu, d.energyPer1k, d.perplexity, d.throughput, d.memoryUsage])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy_benchmark_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-eco-600" />
            <span className="text-sm font-bold text-gray-900">Interactive Filters</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
              title={showDetails ? "Hide details" : "Show details"}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={exportData}
              className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
              title="Export filtered data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GPU Filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">GPU Architecture</label>
            <div className="flex flex-wrap gap-2">
              {uniqueGPUs.map(gpu => (
                <button
                  key={gpu}
                  onClick={() => handleGPUFilter(gpu)}
                  className={`px-2 py-1 text-xs rounded-full border transition-all ${
                    selectedGPUs.includes(gpu)
                      ? 'bg-blue-500/20 text-blue-600 border-blue-500/50'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {gpu}
                </button>
              ))}
            </div>
          </div>

          {/* Model Filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Model Size</label>
            <div className="flex flex-wrap gap-2">
              {uniqueModels.map(model => (
                <button
                  key={model}
                  onClick={() => handleModelFilter(model)}
                  className={`px-2 py-1 text-xs rounded-full border transition-all ${
                    selectedModels.includes(model)
                      ? 'bg-purple-500/20 text-purple-600 border-purple-500/50'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {model.split('-')[0]}-{model.split('-')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Quantization Filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Quantization Method</label>
            <div className="flex flex-wrap gap-2">
              {uniqueQuantizations.map(quant => (
                <button
                  key={quant}
                  onClick={() => handleQuantizationFilter(quant)}
                  className={`px-2 py-1 text-xs rounded-full border transition-all ${
                    selectedQuantizations.includes(quant)
                      ? 'bg-eco-500/20 text-eco-600 border-eco-500/50'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {quant}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center gap-4 mt-4">
          <label className="text-xs font-medium text-gray-600">Chart Type:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('energy')}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                chartType === 'energy'
                  ? 'bg-orange-500/20 text-orange-600 border-orange-500/50'
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}
            >
              Energy Comparison
            </button>
            <button
              onClick={() => setChartType('scatter')}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                chartType === 'scatter'
                  ? 'bg-orange-500/20 text-orange-600 border-orange-500/50'
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}
            >
              Energy vs Accuracy
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white/30 border border-gray-200 rounded-xl p-6">
        {chartType === 'energy' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Energy Consumption by Quantization Method</h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Info className="w-3 h-3" />
                <span>Energy per 1,000 generated tokens (lower is better)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="model" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Energy (J/1k tokens)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="energyPer1k" name="Energy (J/1k)" fill={(entry: any) => quantizationColors[entry.quantization as keyof typeof quantizationColors]}>
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={quantizationColors[entry.quantization as keyof typeof quantizationColors]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Energy vs Accuracy Trade-off</h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Info className="w-3 h-3" />
                <span>Hover for detailed metrics</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="perplexity" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Perplexity (lower is better)', position: 'insideBottom', offset: -5, style: { fill: '#6b7280' } }}
                />
                <YAxis 
                  dataKey="energyPer1k" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Energy (J/1k tokens)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                />
                <Tooltip content={<ScatterTooltip />} />
                <Scatter data={filteredData} fill="#8884d8">
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={quantizationColors[entry.quantization as keyof typeof quantizationColors]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Key Insights */}
        {showDetails && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-red-500">INT8 Overhead</span>
              </div>
              <p className="text-xs text-gray-700">
                Default INT8 increases energy by 80-162% due to mixed-precision decomposition
              </p>
            </div>
            <div className="bg-eco-500/10 border border-eco-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-eco-600" />
                <span className="text-sm font-bold text-eco-600">NF4 Sweet Spot</span>
              </div>
              <p className="text-xs text-gray-700">
                NF4 saves energy (5.3%) only for models ≥6B parameters
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-600">FP16 Efficiency</span>
              </div>
              <p className="text-xs text-gray-700">
                FP16 remains most energy-efficient when GPU memory allows
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
