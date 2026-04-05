import React, { useState, useMemo } from 'react';
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Calculator, Cpu, MemoryStick, Gauge } from 'lucide-react';

interface Recommendation {
  quantization: string;
  reasoning: string;
  energySavings: string;
  accuracyImpact: string;
  memoryReduction: string;
  confidence: number;
  useCase: string;
}

interface RecommendationEngineProps {
  data?: any[];
}

const defaultRecommendations = {
  small: {
    quantization: 'FP16',
    reasoning: 'For small models (≤3B), FP16 provides the best energy efficiency with minimal memory overhead',
    energySavings: 'Baseline (most efficient)',
    accuracyImpact: 'None (baseline)',
    memoryReduction: '0%',
    confidence: 95,
    useCase: 'Edge deployment, real-time inference'
  },
  medium: {
    quantization: 'FP16',
    reasoning: 'Medium models (3-6B) still benefit most from FP16 when GPU memory allows',
    energySavings: 'Baseline (most efficient)',
    accuracyImpact: 'None (baseline)',
    memoryReduction: '0%',
    confidence: 85,
    useCase: 'Cloud deployment, batch processing'
  },
  large: {
    quantization: 'NF4',
    reasoning: 'Large models (≥6B) benefit from NF4 quantization with 5.3% energy savings and 75% memory reduction',
    energySavings: '5.3%',
    accuracyImpact: '+15.6% perplexity',
    memoryReduction: '75%',
    confidence: 80,
    useCase: 'Memory-constrained environments'
  }
};

