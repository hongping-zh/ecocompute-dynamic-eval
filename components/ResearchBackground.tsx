import React from 'react';
import { BookOpen, Cpu, Zap, TrendingDown, Target, Users, ExternalLink, FlaskConical, GitBranch } from 'lucide-react';

export const ResearchBackground: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Research Background</h2>
            <p className="text-slate-300 leading-relaxed max-w-3xl">
              Energy Efficiency of Quantized Large Language Model Inference: Evidence for Quantization Efficiency Paradoxes on NVIDIA Blackwell, Ada Lovelace, and Ampere Architectures.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">93+ Measurements</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">3 GPU Architectures</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">CV &lt; 2%</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">Causal Ablation</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">Open Data</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Motivation */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Motivation</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              Quantization (reducing model precision from FP16 to INT8 or NF4) is widely assumed to save energy by reducing memory footprint and compute requirements. However, <strong>no systematic study</strong> has measured whether this assumption holds across modern GPU architectures.
            </p>
            <p>
              We discovered that the reality is more nuanced — and in some cases, <strong>the opposite of what practitioners expect</strong>.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
              <p className="text-amber-800 font-semibold text-xs uppercase tracking-wide mb-1">The Problem</p>
              <p className="text-amber-900 text-sm">
                Default bitsandbytes INT8 can increase energy consumption by <strong>17–147%</strong> compared to FP16 — the exact opposite of what users expect when choosing "INT8 for efficiency."
              </p>
            </div>
          </div>
        </div>

        {/* Significance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Significance</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              bitsandbytes is used by <strong>millions of developers</strong> via Hugging Face Transformers. The INT8 quantization option (<code>load_in_8bit=True</code>) is one of the most common ways to reduce memory usage for LLM inference.
            </p>
            <p>
              Without this research, the industry would conclude <em>"INT8 is bad for energy"</em> — missing that the problem lies in the <strong>mixed-precision decomposition implementation</strong>, not INT8 itself.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-3">
              <p className="text-green-800 font-semibold text-xs uppercase tracking-wide mb-1">The Fix</p>
              <p className="text-green-900 text-sm">
                Setting <code className="bg-green-100 px-1 rounded">llm_int8_threshold=0.0</code> eliminates the overhead, recovering +79–98% throughput and −35–41% energy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Contributions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Core Contributions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <TrendingDown className="w-5 h-5 text-rose-500" />,
              title: 'NF4 Crossover Discovery',
              desc: 'NF4 saves energy for models ≥6B but wastes 11–29% for <5B models. Crossover at ~5B parameters.',
              color: 'bg-rose-50 border-rose-200',
            },
            {
              icon: <Zap className="w-5 h-5 text-amber-500" />,
              title: 'INT8 Paradox Identified',
              desc: 'Default bitsandbytes INT8 increases energy by 17–147% due to mixed-precision decomposition overhead.',
              color: 'bg-amber-50 border-amber-200',
            },
            {
              icon: <Cpu className="w-5 h-5 text-blue-500" />,
              title: 'Causal Diagnosis',
              desc: 'Ablation experiment (threshold=0.0) proves the energy penalty comes from type conversion, not INT8 arithmetic.',
              color: 'bg-blue-50 border-blue-200',
            },
            {
              icon: <Target className="w-5 h-5 text-green-500" />,
              title: 'Batch Size Scaling',
              desc: 'A800 sweep shows 95.7% energy reduction (BS=1→64). Batching is the single largest optimization lever.',
              color: 'bg-green-50 border-green-200',
            },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-xl border ${item.color}`}>
              <div className="mb-2">{item.icon}</div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Experimental Setup */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Cpu className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Experimental Setup</h3>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-700">Hardware Platforms</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-600">GPU</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Architecture</th>
                  <th className="text-left p-3 font-semibold text-slate-600">VRAM</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Tensor Cores</th>
                  <th className="text-left p-3 font-semibold text-slate-600">TDP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="p-3 font-medium">RTX 5090</td><td className="p-3">Blackwell (SM 120)</td><td className="p-3">32 GB GDDR7</td><td className="p-3">5th Gen</td><td className="p-3">575W</td></tr>
                <tr><td className="p-3 font-medium">RTX 4090D</td><td className="p-3">Ada Lovelace (SM 89)</td><td className="p-3">24 GB GDDR6X</td><td className="p-3">4th Gen</td><td className="p-3">425W</td></tr>
                <tr><td className="p-3 font-medium">A800</td><td className="p-3">Ampere (SM 80)</td><td className="p-3">80 GB HBM2e</td><td className="p-3">3rd Gen</td><td className="p-3">400W</td></tr>
              </tbody>
            </table>
          </div>

          <h4 className="text-sm font-semibold text-slate-700 mt-4">Software Environment</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-600">Component</th>
                  <th className="text-left p-3 font-semibold text-slate-600">RTX 5090</th>
                  <th className="text-left p-3 font-semibold text-slate-600">RTX 4090D</th>
                  <th className="text-left p-3 font-semibold text-slate-600">A800</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="p-3 font-medium">PyTorch</td><td className="p-3">2.6.0</td><td className="p-3">2.4.1</td><td className="p-3">2.4.1</td></tr>
                <tr><td className="p-3 font-medium">CUDA</td><td className="p-3">12.6</td><td className="p-3">12.1</td><td className="p-3">12.1</td></tr>
                <tr><td className="p-3 font-medium">transformers</td><td className="p-3">4.48.0</td><td className="p-3">4.47.0</td><td className="p-3">4.47.0</td></tr>
                <tr><td className="p-3 font-medium">bitsandbytes</td><td className="p-3">0.45.3</td><td className="p-3">0.45.0</td><td className="p-3">0.45.0</td></tr>
              </tbody>
            </table>
          </div>

          <h4 className="text-sm font-semibold text-slate-700 mt-4">Measurement Protocol</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Power Monitoring', value: 'NVML via pynvml at 10 Hz' },
              { label: 'Runs per Config', value: 'n=10 (3 warmup discarded)' },
              { label: 'Thermal Stabilization', value: '30s between model loads' },
              { label: 'Generation', value: 'Greedy, 256 tokens, fixed prompt' },
              { label: 'Quality Gate', value: 'CV < 2% throughput, < 5% power' },
              { label: 'Idle Power', value: 'Subtracted per-GPU baseline' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                <p className="text-sm text-slate-800 font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Work */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-50 rounded-lg">
            <GitBranch className="w-5 h-5 text-cyan-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Related Work</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-1">LLM.int8() — Dettmers et al., 2022</h4>
              <p className="text-xs">Introduced 8-bit matrix multiplication with outlier-aware mixed-precision decomposition. Our work quantifies the energy cost of this approach.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-1">QLoRA — Dettmers et al., 2023</h4>
              <p className="text-xs">Introduced NF4 (4-bit NormalFloat) quantization for fine-tuning. We measure its inference energy efficiency across model sizes.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-1">Green AI — Schwartz et al., 2020</h4>
              <p className="text-xs">Advocated for reporting energy and carbon costs of AI. Our work provides the missing empirical data for quantized inference.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-1">Power Hungry Processing — Luccioni et al., 2023</h4>
              <p className="text-xs">Measured energy for 88 models across tasks. We extend this methodology to quantization-specific energy analysis.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-1">MLPerf Inference — Reddi et al., 2020</h4>
              <p className="text-xs">Industry-standard inference benchmarking. We apply similar rigor but focus on energy per token across quantization methods.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-1">SqueezeLLM — Kim et al., 2024</h4>
              <p className="text-xs">Dense-and-sparse quantization for LLMs. Provides context for understanding outlier-aware approaches like LLM.int8().</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links & Resources */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Links & Resources</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'GitHub Repository', url: 'https://github.com/hongping-zh/ecocompute-dynamic-eval', desc: 'Source code, data, metadata' },
            { label: 'bitsandbytes Issue #1867', url: 'https://github.com/bitsandbytes-foundation/bitsandbytes/issues/1867', desc: 'INT8 energy overhead report' },
            { label: 'bitsandbytes Issue #1851', url: 'https://github.com/bitsandbytes-foundation/bitsandbytes/issues/1851', desc: 'NF4 energy penalty on Blackwell' },
            { label: 'Raw Metadata', url: 'https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata', desc: 'Complete reproducibility artifacts' },
            { label: 'Batch Size Data', url: 'https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata/batch_size_experiment', desc: 'A800 sweep raw data (70 runs)' },
            { label: 'Contact', url: 'mailto:zhanghongping1982@gmail.com', desc: 'Hongping Zhang (Independent Researcher)' },
          ].map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Author */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          Research by <strong className="text-slate-800">Hongping Zhang</strong> · Independent Researcher · 
          <a href="mailto:zhanghongping1982@gmail.com" className="text-indigo-600 hover:underline ml-1">zhanghongping1982@gmail.com</a>
        </p>
        <p className="text-xs text-slate-400 mt-2 italic">
          "Measure, don't assume. Reproduce, don't trust. Share, don't hoard."
        </p>
      </div>
    </div>
  );
};
