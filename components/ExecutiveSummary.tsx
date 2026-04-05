import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, Zap, AlertTriangle, TrendingUp, Clock, Users } from 'lucide-react';

interface ExecutiveSummaryProps {
  data?: {
    totalModels: number;
    totalConfigs: number;
    keyFinding: string;
    energySavingsRange: string;
    accuracyImpact: string;
    bestUseCase: string;
  };
}

export default function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const defaultData = {
    totalModels: 3,
    totalConfigs: 5,
    keyFinding: "INT8 quantization increases energy by 80-162% vs FP16 due to mixed-precision overhead",
    energySavingsRange: "NF4 saves 5.3% energy for ≥6B models, but costs 25-34% for smaller models",
    accuracyImpact: "INT8 pure mode saves energy but degrades accuracy by 2.5-22.7%",
    bestUseCase: "FP16 remains most efficient when GPU memory allows"
  };

  const summaryData = data || defaultData;

  return (
    <div className="bg-gradient-to-r from-eco-500/10 to-blue-500/10 border border-eco-500/30 rounded-xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-eco-500/20 p-2 rounded-lg">
            <Lightbulb className="w-5 h-5 text-eco-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Executive Summary</h2>
            <p className="text-xs text-gray-600">Key findings from GPU power measurements</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* TL;DR Section */}
      <div className="bg-white/50 rounded-lg p-4 mb-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-bold text-yellow-600">TL;DR</span>
        </div>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <span><strong>INT8 Surprise:</strong> Default INT8 increases energy by 80-162% vs FP16 due to mixed-precision overhead</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-eco-600 mt-0.5 shrink-0" />
            <span><strong>NF4 Crossover:</strong> Only saves energy (5.3%) for models ≥6B parameters; costs 25-34% for smaller models</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <span><strong>FP16 Winner:</strong> Remains most energy-efficient when GPU memory allows</span>
          </li>
        </ul>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white/70 rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-eco-600">{summaryData.totalModels}</div>
          <div className="text-xs text-gray-600">Models Tested</div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{summaryData.totalConfigs}</div>
          <div className="text-xs text-gray-600">Quantization Configs</div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">3</div>
          <div className="text-xs text-gray-600">GPU Architectures</div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">45+</div>
          <div className="text-xs text-gray-600">Data Points</div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-bold text-red-500">Critical Finding</span>
            </div>
            <p className="text-sm text-gray-700">{summaryData.keyFinding}</p>
          </div>

          <div className="bg-eco-500/10 border border-eco-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-eco-600" />
              <span className="font-bold text-eco-600">Energy Savings</span>
            </div>
            <p className="text-sm text-gray-700">{summaryData.energySavingsRange}</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-blue-600">Best Practice</span>
            </div>
            <p className="text-sm text-gray-700">{summaryData.bestUseCase}</p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="font-bold text-yellow-600">Accuracy Trade-off</span>
            </div>
            <p className="text-sm text-gray-700">{summaryData.accuracyImpact}</p>
          </div>
        </div>
      )}
    </div>
  );
}
