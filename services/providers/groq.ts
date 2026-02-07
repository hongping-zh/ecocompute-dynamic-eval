import { Provider, ProviderResult, ProviderId } from '../types';

export const groqProvider: Provider = {
  id: 'groq' as ProviderId,
  name: 'Groq',

  capabilities: [{
    provider: 'groq',
    model: 'llama-3.1-8b-instant',
    quality_score: 0.78,
    cost_per_1k_tokens: 0.00005,
    avg_latency_ms: 300,
    supports_vision: false,
    supports_tools: false,
    energy_profile: 'efficient',
    task_strengths: ['analyze_leaderboard', 'summarize', 'general'],
  }],

  async run(prompt: string, apiKey: string, model?: string): Promise<ProviderResult> {
    const start = Date.now();
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.choices?.[0]?.message?.content || "Could not generate analysis.";
    const latency = Date.now() - start;
    const tokens = data.usage?.total_tokens || Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4);

    return {
      text,
      model: model || 'llama-3.1-8b-instant',
      provider: 'groq',
      latency_ms: latency,
      estimated_cost_usd: (tokens / 1000) * 0.00005,
      token_count: tokens,
    };
  },

  async healthCheck(): Promise<boolean> {
    return true;
  },
};
