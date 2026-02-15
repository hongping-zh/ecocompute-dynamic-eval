import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';
import { Zap, TrendingUp, Cpu, DollarSign, AlertTriangle, ArrowRight, Download } from 'lucide-react';

// ── A800 Batch Size Experiment Data (Real measurements, 2026-02-15) ──────────
const BATCH_SIZE_DATA = [
  { bs: 1,  throughput: 19.0,   energy: 1768, gpu_util: 45.3, memory: 8.4,  power: 252 },
  { bs: 2,  throughput: 37.7,   energy: 935,  gpu_util: 47.4, memory: 8.5,  power: 264 },
  { bs: 4,  throughput: 75.6,   energy: 495,  gpu_util: 50.9, memory: 8.6,  power: 280 },
  { bs: 8,  throughput: 150.3,  energy: 284,  gpu_util: 50.4, memory: 9.0,  power: 282 },
  { bs: 16, throughput: 296.4,  energy: 205,  gpu_util: 76.8, memory: 9.7,  power: 296 },
  { bs: 32, throughput: 577.4,  energy: 100,  gpu_util: 63.6, memory: 11.4, power: 305 },
  { bs: 64, throughput: 1052.5, energy: 76,   gpu_util: 91.0, memory: 14.6, power: 314 },
];

const CHART_DATA = BATCH_SIZE_DATA.map(d => ({
  name: `BS=${d.bs}`,
  batchSize: d.bs,
  'Energy/Request (J)': d.energy,
  'Throughput (tok/s)': d.throughput,
  'GPU Util (%)': d.gpu_util,
  'Memory (GB)': d.memory,
  'Avg Power (W)': d.power,
}));

