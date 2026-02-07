import { Provider, ProviderResult, ProviderCapability, ProviderId } from '../types';

const DEMO_LATENCY = 1200;

export const demoProvider: Provider = {
  id: 'demo' as ProviderId,
  name: 'Demo Mode',

  capabilities: [{
    provider: 'demo',
    model: 'demo-v1',
    quality_score: 0.6,
    cost_per_1k_tokens: 0,
    avg_latency_ms: DEMO_LATENCY,
    supports_vision: false,
    supports_tools: false,
    energy_profile: 'efficient',
    task_strengths: ['analyze_leaderboard', 'summarize', 'general'],
  }],

  async run(prompt: string, _apiKey: string, _model?: string): Promise<ProviderResult> {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, DEMO_LATENCY));
    
    // Task-aware demo responses based on prompt content
    const p = prompt.toLowerCase();
    let text: string;

    if (p.includes('extract') && (p.includes('metric') || p.includes('text') || p.includes('ocr'))) {
      text = '[DEMO] Extracted metrics: TinyLlama-1.1B FP16 — 78.5% accuracy, 602 Tok/W efficiency, 0.066g CO₂/1k tokens. Qwen2-1.5B FP16 — 82.3% accuracy, 415 Tok/W. Configure a real API provider for actual OCR extraction.';
    } else if (p.includes('chat') && (p.includes('image') || p.includes('chart') || p.includes('dashboard'))) {
      text = '[DEMO] The dashboard shows a comparison of AI models by energy efficiency and carbon impact. Quantized models (4-bit NF4) trade ~2-3% accuracy for significantly lower energy consumption. Configure a real API provider for vision-based analysis.';
    } else if (p.includes('knowledge') || p.includes('summariz')) {
      text = '[DEMO] Knowledge entry saved: EcoCompute session — key finding: quantized models achieve 30-40% energy savings with minimal accuracy loss. Best green choice: TinyLlama-1.1B FP16 at 602 Tok/W. Configure a real API provider for richer summaries.';
    } else if (p.includes('model') && p.includes('accuracy')) {
      text = '[DEMO] Based on the metrics, energy-efficient models offer the best green computing trade-off. Consider quantized variants for workloads where marginal accuracy loss is acceptable.';
    } else {
      text = '[DEMO] Analysis complete. Configure a real API provider in Settings for production-quality results.';
    }

    return {
      text,
      model: 'demo-v1',
      provider: 'demo',
      latency_ms: Date.now() - start,
      estimated_cost_usd: 0,
    };
  },

  async healthCheck(): Promise<boolean> {
    return true;
  },
};
