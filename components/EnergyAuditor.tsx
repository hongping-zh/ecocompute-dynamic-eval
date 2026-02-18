import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend
} from 'recharts';
import { Zap, Shield, AlertTriangle, CheckCircle, Github, ArrowRight, ExternalLink, Copy, Check } from 'lucide-react';

// ── Real measurement data ────────────────────────────────────────────────────

const INT8_COMPARISON = [
  { name: 'FP16\n(baseline)', gpu: 'RTX 5090', energy: 100, color: '#3b82f6' },
  { name: 'INT8\ndefault', gpu: 'RTX 5090', energy: 247, color: '#ef4444' },
  { name: 'INT8\npure', gpu: 'RTX 5090', energy: 89, color: '#22c55e' },
  { name: 'FP16\n(baseline)', gpu: 'RTX 4090D', energy: 100, color: '#3b82f6' },
  { name: 'INT8\ndefault', gpu: 'RTX 4090D', energy: 217, color: '#ef4444' },
  { name: 'INT8\npure', gpu: 'RTX 4090D', energy: 91, color: '#22c55e' },
];

const BATCH_ENERGY = [
  { bs: 1, energy: 1768 },
  { bs: 2, energy: 935 },
  { bs: 4, energy: 495 },
  { bs: 8, energy: 284 },
  { bs: 16, energy: 205 },
  { bs: 32, energy: 100 },
  { bs: 64, energy: 76 },
];

const DETECTION_RULES = [
  {
    id: 1,
    pattern: 'INT8 默认配置',
    desc: 'load_in_8bit=True without llm_int8_threshold',
    severity: 'critical' as const,
    waste: '17-147%',
    fix: 'Add llm_int8_threshold=0.0',
    code: 'load_in_8bit=True',
  },
  {
    id: 2,
    pattern: 'NF4 小模型惩罚',
    desc: 'NF4 quantization on models <3B parameters',
    severity: 'warning' as const,
    waste: 'Varies',
    fix: 'Use FP16 for small models',
    code: 'load_in_4bit=True + <3B model',
  },
  {
    id: 3,
    pattern: 'BS=1 顺序处理',
    desc: 'Sequential single-request processing loop',
    severity: 'warning' as const,
    waste: '≤95.7%',
    fix: 'Batch requests with batch_size≥8',
    code: 'for prompt in prompts: generate()',
  },
  {
    id: 4,
    pattern: '混合精度冲突',
    desc: 'INT8 and NF4 configured simultaneously',
    severity: 'critical' as const,
    waste: 'Undefined',
    fix: 'Use only one quantization method',
    code: 'load_in_8bit + load_in_4bit',
  },
  {
    id: 5,
    pattern: '未指定 device_map',
    desc: 'Missing automatic device allocation',
    severity: 'info' as const,
    waste: 'Potential',
    fix: 'Add device_map="auto"',
    code: 'No device_map parameter',
  },
  {
    id: 6,
    pattern: '冗余量化参数',
    desc: 'Redundant or conflicting quantization config',
    severity: 'info' as const,
    waste: 'Code quality',
    fix: 'Clean up redundant config',
    code: 'Invalid parameter combinations',
  },
];

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

const SeverityBadge: React.FC<{ severity: 'critical' | 'warning' | 'info' }> = ({ severity }) => {
  const styles = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  const labels = { critical: '🔴 Critical', warning: '🟡 Warning', info: '🟠 Info' };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
};

// ── Simulated review ─────────────────────────────────────────────────────────
const MOCK_REVIEW = `## ⚡ EcoCompute Energy Audit

Scanned **1** Python file(s) in this PR. 1 critical issue(s) found — estimated 30%+ energy waste.

### 🔴 Critical Issues

**Default INT8 (bitsandbytes mixed-precision decomposition)**

> load_in_8bit=True without llm_int8_threshold=0.0 causes 17–147% energy waste due to continuous INT8↔FP16 type conversion at every linear layer.
> Estimated energy waste: **30%+**

**Fix:** Add llm_int8_threshold=0.0 to BitsAndBytesConfig, or switch to FP16/NF4.

\`\`\`python
quantization_config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=0.0,  # ← Add this line
)
\`\`\`

### 🟡 Warnings

**Sequential single-request processing (BS=1)**

> Processing prompts in a loop wastes up to 95.7% energy. Use batch processing.`;