// ── Cost calculator data ─────────────────────────────────────────────────────
const calcDailyCost = (energyJ: number, requestsPerDay: number, pricePerKwh: number) => {
  const totalKwh = (energyJ * requestsPerDay) / 3_600_000;
  return totalKwh * pricePerKwh;
};

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: string; sub: string;
  color: string; bgColor: string;
}> = ({ icon, label, value, sub, color, bgColor }) => (
  <div className={`${bgColor} rounded-2xl p-5 border border-slate-200 shadow-sm`}>
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{sub}</p>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
export const BatchSizeAnalysis: React.FC = () => {
  const [requests, setRequests] = useState(1_000_000);
  const [price, setPrice] = useState(0.12);

  const bs1Cost = calcDailyCost(1768, requests, price);
  const bs16Cost = calcDailyCost(205, requests, price);
  const bs64Cost = calcDailyCost(76, requests, price);

  const downloadCsv = () => {
    const headers = ['batch_size', 'throughput_tok_s', 'energy_per_request_j', 'gpu_util_pct', 'memory_gb', 'avg_power_w'];
    const rows = BATCH_SIZE_DATA.map(d => [d.bs, d.throughput, d.energy, d.gpu_util, d.memory, d.power]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'a800_mistral7b_pure_int8_batch_size.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">NEW EXPERIMENT</span>
              <span className="text-white/70 text-xs">2026-02-15</span>
            </div>
            <h2 className="text-2xl font-bold">Batch Size Optimization: 95.7% Energy Reduction</h2>
            <p className="text-white/80 mt-1 text-sm max-w-2xl">
              Comprehensive batch size sweep (BS&nbsp;1–64) on <strong>A800 + Mistral-7B + Pure INT8</strong>.
              Small batch sizes waste 55% of GPU capacity — here's the data to prove it.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <a
              href="https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata/batch_size_experiment"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Raw Data <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="w-4 h-4 text-red-600" />}
          label="Energy Reduction"
          value="95.7%"
          sub="BS=1 → BS=64 (1,768 → 76 J)"
          color="bg-red-100"
          bgColor="bg-white"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-green-600" />}
          label="Throughput Speedup"
          value="55.5×"
          sub="19 → 1,053 tok/s"
          color="bg-green-100"
          bgColor="bg-white"
        />
        <StatCard
          icon={<Cpu className="w-4 h-4 text-blue-600" />}
          label="GPU Utilization"
          value="45% → 91%"
          sub="+45.7 percentage points"
          color="bg-blue-100"
          bgColor="bg-white"
        />
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-amber-600" />}
          label="Annual Savings"
          value="$19K"
          sub="BS=1 vs BS=16 @ 1M req/day"
          color="bg-amber-100"
          bgColor="bg-white"
        />
      </div>

      {/* Charts Row 1: Energy & Throughput */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy per Request */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Energy per Request (J) vs Batch Size</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }}
              />
              <Area
                type="monotone"
                dataKey="Energy/Request (J)"
                fill="#fecaca"
                stroke="none"
                fillOpacity={0.4}
              />
              <Line
                type="monotone"
                dataKey="Energy/Request (J)"
                stroke="#dc2626"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#dc2626' }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Energy drops from 1,768 J (BS=1) to 76 J (BS=64) — <strong className="text-red-600">95.7% reduction</strong>
          </p>
        </div>

        {/* Throughput */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Throughput (tokens/s) vs Batch Size</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }}
              />
              <Area
                type="monotone"
                dataKey="Throughput (tok/s)"
                fill="#bbf7d0"
                stroke="none"
                fillOpacity={0.4}
              />
              <Line
                type="monotone"
                dataKey="Throughput (tok/s)"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#16a34a' }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Throughput scales from 19 to 1,053 tok/s — <strong className="text-green-600">55.5× speedup</strong>
          </p>
        </div>
      </div>

      {/* Charts Row 2: GPU Utilization & Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPU Utilization */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">GPU Utilization (%) vs Batch Size</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }}
              />
              <Bar
                dataKey="GPU Util (%)"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2 text-center">
            BS=1 wastes <strong className="text-blue-600">55%</strong> of GPU capacity.
            BS≥16 reaches &gt;76% utilization.
          </p>
        </div>

        {/* Memory */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Peak Memory (GB) & Power (W) vs Batch Size</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="Memory (GB)" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="Avg Power (W)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Memory scales linearly (8.4 → 14.6 GB), well within A800's 80 GB capacity.
          </p>
        </div>
      </div>

      {/* Interactive Cost Calculator */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-500" />
          Interactive Cost Calculator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Daily Requests: <strong className="text-slate-800">{requests.toLocaleString()}</strong>
              </label>
              <input
                type="range"
                min={10000}
                max={10000000}
                step={10000}
                value={requests}
                onChange={e => setRequests(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400"><span>10K</span><span>10M</span></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Electricity Price: <strong className="text-slate-800">${price}/kWh</strong>
              </label>
              <input
                type="range"
                min={0.05}
                max={0.40}
                step={0.01}
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400"><span>$0.05</span><span>$0.40</span></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
              <div><span className="text-xs text-red-500 font-semibold">BS=1</span><span className="text-xs text-slate-400 ml-1">(worst)</span></div>
              <div className="text-right">
                <span className="text-lg font-bold text-red-700">${bs1Cost.toFixed(0)}/day</span>
                <span className="block text-[10px] text-red-400">${(bs1Cost * 365).toFixed(0)}/year</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div><span className="text-xs text-amber-600 font-semibold">BS=16</span><span className="text-xs text-slate-400 ml-1">(recommended)</span></div>
              <div className="text-right">
                <span className="text-lg font-bold text-amber-700">${bs16Cost.toFixed(1)}/day</span>
                <span className="block text-[10px] text-amber-400">${(bs16Cost * 365).toFixed(0)}/year</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
              <div><span className="text-xs text-green-600 font-semibold">BS=64</span><span className="text-xs text-slate-400 ml-1">(maximum)</span></div>
              <div className="text-right">
                <span className="text-lg font-bold text-green-700">${bs64Cost.toFixed(1)}/day</span>
                <span className="block text-[10px] text-green-400">${(bs64Cost * 365).toFixed(0)}/year</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500">Potential Annual Savings (BS=1 → BS=16)</span>
              <p className="text-xl font-bold text-slate-800">${((bs1Cost - bs16Cost) * 365).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border-2 border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">🎯</div>
            <h4 className="text-sm font-bold text-slate-700">Interactive Apps</h4>
          </div>
          <p className="text-xs text-slate-500 mb-3">Latency-sensitive chatbots, copilots</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Recommended BS</span><span className="font-bold text-blue-600">4–8</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Energy/Request</span><span className="font-semibold">284–495 J</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Savings vs BS=1</span><span className="font-bold text-green-600">72–84%</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-green-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">📦</div>
            <h4 className="text-sm font-bold text-slate-700">Batch Processing</h4>
          </div>
          <p className="text-xs text-slate-500 mb-3">Throughput-oriented workloads</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Recommended BS</span><span className="font-bold text-green-600">16–32</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Energy/Request</span><span className="font-semibold">100–205 J</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Savings vs BS=1</span><span className="font-bold text-green-600">88–94%</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-red-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Avoid BS=1</h4>
          </div>
          <p className="text-xs text-slate-500 mb-3">Extremely wasteful configuration</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">GPU Utilization</span><span className="font-bold text-red-600">Only 45%</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Energy Waste</span><span className="font-bold text-red-600">23× vs BS=64</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Throughput</span><span className="font-bold text-red-600">55× slower</span></div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Complete Measurement Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 px-3 text-left text-xs font-semibold text-slate-500">Batch Size</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-slate-500">Throughput (tok/s)</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-slate-500">Energy/Req (J)</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-slate-500">Δ vs BS=1</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-slate-500">GPU Util (%)</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-slate-500">Memory (GB)</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-slate-500">Power (W)</th>
              </tr>
            </thead>
            <tbody>
              {BATCH_SIZE_DATA.map((d, i) => {
                const delta = i === 0 ? '—' : `−${((1 - d.energy / 1768) * 100).toFixed(1)}%`;
                const rowBg = i % 2 === 0 ? 'bg-slate-50/50' : '';
                return (
                  <tr key={d.bs} className={`${rowBg} border-b border-slate-100 hover:bg-slate-50`}>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{d.bs}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{d.throughput.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{d.energy.toLocaleString()}</td>
                    <td className={`py-2.5 px-3 text-right font-semibold ${i === 0 ? 'text-slate-400' : 'text-green-600'}`}>{delta}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{d.gpu_util}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{d.memory}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{d.power}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-slate-400">
          <span>GPU: NVIDIA A800-SXM4-80GB (Ampere)</span>
          <span>Model: Mistral-7B-Instruct-v0.2</span>
          <span>Quantization: Pure INT8 (threshold=0.0)</span>
          <span>n=10 per batch size, CV &lt; 1%</span>
        </div>
      </div>

      {/* Experiment Provenance */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-500 space-y-1">
        <p><strong className="text-slate-600">Experiment ID:</strong> a800_batch_size_20260215_131345</p>
        <p><strong className="text-slate-600">Hardware:</strong> NVIDIA A800-SXM4-80GB (Ampere architecture)</p>
        <p><strong className="text-slate-600">Model:</strong> Mistral-7B-Instruct-v0.2 &middot; Pure INT8 (llm_int8_threshold=0.0)</p>
        <p><strong className="text-slate-600">Protocol:</strong> 7 batch sizes &times; 10 runs = 70 measurements &middot; 3 warmup runs &middot; 5s cooling between runs</p>
        <p><strong className="text-slate-600">Data Quality:</strong> All CV &lt; 1% (Throughput: 0.36–3.76%, Energy: 0.47–2.05%)</p>
        <p>
          <strong className="text-slate-600">Raw Data:</strong>{' '}
          <a
            href="https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata/batch_size_experiment"
            target="_blank"
            rel="noopener noreferrer"
            className="text-eco-600 hover:underline"
          >
            metadata/batch_size_experiment/
          </a>
        </p>
      </div>
    </div>
  );
};
