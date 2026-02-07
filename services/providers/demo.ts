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
    
    // Simple demo response based on prompt content
    const isLeaderboard = prompt.toLowerCase().includes('model') && prompt.toLowerCase().includes('accuracy');
    const text = isLeaderboard
      ? '[DEMO] Based on the metrics, energy-efficient models offer the best green computing trade-off. Consider quantized variants for workloads where marginal accuracy loss is acceptable.'
      : '[DEMO] Analysis complete. This is a simulated response — configure a real API provider in Settings for production-quality results.';

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
