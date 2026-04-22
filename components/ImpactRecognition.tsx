import React, { useEffect, useState } from 'react';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface ZenodoStats {
  views: number | null;
  downloads: number | null;
  version: string;
}

const ImpactRecognition: React.FC = () => {
  const [zenodoStats, setZenodoStats] = useState<ZenodoStats>({ views: null, downloads: null, version: 'v1.0' });
  const [copied, setCopied] = useState(false);

  const ZENODO_DOI = '10.5281/zenodo.18900289';
  const ORCID = '0009-0000-2529-4613';

  const citation = `@dataset{zhang2026llmenergy,
  author    = {Zhang, Hongping},
  title     = {LLM Energy Efficiency Benchmark Dataset},
  year      = {2026},
  doi       = {${ZENODO_DOI}},
  url       = {https://doi.org/${ZENODO_DOI}},
  note      = {93+ GPU power measurements across RTX 5090, RTX 4090D, A800. NVML 10Hz sampling.}
}`;

  useEffect(() => {
    fetch(`https://zenodo.org/api/records/18900289`)
      .then(r => r.json())
      .then(data => {
        setZenodoStats({
          views: data.stats?.views ?? 0,
          downloads: data.stats?.downloads ?? 0,
          version: data.metadata?.version ?? 'v1.0',
        });
      })
      .catch(() => {
        setZenodoStats({ views: 0, downloads: 0, version: 'v1.0' });
      });
  }, []);

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-bold text-slate-800">Impact &amp; Recognition</h2>
        <span className="px-2.5 py-1 bg-eco-100 text-eco-700 text-xs font-semibold rounded-full">Research Contributions</span>
      </div>

      {/* Researcher Identity & Citation Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 text-center mb-5">Researcher Identity &amp; Citation</h3>

        {/* ORCID */}
        <div className="flex flex-col items-center gap-4 mb-5">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#a6ce39 0%,#4a8f3f 100%)' }}>
                O
              </div>
              <div>
                <div className="font-mono text-sm font-semibold text-slate-800">ORCID: {ORCID}</div>
                <div className="text-xs text-slate-500">Verified researcher identity</div>
              </div>
            </div>
          </div>
          <a
            href={`https://orcid.org/${ORCID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#a6ce39' }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View ORCID Profile
          </a>
        </div>

        {/* Zenodo DOI */}
        <div className="pt-5 border-t border-slate-100">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#059669 0%,#047857 100%)' }}>
                Z
              </div>
              <div>
                <div className="font-mono text-sm font-semibold text-slate-800">DOI: {ZENODO_DOI}</div>
                <div className="text-xs text-slate-500">Cite this dataset in your research</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <a
                href={`https://doi.org/${ZENODO_DOI}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-eco-600 text-white rounded-lg text-sm font-semibold hover:bg-eco-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on Zenodo
              </a>
              <button
                onClick={handleCopyCitation}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-eco-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Citation'}
              </button>
            </div>
          </div>
        </div>

        {/* Zenodo Live Stats */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-400 text-center mb-3">Real-time Zenodo Statistics</div>
          <div className="flex justify-center gap-8 flex-wrap">
            {[
              { label: 'Views', value: zenodoStats.views },
              { label: 'Downloads', value: zenodoStats.downloads },
              { label: 'Version', value: zenodoStats.version },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-slate-800">
                  {stat.value === null ? '…' : stat.value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Impact Metrics */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-400 text-center mb-3">Academic Impact Metrics</div>
          <div className="flex justify-center gap-6 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg,#ff6b35 0%,#f7931e 100%)' }}>
                A
              </div>
              <div>
                <div className="font-mono text-sm font-semibold text-slate-800">Altmetric Score</div>
                <div className="text-xs text-slate-500">Research impact across media and policy</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)' }}>
                C
              </div>
              <div>
                <div className="font-mono text-sm font-semibold text-slate-800">Citation Count</div>
                <div className="text-xs text-slate-500">Academic citations tracked</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recognition Cards Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* MLCommons Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">⚙️</div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Proposal To</div>
              <div className="font-bold text-slate-800 text-sm">MLCommons / MLPerf Inference</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Active Discussion
          </span>
          <div>
            <div className="font-bold text-slate-800 text-sm mb-1">Adding Energy Consumption Metrics to MLPerf Inference Benchmark</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              We proposed adding energy efficiency metrics (energy per query/token, average power, tokens/Joule) to the <strong className="text-slate-700">MLPerf Inference Benchmark</strong> — the industry-standard AI performance benchmark by MLCommons. Current benchmarks only report throughput and latency, making energy trade-offs invisible to practitioners.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: '270', lbl: 'Configurations' },
              { num: '3', lbl: 'GPU Archs' },
              { num: '10 Hz', lbl: 'NVML' },
              { num: '200+', lbl: 'Measurements' },
            ].map(s => (
              <div key={s.lbl} className="text-center bg-slate-50 rounded-lg p-2">
                <div className="font-black text-slate-800 text-sm">{s.num}</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{s.lbl}</div>
              </div>
            ))}
          </div>
          <ul className="space-y-1.5">
            {[
              'Proposed 3 new metrics: Energy/query (J), Avg power (W), Efficiency ratio (tok/J)',
              'Quantization energy trade-offs remain invisible to existing throughput/latency metrics',
              'Invited to collaborate with MLCommons Power Working Group',
            ].map(f => (
              <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <a
            href="https://github.com/mlcommons/inference/issues/2558"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Discussion #2558
          </a>
        </div>

        {/* Hugging Face Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-xl flex-shrink-0">🤗</div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Merged Into</div>
              <div className="font-bold text-slate-800 text-sm">Hugging Face Optimum Docs</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            PR Accepted &amp; Merged
          </span>
          <div>
            <div className="font-bold text-slate-800 text-sm mb-1">Energy Efficiency in Practice — Official Quantization Documentation</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our systematic benchmarking findings were accepted into <strong className="text-slate-700">Hugging Face's official Optimum library documentation</strong> — the canonical reference for model optimization used by millions of ML practitioners worldwide.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: '39', lbl: 'Models' },
              { num: '4', lbl: 'GPU Platforms' },
              { num: '3', lbl: 'Quant Methods' },
              { num: '2', lbl: 'HW Gens' },
            ].map(s => (
              <div key={s.lbl} className="text-center bg-amber-50 rounded-lg p-2">
                <div className="font-black text-slate-800 text-sm">{s.num}</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{s.lbl}</div>
              </div>
            ))}
          </div>
          <ul className="space-y-1.5">
            {[
              'Large models (≥5B): NF4 achieves near-FP16 energy with major memory savings',
              'Small models (<3B): NF4 can increase energy by 25–56%',
              'Batch size optimization reduces per-token energy by up to 96%',
            ].map(f => (
              <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <a
            href="https://huggingface.co/docs/optimum/concept_guides/quantization#energy-efficiency-in-practice"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Read in HF Docs
          </a>
        </div>
      </div>
    </div>
  );
};

export default ImpactRecognition;