export default function RecommendationEngine({ data }: RecommendationEngineProps) {
  const [modelSize, setModelSize] = useState<string>('6B');
  const [gpuMemory, setGpuMemory] = useState<string>('24GB');
  const [priority, setPriority] = useState<'energy' | 'accuracy' | 'memory'>('energy');
  const [useCase, setUseCase] = useState<'realtime' | 'batch' | 'edge'>('batch');
  const [dailyTokens, setDailyTokens] = useState<string>('1000000');

  const recommendation = useMemo(() => {
    const sizeNum = parseFloat(modelSize);
    const memoryNum = parseFloat(gpuMemory);
    
    // Logic based on actual findings
    if (sizeNum >= 6 && memoryNum < 16) {
      return {
        quantization: 'NF4',
        reasoning: 'Large model (≥6B) with limited GPU memory: NF4 provides 75% memory reduction with 5.3% energy savings',
        energySavings: '5.3%',
        accuracyImpact: '+15.6% perplexity',
        memoryReduction: '75%',
        confidence: 85,
        useCase: 'Memory-constrained deployment'
      };
    } else if (sizeNum >= 6 && memoryNum >= 16) {
      return {
        quantization: 'FP16',
        reasoning: 'Large model with sufficient GPU memory: FP16 remains most energy-efficient',
        energySavings: 'Baseline (most efficient)',
        accuracyImpact: 'None (baseline)',
        memoryReduction: '0%',
        confidence: 90,
        useCase: 'High-performance deployment'
      };
    } else if (sizeNum < 6 && priority === 'memory') {
      return {
        quantization: 'NF4',
        reasoning: 'Small-to-medium model with memory priority: NF4 saves memory but costs 25-34% more energy',
        energySavings: '-29% (cost)',
        accuracyImpact: '+18.5% perplexity',
        memoryReduction: '75%',
        confidence: 75,
        useCase: 'Memory-critical applications'
      };
    } else {
      return {
        quantization: 'FP16',
        reasoning: 'Small-to-medium model: FP16 provides optimal energy efficiency',
        energySavings: 'Baseline (most efficient)',
        accuracyImpact: 'None (baseline)',
        memoryReduction: '0%',
        confidence: 95,
        useCase: 'General deployment'
      };
    }
  }, [modelSize, gpuMemory, priority]);

  const costAnalysis = useMemo(() => {
    const tokens = parseFloat(dailyTokens) || 1000000;
    const baseEnergy = tokens / 1000 * 200; // Base J per 1k tokens
    const savings = recommendation.energySavings.includes('%') 
      ? parseFloat(recommendation.energySavings) / 100
      : 0;
    
    const dailyEnergy = recommendation.quantization === 'FP16' 
      ? baseEnergy 
      : baseEnergy * (1 - savings);
    
    const yearlyEnergy = dailyEnergy * 365;
    const co2Savings = recommendation.quantization !== 'FP16' 
      ? (yearlyEnergy * savings) / 1000 * 0.5 // kg CO2 per kWh
      : 0;
    
    return {
      dailyEnergy: dailyEnergy.toFixed(0),
      yearlyEnergy: yearlyEnergy.toFixed(0),
      co2Savings: co2Savings.toFixed(1)
    };
  }, [dailyTokens, recommendation]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationColor = (quant: string) => {
    switch (quant) {
      case 'FP16': return 'border-blue-500/30 bg-blue-500/5';
      case 'INT8': return 'border-red-500/30 bg-red-500/5';
      case 'NF4': return 'border-green-500/30 bg-green-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const getQuantIcon = (quant: string) => {
    switch (quant) {
      case 'FP16': return <Zap className="w-5 h-5 text-blue-600" />;
      case 'INT8': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'NF4': return <TrendingUp className="w-5 h-5 text-green-600" />;
      default: return <Cpu className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Configuration */}
      <div className="bg-white/50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-eco-500/20 p-2 rounded-lg">
            <Brain className="w-5 h-5 text-eco-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Energy Optimization Recommender</h2>
            <p className="text-xs text-gray-600">Get personalized quantization recommendations based on your requirements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Model Size */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Model Size</label>
            <select 
              value={modelSize}
              onChange={(e) => setModelSize(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:border-eco-500 focus:outline-none"
            >
              <option value="1.1B">1.1B parameters</option>
              <option value="3B">3B parameters</option>
              <option value="6B">6B parameters</option>
              <option value="7B">7B parameters</option>
              <option value="14B">14B parameters</option>
            </select>
          </div>

          {/* GPU Memory */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Available GPU Memory</label>
            <select 
              value={gpuMemory}
              onChange={(e) => setGpuMemory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:border-eco-500 focus:outline-none"
            >
              <option value="8GB">8 GB</option>
              <option value="12GB">12 GB</option>
              <option value="16GB">16 GB</option>
              <option value="24GB">24 GB</option>
              <option value="48GB">48 GB</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Optimization Priority</label>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:border-eco-500 focus:outline-none"
            >
              <option value="energy">Energy Efficiency</option>
              <option value="accuracy">Accuracy Preservation</option>
              <option value="memory">Memory Optimization</option>
            </select>
          </div>

          {/* Daily Tokens */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Daily Token Volume</label>
            <input 
              type="number"
              value={dailyTokens}
              onChange={(e) => setDailyTokens(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:border-eco-500 focus:outline-none"
              placeholder="e.g., 1000000"
            />
          </div>
        </div>

        {/* Use Case Quick Select */}
        <div className="mt-4">
          <label className="text-xs font-medium text-gray-600 block mb-2">Quick Use Case</label>
          <div className="flex gap-2">
            {[
              { id: 'realtime', label: 'Real-time', desc: 'Low latency' },
              { id: 'batch', label: 'Batch', desc: 'High throughput' },
              { id: 'edge', label: 'Edge', desc: 'Resource constrained' }
            ].map(uc => (
              <button
                key={uc.id}
                onClick={() => setUseCase(uc.id as any)}
                className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                  useCase === uc.id
                    ? 'bg-eco-500/20 text-eco-600 border-eco-500/50'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">{uc.label}</div>
                <div className="text-xs opacity-70">{uc.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation Result */}
      <div className={`border rounded-xl p-6 ${getRecommendationColor(recommendation.quantization)}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getQuantIcon(recommendation.quantization)}
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recommended: {recommendation.quantization}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                  {recommendation.confidence}% Confidence
                </span>
                <span className="text-xs text-gray-600">•</span>
                <span className="text-xs text-gray-600">{recommendation.useCase}</span>
              </div>
            </div>
          </div>
          <CheckCircle className="w-6 h-6 text-eco-600" />
        </div>

        <p className="text-sm text-gray-700 mb-6">{recommendation.reasoning}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/70 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-gray-600">Energy Impact</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{recommendation.energySavings}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Accuracy Impact</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{recommendation.accuracyImpact}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <MemoryStick className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-gray-600">Memory Reduction</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{recommendation.memoryReduction}</div>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-gradient-to-r from-eco-500/10 to-blue-500/10 border border-eco-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-eco-600" />
            <span className="text-sm font-bold text-gray-900">Projected Impact Analysis</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-600">Daily Energy:</span>
              <span className="ml-2 text-gray-900 font-medium">{costAnalysis.dailyEnergy} J</span>
            </div>
            <div>
              <span className="text-xs text-gray-600">Yearly Energy:</span>
              <span className="ml-2 text-gray-900 font-medium">{costAnalysis.yearlyEnergy} J</span>
            </div>
            <div>
              <span className="text-xs text-gray-600">CO₂ Savings:</span>
              <span className="ml-2 text-eco-600 font-medium">{costAnalysis.co2Savings} kg/year</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Options */}
      <div className="bg-white/30 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Alternative Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendation.quantization !== 'FP16' && (
            <div className="bg-blue-500/5 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-600">FP16 (Alternative)</span>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Highest energy efficiency, no accuracy loss, but requires more GPU memory
              </p>
              <div className="text-xs text-gray-600">
                Best if: Memory is not a constraint
              </div>
            </div>
          )}
          
          {recommendation.quantization !== 'NF4' && (
            <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">NF4 (Alternative)</span>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                75% memory reduction, moderate accuracy trade-off
              </p>
              <div className="text-xs text-gray-600">
                Best if: Memory is critically limited
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
