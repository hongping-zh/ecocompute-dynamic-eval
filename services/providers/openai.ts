import { Provider, ProviderResult, ProviderId } from '../types';

export const openaiProvider: Provider = {
  id: 'openai' as ProviderId,
  name: 'OpenAI',

  capabilities: [{
    provider: 'openai',
    model: 'gpt-4o-mini',
    quality_score: 0.92,
    cost_per_1k_tokens: 0.00015,
    avg_latency_ms: 1200,
    supports_vision: true,
    supports_tools: true,
    energy_profile: 'heavy',
    task_strengths: ['analyze_leaderboard', 'chat_with_image', 'extract_text', 'summarize', 'general'],
  }],

  async run(prompt: string, apiKey: string, model?: string): Promise<ProviderResult> {
    const start = Date.now();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
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
      model: model || 'gpt-4o-mini',
      provider: 'openai',
      latency_ms: latency,
      estimated_cost_usd: (tokens / 1000) * 0.00015,
      token_count: tokens,
    };
  },

  async healthCheck(): Promise<boolean> {
    return true;
  },
};
