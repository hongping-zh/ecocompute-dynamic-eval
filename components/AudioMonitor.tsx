import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Mic, Zap, Cpu } from 'lucide-react';

// Simulate real-time data
const generateData = (prevData: any[]) => {
  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  const newPoint = {
    time,
    power: 250 + Math.random() * 50, // fluctuating between 250-300W
    audioLevel: Math.random() * 100,
    efficiency: 80 + Math.random() * 10
  };
  
  const newData = [...prevData, newPoint];
  if (newData.length > 20) newData.shift();
  return newData;
};

interface DataPoint {
  time: string;
  power: number;
  audioLevel: number;
  efficiency: number;
}

export const AudioMonitor: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => generateData(prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 动态计算统计值
  const stats = React.useMemo(() => {
    if (data.length === 0) {
      return { peak: 0, avg: 0, cost: 0 };
    }
    const powers = data.map(d => d.power);
    const peak = Math.max(...powers);
    const avg = powers.reduce((sum, p) => sum + p, 0) / powers.length;
    // 估算成本: 假设电价 $0.12/kWh
    const cost = (avg / 1000) * 0.12;
    return { peak, avg, cost };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Audio Processing Load */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="mb-6 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-indigo-500" />
                    Audio Input Stream
                </h3>
                <p className="text-xs text-slate-400">Real-time signal processing load</p>
            </div>
            <div className="flex gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-red-500 uppercase">Live</span>
            </div>
        </div>
        
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAudio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="audioLevel" stroke="#6366f1" fillOpacity={1} fill="url(#colorAudio)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Power Consumption Monitor */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Dynamic Power Usage
            </h3>
            <p className="text-xs text-slate-400">GPU wattage consumption during inference</p>
        </div>
        
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{fontSize: 10}} stroke="#cbd5e1" />
              <YAxis domain={[200, 350]} tick={{fontSize: 10}} stroke="#cbd5e1" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="stepAfter" dataKey="power" stroke="#eab308" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-2 rounded text-center">
                <div className="text-xs text-slate-400">Peak</div>
                <div className="font-mono font-bold text-slate-700">{stats.peak.toFixed(0)}W</div>
            </div>
             <div className="bg-slate-50 p-2 rounded text-center">
                <div className="text-xs text-slate-400">Avg</div>
                <div className="font-mono font-bold text-slate-700">{stats.avg.toFixed(0)}W</div>
            </div>
             <div className="bg-slate-50 p-2 rounded text-center">
                <div className="text-xs text-slate-400">Est. Cost</div>
                <div className="font-mono font-bold text-slate-700">${stats.cost.toFixed(2)}/h</div>
            </div>
        </div>
      </div>
    </div>
  );
};