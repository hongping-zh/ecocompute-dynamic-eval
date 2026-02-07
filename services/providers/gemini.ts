import { GoogleGenAI } from "@google/genai";
import { Provider, ProviderResult, ProviderId } from '../types';

export const geminiProvider: Provider = {
  id: 'gemini' as ProviderId,
  name: 'Google Gemini',

  capabilities: [{
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    quality_score: 0.88,
    cost_per_1k_tokens: 0.00015,
    avg_latency_ms: 800,
    supports_vision: true,
    supports_tools: true,
    energy_profile: 'moderate',
    task_strengths: ['analyze_leaderboard', 'chat_with_image', 'extract_text', 'summarize', 'general'],
  }],

  async run(prompt: string, apiKey: string, model?: string): Promise<ProviderResult> {
    const start = Date.now();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response.text || "Could not generate analysis.";
    const latency = Date.now() - start;
    const estimatedTokens = Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4);

    return {
      text,
      model: model || 'gemini-2.0-flash',
      provider: 'gemini',
      latency_ms: latency,
      estimated_cost_usd: (estimatedTokens / 1000) * 0.00015,
      token_count: estimatedTokens,
    };
  },

  async healthCheck(): Promise<boolean> {
    return true;
  },
};
