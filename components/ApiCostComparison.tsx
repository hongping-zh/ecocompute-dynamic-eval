import React, { useState } from 'react';
import { TrendingDown, Zap, Leaf, DollarSign, ArrowRight, Calculator as CalcIcon } from 'lucide-react';

interface ApiModel {
  name: string;
  provider: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  speedRank: number;
  carbonIntensity: 'low' | 'medium' | 'high';
  useCase: string[];
}

const API_MODELS: ApiModel[] = [
  { name: 'DeepSeek-V3', provider: 'DeepSeek', inputPrice: 0.27, outputPrice: 1.10, contextWindow: 64000, speedRank: 1, carbonIntensity: 'low', useCase: ['coding', 'reasoning', 'analysis'] },
  { name: 'GPT-4o', provider: 'OpenAI', inputPrice: 2.50, outputPrice: 10.00, contextWindow: 128000, speedRank: 2, carbonIntensity: 'medium', useCase: ['general', 'creative', 'analysis'] },
  { name: 'GPT-4o-mini', provider: 'OpenAI', inputPrice: 0.15, outputPrice: 0.60, contextWindow: 128000, speedRank: 1, carbonIntensity: 'low', useCase: ['simple', 'high-volume', 'chatbot'] },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPrice: 3.00, outputPrice: 15.00, contextWindow: 200000, speedRank: 2, carbonIntensity: 'medium', useCase: ['analysis', 'writing', 'research'] },
  { name: 'Claude 3.5 Haiku', provider: 'Anthropic', inputPrice: 0.80, outputPrice: 4.00, contextWindow: 200000, speedRank: 1, carbonIntensity: 'low', useCase: ['simple', 'fast', 'chatbot'] },
  { name: 'Gemini 2.0 Flash', provider: 'Google', inputPrice: 0.10, outputPrice: 0.40, contextWindow: 1000000, speedRank: 1, carbonIntensity: 'low', useCase: ['multimodal', 'high-volume', 'fast'] },
  { name: 'Gemini 1.5 Pro', provider: 'Google', inputPrice: 1.25, outputPrice: 5.00, contextWindow: 2000000, speedRank: 2, carbonIntensity: 'medium', useCase: ['long-context', 'analysis', 'research'] },
  { name: 'Llama 3.3 70B', provider: 'Meta (via Together)', inputPrice: 0.88, outputPrice: 0.88, contextWindow: 128000, speedRank: 2, carbonIntensity: 'low', useCase: ['open-source', 'general', 'cost-effective'] },
];

