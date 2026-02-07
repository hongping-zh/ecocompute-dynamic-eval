import React from 'react';
import { INITIAL_MODELS } from '../constants';

export const Methodology: React.FC = () => {
  const rtx5090Verified = INITIAL_MODELS.filter(m => m.tags.includes('rtx5090-verified'));

  const downloadRtx5090Json = () => {
    const data = JSON.stringify(rtx5090Verified, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecocompute_rtx5090_benchmarks.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadRtx5090Csv = () => {
    const headers = [
      'id',
      'name',
      'provider',
      'accuracy',
      'executionTime',
      'cost',
      'carbonImpact',
      'energyEfficiency',
      'tags'
    ];

    const escapeCsv = (value: unknown) => {
      const s = String(value ?? '');
      return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
    };

    const rows = rtx5090Verified.map(m => [
      m.id,
      m.name,
      m.provider,
      m.accuracy,
      m.executionTime,
      m.cost,
      m.carbonImpact,
      m.energyEfficiency,
      m.tags.join('|')
    ]);

    const csv = [headers, ...rows].map(r => r.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecocompute_rtx5090_benchmarks.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Methodology & Data Sources</h2>
        <p className="text-sm text-slate-500 mt-1">
          EcoCompute combines benchmark measurements and estimates to help you compare cost, latency, and environmental impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Benchmark data (local GPU)</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>
              Some rows in the leaderboard come from real measurements on NVIDIA RTX 5090.
            </p>
            <p>
              Metrics include throughput-derived execution time, energy-efficiency (Tok/W), and per-1k-token carbon impact derived from
              measured energy.
            </p>
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400">RTX 5090 verified rows</div>
              <div className="mt-1 text-2xl font-bold text-slate-800">{rtx5090Verified.length}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={downloadRtx5090Json}
                  className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Download JSON
                </button>
                <button
                  onClick={downloadRtx5090Csv}
                  className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Download CSV
                </button>
                <a
                  href="https://github.com/hongping-zh/ecocompute-dynamic-eval/blob/main/constants.ts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  View constants.ts
                </a>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {rtx5090Verified.slice(0, 6).map(m => (
                  <div key={m.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-700 font-medium truncate">{m.name}</span>
                    <span className="text-xs px-2 py-1 rounded bg-eco-50 text-eco-700 border border-eco-100 flex-shrink-0">
                      {m.provider}
                    </span>
                  </div>
                ))}
                {rtx5090Verified.length > 6 && (
                  <div className="text-xs text-slate-400">+ {rtx5090Verified.length - 6} more</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Commercial API models</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>
              API model values are best-effort estimates and may drift as providers update pricing and infrastructure.
            </p>
            <p>
              For cost-sensitive decisions, verify pricing directly from each provider.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Carbon impact</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>
              Carbon impact is proportional to energy usage and your electricity carbon intensity.
            </p>
            <p>
              Calculator results depend on assumptions like PUE and region. Treat outputs as estimates, not audited accounting.
            </p>
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400">Implementation notes</div>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-700">carbonImpact</span>
                  <span> is stored as grams CO2 per 1k tokens for benchmarked rows.</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">energyEfficiency</span>
                  <span> is stored as Tok/W (tokens per watt).</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Formula disclosure</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>
              For benchmarked rows, metrics are derived from measured throughput and energy.
            </p>
            <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 space-y-2">
              <div>
                executionTime (s / 1k tok) = 1000 / tokens_per_second
              </div>
              <div>
                energyEfficiency (Tok/W) = tokens_per_second / watts
              </div>
              <div>
                watt_hours_per_1k (Wh) = joules_per_1k (J) / 3600
              </div>
              <div>
                grid_gCO2_per_Wh = grid_gCO2_per_kWh / 1000
              </div>
              <div>
                carbonImpact (gCO2 / 1k tok) = watt_hours_per_1k * grid_gCO2_per_Wh
              </div>
            </div>
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400">Defaults and editable fields</div>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-700">Default grid carbon intensity</span>
                  <span> in the Calculator is currently hardcoded to 0.475 kgCO2/kWh (i.e., 475 gCO2/kWh).</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Editable in Calculator</span>
                  <span>: hardware power, GPU count, runtime hours, and PUE directly affect kWh and CO2 estimates.</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Region</span>
                  <span> is captured in the UI but does not yet change the carbon intensity factor.</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Benchmarked rows</span>
                  <span> have carbonImpact precomputed in constants.ts using the inline assumptions documented there.</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              The exact constants and intermediate values are documented in the benchmark report.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">More details</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>
              Full benchmark report and datasets are linked in the project README.
            </p>
            <div className="pt-2">
              <a
                href="https://github.com/hongping-zh/ecocompute-ai/blob/main/RTX5090_Energy_Benchmark_Report_EN.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-sm text-sm font-medium"
              >
                Open RTX 5090 Benchmark Report
              </a>
            </div>
            <p>
              If you spot an inconsistency, open an issue with the model name, hardware, and reproduction steps.
            </p>
          </div>
        </div>
      </div>

      {/* Competitive Differentiation */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-1">How EcoCompute Compares</h2>
        <p className="text-sm text-slate-500 mb-4">
          Several tools address AI carbon tracking. Here is how EcoCompute fits into the landscape.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="p-3">Capability</th>
                <th className="p-3 text-indigo-700 bg-indigo-50">EcoCompute</th>
                <th className="p-3">CodeCarbon</th>
                <th className="p-3">ML CO2 Impact</th>
                <th className="p-3">W&B Carbon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="p-3 font-medium">Cost + Carbon unified</td>
                <td className="p-3 text-indigo-700 bg-indigo-50/50 font-semibold">✓ Full TCO</td>
                <td className="p-3">✗ Carbon only</td>
                <td className="p-3">✗ Carbon only</td>
                <td className="p-3">~ Partial</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">API model comparison</td>
                <td className="p-3 text-indigo-700 bg-indigo-50/50 font-semibold">✓ 8+ models</td>
                <td className="p-3">✗ Local only</td>
                <td className="p-3">✗ Training only</td>
                <td className="p-3">✗ Local only</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Interactive calculator</td>
                <td className="p-3 text-indigo-700 bg-indigo-50/50 font-semibold">✓ With templates</td>
                <td className="p-3">✗</td>
                <td className="p-3">✓ Basic</td>
                <td className="p-3">✗</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Sensitivity analysis</td>
                <td className="p-3 text-indigo-700 bg-indigo-50/50 font-semibold">✓ Breakeven</td>
                <td className="p-3">✗</td>
                <td className="p-3">✗</td>
                <td className="p-3">✗</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Data provenance</td>
                <td className="p-3 text-indigo-700 bg-indigo-50/50 font-semibold">✓ Per-row badges</td>
                <td className="p-3">✓ Measured</td>
                <td className="p-3">~ Estimated</td>
                <td className="p-3">✓ Measured</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Configurable scoring</td>
                <td className="p-3 text-indigo-700 bg-indigo-50/50 font-semibold">✓ Weighted</td>
                <td className="p-3">✗</td>
                <td className="p-3">✗</td>
                <td className="p-3">✗</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Decision export (JSON)</td>
                <td className="p-3 text-indigo-700 bg-indigo-50/50 font-semibold">✓ Trace format</td>
                <td className="p-3">✓ CSV</td>
                <td className="p-3">✗</td>
                <td className="p-3">✓ W&B format</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          EcoCompute's differentiator is the unified cost-carbon-performance decision framework. 
          Our moat will grow through continuously updated benchmark datasets and user behavior data as we scale to the backend-powered Pro and Enterprise tiers.
        </p>
      </div>
    </div>
  );
};
