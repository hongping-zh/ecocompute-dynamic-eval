import React, { useState, useEffect } from 'react';
import { CalculatorState } from '../types';
import { HARDWARE_OPTIONS } from '../constants';
import { Leaf, Zap, Cloud } from 'lucide-react';

export const Calculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    hardware: 'a100',
    count: 1,
    hours: 24,
    pue: 1.2,
    region: 'global',
  });

  const [result, setResult] = useState(0);

  useEffect(() => {
    const hw = HARDWARE_OPTIONS.find(h => h.value === state.hardware);
    const power = hw ? hw.power : 200;
    // Formula: (Power * Count * Hours * PUE) / 1000 = kWh
    // Carbon Intensity (Global Avg) approx 475g CO2/kWh
    const kwh = (power * state.count * state.hours * state.pue) / 1000;
    const co2 = kwh * 0.475; // kg CO2
    setResult(co2);
  }, [state]);

  const handleChange = (field: keyof CalculatorState, value: string | number) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Leaf className="w-8 h-8 text-eco-500" />
          Carbon Footprint Calculator
        </h2>
        <p className="text-slate-500">Estimate the environmental impact of your AI training or inference workloads.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Hardware Type</label>
            <select 
              value={state.hardware}
              onChange={(e) => handleChange('hardware', e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-eco-500 outline-none"
            >
              {HARDWARE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">GPU Count</label>
              <input 
                type="number" 
                min="1"
                value={state.count}
                onChange={(e) => handleChange('count', parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-eco-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Duration (Hours)</label>
              <input 
                type="number" 
                min="1"
                value={state.hours}
                onChange={(e) => handleChange('hours', parseFloat(e.target.value) || 0)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-eco-500 outline-none"
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
              <span className="text-sm font-mono text-slate-600 w-12">{state.pue.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-400">1.0 is ideal efficiency. 1.2 is Google-average. 1.5 is standard.</p>
          </div>
        </div>

        <div className="bg-eco-50 p-6 rounded-2xl border border-eco-100 flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Cloud className={`w-12 h-12 text-eco-500 transition-all duration-500 ${result > 10 ? 'opacity-100' : 'opacity-80'}`} />
          </div>
          <div>
            <div className="text-5xl font-bold text-slate-800 tracking-tight">
              {result.toFixed(2)}
              <span className="text-2xl text-slate-500 ml-2 font-normal">kg CO₂e</span>
            </div>
            <p className="text-eco-700 mt-2 font-medium">Estimated Emissions</p>
          </div>
          
          <div className="w-full bg-white/50 p-4 rounded-xl text-sm text-slate-600">
            Equivalent to driving a car for <span className="font-bold text-slate-800">{Math.ceil(result * 4)} km</span>
          </div>
        </div>
      </div>
    </div>
  );
};