// ── Main component ───────────────────────────────────────────────────────────
export const EnergyAuditor: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleCode = `from transformers import AutoModelForCausalLM, BitsAndBytesConfig

# ⚠️ This wastes 17-147% energy!
bnb_config = BitsAndBytesConfig(load_in_8bit=True)

# ✅ Fix: add llm_int8_threshold=0.0
bnb_config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=0.0,  # Pure INT8 — saves 17-147% energy
)`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-yellow-300" />
              <span className="bg-yellow-400/20 text-yellow-200 text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-400/30">
                NEW — GitHub Bot
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">EcoCompute Energy Auditor</h2>
            <p className="text-emerald-100 leading-relaxed">
              Free GitHub Bot that automatically reviews your PRs for LLM energy waste patterns.
              Powered by <strong>93+ real GPU measurements</strong> across RTX 5090, RTX 4090D, and A800.
              Zero configuration — install and it just works.
            </p>
            <div className="flex gap-3 mt-4 flex-wrap">
              <a
                href="https://github.com/apps/ecocompute-energy-auditor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg"
              >
                <Github className="w-4 h-4" />
                Install Bot — Free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/hongping-zh/ecocompute-dynamic-eval"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500/30 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-500/50 transition-colors border border-emerald-400/30"
              >
                <ExternalLink className="w-4 h-4" />
                View Source
              </a>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center min-w-[100px]">
              <p className="text-3xl font-black">93+</p>
              <p className="text-xs text-emerald-200 mt-1">GPU Measurements</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center min-w-[100px]">
              <p className="text-3xl font-black">6</p>
              <p className="text-xs text-emerald-200 mt-1">Detection Rules</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center min-w-[100px]">
              <p className="text-3xl font-black">0</p>
              <p className="text-xs text-emerald-200 mt-1">Config Needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
          label="INT8 Default Waste"
          value="17-147%"
          sub="vs FP16 baseline across 5 models"
          color="bg-red-100"
          bgColor="bg-white"
        />
        <StatCard
          icon={<Zap className="w-4 h-4 text-amber-600" />}
          label="BS=1 Waste"
          value="95.7%"
          sub="Energy wasted at batch_size=1"
          color="bg-amber-100"
          bgColor="bg-white"
        />
        <StatCard
          icon={<Shield className="w-4 h-4 text-emerald-600" />}
          label="Detection Rules"
          value="6 Patterns"
          sub="Critical, Warning, and Info levels"
          color="bg-emerald-100"
          bgColor="bg-white"
        />
        <StatCard
          icon={<CheckCircle className="w-4 h-4 text-blue-600" />}
          label="Setup Time"
          value="30 sec"
          sub="Install → auto-audit every PR"
          color="bg-blue-100"
          bgColor="bg-white"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INT8 Comparison Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-1">INT8 Default vs Pure INT8 Energy</h3>
          <p className="text-xs text-slate-500 mb-4">Normalized to FP16 baseline = 100. Lower is better.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={INT8_COMPARISON} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(value: number) => [`${value}%`, 'Relative Energy']}
              />
              <Bar dataKey="energy" radius={[6, 6, 0, 0]}>
                {INT8_COMPARISON.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 text-xs text-slate-500 justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> FP16 Baseline</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> INT8 Default (waste)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> INT8 Pure (efficient)</span>
          </div>
        </div>

        {/* Batch Size Energy Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-1">Batch Size vs Energy per Request</h3>
          <p className="text-xs text-slate-500 mb-4">A800 + Mistral-7B Pure INT8. BS=1 wastes 95.7%.</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={BATCH_ENERGY} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="bs" tick={{ fontSize: 11 }} label={{ value: 'Batch Size', position: 'insideBottom', offset: -2, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Energy (J/req)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(value: number) => [`${value} J`, 'Energy/Request']}
              />
              <Line type="monotone" dataKey="energy" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-slate-500 mt-2">
            BS=1: <strong className="text-red-600">1768 J</strong> → BS=64: <strong className="text-emerald-600">76 J</strong> (23× reduction)
          </p>
        </div>
      </div>

      {/* Detection Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">6 Detection Rules</h3>
          <p className="text-xs text-slate-500 mt-1">All rules backed by real GPU measurement data, not heuristics.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                <th className="text-left p-4 font-semibold">#</th>
                <th className="text-left p-4 font-semibold">Pattern</th>
                <th className="text-left p-4 font-semibold">Severity</th>
                <th className="text-left p-4 font-semibold">Waste</th>
                <th className="text-left p-4 font-semibold">Trigger Code</th>
                <th className="text-left p-4 font-semibold">Fix</th>
              </tr>
            </thead>
            <tbody>
              {DETECTION_RULES.map((rule) => (
                <tr key={rule.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-indigo-600">{rule.id}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{rule.pattern}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{rule.desc}</p>
                  </td>
                  <td className="p-4"><SeverityBadge severity={rule.severity} /></td>
                  <td className="p-4 font-bold text-red-600">{rule.waste}</td>
                  <td className="p-4"><code className="text-xs bg-slate-100 px-2 py-1 rounded text-rose-600">{rule.code}</code></td>
                  <td className="p-4 text-slate-600">{rule.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Install', desc: 'One-click install from GitHub Marketplace. No API keys, no config files.', icon: '📦' },
            { step: '2', title: 'Open PR', desc: 'Push code with LLM quantization patterns (BitsAndBytesConfig, etc).', icon: '🔀' },
            { step: '3', title: 'Auto Audit', desc: 'Bot scans diff, detects patterns, calls audit engine with 93+ measurements.', icon: '🔍' },
            { step: '4', title: 'Get Review', desc: 'Bot posts review with issues, waste %, and fix code you can copy-paste.', icon: '✅' },
          ].map((s) => (
            <div key={s.step} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-xs font-bold text-emerald-600 mb-1">Step {s.step}</div>
              <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
              <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview: Simulated Bot Review */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-1">Live Preview: Bot Review Comment</h3>
        <p className="text-xs text-slate-500 mb-4">This is what the bot posts on your PR when it detects energy waste.</p>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {/* GitHub-style header */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-800">ecocompute-energy-auditor</span>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full ml-2 font-medium">bot</span>
              <span className="text-xs text-slate-500 ml-2">suggested changes now</span>
            </div>
          </div>
          {/* Review body */}
          <div className="p-5 prose prose-sm max-w-none text-slate-700 leading-relaxed">
            <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Zap className="w-5 h-5 text-amber-500" /> EcoCompute Energy Audit
            </h4>
            <p className="text-sm">Scanned <strong>1</strong> Python file(s) in this PR. 1 critical issue(s) found — estimated <strong>30%+</strong> energy waste.</p>
            
            <h5 className="text-red-700 font-bold mt-4 flex items-center gap-1">🔴 Critical Issues</h5>
            <p className="font-semibold text-sm text-slate-800">Default INT8 (bitsandbytes mixed-precision decomposition)</p>
            <blockquote className="border-l-4 border-slate-300 pl-4 text-xs text-slate-600 italic my-2">
              load_in_8bit=True without llm_int8_threshold=0.0 causes 17–147% energy waste due to continuous INT8↔FP16 type conversion at every linear layer.<br />
              Estimated energy waste: <strong>30%+</strong>
            </blockquote>
            <p className="text-sm"><strong className="text-emerald-700">Fix:</strong> Add llm_int8_threshold=0.0 to BitsAndBytesConfig.</p>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs overflow-x-auto">
{`quantization_config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=0.0,  # ← Add this line
)`}
            </pre>

            <h5 className="text-amber-700 font-bold mt-4 flex items-center gap-1">🟡 Warnings</h5>
            <p className="font-semibold text-sm text-slate-800">Sequential single-request processing (BS=1)</p>
            <p className="text-xs text-slate-600">Processing prompts in a loop wastes up to 95.7% energy. Use batch processing with batch_size≥8.</p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800">Quick Fix Example</h3>
            <p className="text-xs text-slate-500 mt-1">One line saves 17-147% energy. Copy this pattern.</p>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCode ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="bg-slate-900 text-slate-300 p-5 rounded-xl text-sm overflow-x-auto leading-relaxed">
          <code>{sampleCode}</code>
        </pre>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-center text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-2">Ready to save energy?</h3>
        <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
          Install the bot in 30 seconds. It's free, zero-config, and works on every PR automatically.
        </p>
        <a
          href="https://github.com/apps/ecocompute-energy-auditor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-3 rounded-xl font-bold text-base hover:bg-emerald-50 transition-colors shadow-lg"
        >
          <Github className="w-5 h-5" />
          Install EcoCompute Energy Auditor
          <ArrowRight className="w-5 h-5" />
        </a>
        <p className="text-xs text-emerald-200 mt-4">
          Free & open source · 93+ GPU measurements · 6 detection rules · Works with bitsandbytes
        </p>
      </div>
    </div>
  );
};