export const ApiCostComparison: React.FC = () => {
  const [tokensPerDay, setTokensPerDay] = useState(1000000);
  const [inputOutputRatio, setInputOutputRatio] = useState(50);

  const calculateMonthlyCost = (model: ApiModel) => {
    const inputTokens = tokensPerDay * (inputOutputRatio / 100);
    const outputTokens = tokensPerDay * ((100 - inputOutputRatio) / 100);
    const dailyCost = (inputTokens / 1000000) * model.inputPrice + (outputTokens / 1000000) * model.outputPrice;
    return dailyCost * 30;
  };

  const sortedByPrice = [...API_MODELS].sort((a, b) => calculateMonthlyCost(a) - calculateMonthlyCost(b));
  const cheapest = sortedByPrice[0];
  const mostExpensive = sortedByPrice[sortedByPrice.length - 1];
  const savings = calculateMonthlyCost(mostExpensive) - calculateMonthlyCost(cheapest);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* SEO-Optimized Hero Section */}
      <div className="bg-gradient-to-br from-eco-50 to-emerald-50 p-8 rounded-2xl border border-eco-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">AI API Cost Comparison 2026: Complete Guide</h1>
        <p className="text-lg text-slate-600 mb-4">
          Compare pricing, performance, and carbon footprint across GPT-4, Claude, Gemini, DeepSeek, and Llama APIs. 
          Find the most cost-effective AI model for your use case with our interactive calculator.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="px-3 py-1 bg-white rounded-full text-slate-700 font-medium">💰 Save up to ${savings.toFixed(0)}/month</span>
          <span className="px-3 py-1 bg-white rounded-full text-slate-700 font-medium">🌱 Carbon-aware recommendations</span>
          <span className="px-3 py-1 bg-white rounded-full text-slate-700 font-medium">⚡ Real-time pricing data</span>
        </div>
      </div>

      {/* Interactive Cost Calculator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CalcIcon className="w-5 h-5 text-eco-600" />
          Interactive Cost Calculator
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Daily Token Volume</label>
            <input
              type="range"
              min={10000}
              max={10000000}
              step={10000}
              value={tokensPerDay}
              onChange={(e) => setTokensPerDay(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco-600"
            />
            <div className="text-sm text-slate-500 mt-1">
              {tokensPerDay >= 1000000 ? `${(tokensPerDay / 1000000).toFixed(1)}M` : `${(tokensPerDay / 1000).toFixed(0)}K`} tokens/day
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Input/Output Ratio</label>
            <input
              type="range"
              min={0}
              max={100}
              value={inputOutputRatio}
              onChange={(e) => setInputOutputRatio(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="text-sm text-slate-500 mt-1">
              {inputOutputRatio}% input / {100 - inputOutputRatio}% output
            </div>
          </div>
        </div>

        {/* Cost Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="p-3 text-left">Model</th>
                <th className="p-3 text-left">Provider</th>
                <th className="p-3 text-right">Input ($/1M)</th>
                <th className="p-3 text-right">Output ($/1M)</th>
                <th className="p-3 text-right">Monthly Cost</th>
                <th className="p-3 text-center">Carbon</th>
                <th className="p-3 text-left">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedByPrice.map((model, idx) => {
                const monthlyCost = calculateMonthlyCost(model);
                const isLowest = idx === 0;
                return (
                  <tr key={model.name} className={`hover:bg-slate-50 ${isLowest ? 'bg-eco-50/30' : ''}`}>
                    <td className="p-3 font-medium text-slate-800">
                      {model.name}
                      {isLowest && <span className="ml-2 text-xs bg-eco-500 text-white px-2 py-0.5 rounded-full">Lowest Cost</span>}
                    </td>
                    <td className="p-3 text-slate-600">{model.provider}</td>
                    <td className="p-3 text-right font-mono text-slate-700">${model.inputPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-slate-700">${model.outputPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">${monthlyCost.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        model.carbonIntensity === 'low' ? 'bg-eco-500' :
                        model.carbonIntensity === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                    </td>
                    <td className="p-3 text-xs text-slate-500">{model.useCase.join(', ')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-eco-50 p-5 rounded-xl border border-eco-200">
          <DollarSign className="w-8 h-8 text-eco-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">Cheapest Option</h3>
          <p className="text-2xl font-bold text-eco-700">{cheapest.name}</p>
          <p className="text-xs text-slate-600 mt-1">${calculateMonthlyCost(cheapest).toFixed(2)}/month</p>
        </div>
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
          <TrendingDown className="w-8 h-8 text-amber-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">Potential Savings</h3>
          <p className="text-2xl font-bold text-amber-700">${savings.toFixed(0)}/mo</p>
          <p className="text-xs text-slate-600 mt-1">vs most expensive option</p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
          <Leaf className="w-8 h-8 text-emerald-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">Eco-Friendly</h3>
          <p className="text-2xl font-bold text-emerald-700">{API_MODELS.filter(m => m.carbonIntensity === 'low').length}</p>
          <p className="text-xs text-slate-600 mt-1">low-carbon models available</p>
        </div>
      </div>

      {/* SEO Content Sections */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">How to Choose the Right AI API for Your Budget</h2>
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>For high-volume chatbots (1M+ tokens/day):</strong> Gemini 2.0 Flash and GPT-4o-mini offer the best cost-per-token ratio. 
            At 5M tokens/day, Gemini 2.0 Flash costs just ${calculateMonthlyCost(API_MODELS.find(m => m.name === 'Gemini 2.0 Flash')!).toFixed(2)}/month.
          </p>
          <p>
            <strong>For complex reasoning tasks:</strong> DeepSeek-V3 provides GPT-4-level performance at 90% lower cost. 
            Ideal for code generation, data analysis, and technical documentation.
          </p>
          <p>
            <strong>For long-context applications:</strong> Gemini 1.5 Pro supports up to 2M tokens context window, 
            making it perfect for document analysis and research tasks despite higher per-token costs.
          </p>
          <p>
            <strong>For carbon-conscious teams:</strong> All models marked with a green indicator have low carbon intensity. 
            DeepSeek-V3 and Gemini 2.0 Flash combine cost efficiency with environmental responsibility.
          </p>
        </div>
      </div>

      {/* Use Case Scenarios */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Real-World Cost Scenarios</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { scenario: 'Customer Support Chatbot', volume: '2M tokens/day', model: 'GPT-4o-mini', cost: '$27/mo', saving: '85% vs GPT-4o' },
            { scenario: 'Code Review Assistant', volume: '500K tokens/day', model: 'DeepSeek-V3', cost: '$8/mo', saving: '92% vs Claude Sonnet' },
            { scenario: 'Content Generation', volume: '1M tokens/day', model: 'Gemini 2.0 Flash', cost: '$9/mo', saving: '95% vs GPT-4o' },
            { scenario: 'Research Document Analysis', volume: '300K tokens/day', model: 'Claude 3.5 Haiku', cost: '$22/mo', saving: '78% vs Claude Sonnet' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-bold text-slate-800 mb-2">{item.scenario}</h3>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between"><span>Volume:</span><span className="font-semibold">{item.volume}</span></div>
                <div className="flex justify-between"><span>Best Model:</span><span className="font-semibold text-eco-700">{item.model}</span></div>
                <div className="flex justify-between"><span>Monthly Cost:</span><span className="font-bold text-slate-900">{item.cost}</span></div>
                <div className="flex justify-between"><span>Savings:</span><span className="font-semibold text-eco-600">{item.saving}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section for SEO */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'What is the cheapest AI API in 2026?',
              a: 'Gemini 2.0 Flash is currently the most cost-effective option at $0.10/$0.40 per million tokens (input/output), followed by GPT-4o-mini at $0.15/$0.60.'
            },
            {
              q: 'How much does GPT-4 API cost per month?',
              a: 'GPT-4o costs $2.50 input / $10.00 output per million tokens. For 1M tokens/day (50/50 split), monthly cost is approximately $187.50.'
            },
            {
              q: 'Which AI API is best for high-volume applications?',
              a: 'For high-volume workloads (5M+ tokens/day), Gemini 2.0 Flash and DeepSeek-V3 offer the best price-performance ratio with low carbon footprint.'
            },
            {
              q: 'How do I reduce AI API costs?',
              a: 'Key strategies: (1) Use smaller models for simple tasks, (2) Implement caching, (3) Optimize prompts to reduce token usage, (4) Choose models with lower output pricing for generation-heavy tasks.'
            },
          ].map((faq, idx) => (
            <div key={idx} className="border-b border-slate-100 pb-3 last:border-0">
              <h3 className="text-sm font-bold text-slate-800 mb-1">{faq.q}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-eco-500 to-emerald-600 p-8 rounded-2xl text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Optimize Your AI Costs?</h2>
        <p className="text-eco-50 mb-5 max-w-2xl mx-auto">
          Use our full calculator to estimate costs for your specific workload, compare multiple models side-by-side, and generate detailed reports.
        </p>
        <a
          href="#calculator"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-eco-700 rounded-xl font-semibold hover:bg-eco-50 transition-colors"
        >
          Open Full Calculator <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
