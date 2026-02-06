import React from 'react';

type Props = {
  onOpenCalculator: () => void;
};

export const DeepSeekVsGpt: React.FC<Props> = ({ onOpenCalculator }) => {
  const directLink = `${window.location.origin}${window.location.pathname}?view=CALCULATOR&template=deepseek-vs-gpt`;

  const copyDirectLink = async () => {
    try {
      await navigator.clipboard.writeText(directLink);
    } catch {
      const input = document.createElement('input');
      input.value = directLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">DeepSeek vs GPT</h2>
        <p className="text-sm text-slate-500 mt-1">
          Use the calculator to estimate cost and carbon impact for your workload, then compare models side-by-side.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={onOpenCalculator}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-sm text-sm font-medium"
          >
            Open Comparison Template
          </button>
          <button
            onClick={copyDirectLink}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium"
          >
            Copy Direct Link
          </button>
          <a
            href="https://github.com/hongping-zh/ecocompute-dynamic-eval"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">When DeepSeek is a good fit</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>
              Budget-sensitive workloads where you can tolerate more variance and want to explore alternative providers.
            </p>
            <p>
              Large batch jobs where unit economics dominate and you have evaluation coverage.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">When GPT is a good fit</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>
              Production workloads prioritizing quality, tooling ecosystem maturity, and broad multimodal support.
            </p>
            <p>
              Scenarios requiring stable behavior and predictable model updates.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700">Recommended workflow</h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400">Step 1</div>
              <div className="mt-1 text-sm font-medium text-slate-700">Define workload</div>
              <div className="mt-2 text-sm text-slate-600">Tokens, calls, runtime, region, PUE.</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400">Step 2</div>
              <div className="mt-1 text-sm font-medium text-slate-700">Estimate & compare</div>
              <div className="mt-2 text-sm text-slate-600">Cost, carbon, and latency trade-offs.</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400">Step 3</div>
              <div className="mt-1 text-sm font-medium text-slate-700">Validate quality</div>
              <div className="mt-2 text-sm text-slate-600">Run evaluation on your own prompts.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
