// ============================================================
// Leaderboard Analysis — powered by the Execution Control Plane
// No more callGemini(), callOpenAI(), callGroq().
// Just: execute(input, objective, constraints)
// ============================================================

import { ModelData } from '../types';
import { ApiConfig } from '../components/SettingsPanel';
import { execute } from './engine';
import { ProviderId } from './types';

const ANALYSIS_PROMPT = (dataSummary: string) => `You are an expert Eco-AI Analyst. Analyze the following AI model performance data. 
Focus on the trade-off between Accuracy and Carbon Impact. 
Recommend the best model for "Green Computing" vs "High Performance".
Keep it brief (max 3 sentences).

Data:
${dataSummary}`;

export const analyzeLeaderboard = async (models: ModelData[], config: ApiConfig): Promise<string> => {
  const dataSummary = models.map(m => 
    `- ${m.name}: Acc ${m.accuracy}%, Time ${m.executionTime}s, Carbon ${m.carbonImpact}g`
  ).join('\n');

  const result = await execute(
    {
      input: {
        task_type: 'analyze_leaderboard',
        prompt: ANALYSIS_PROMPT(dataSummary),
        context: { model_count: models.length },
      },
      objective: 'balanced',
      constraints: {
        preferred_provider: config.provider as ProviderId,
        fallback_providers: ['demo'],
        max_tokens: 200,
      },
    },
    config.apiKey,
  );

  if (result.success && result.data) {
    return result.data.text;
  }
  return `Analysis failed: ${result.error || 'Unknown error'}. Please check your API key.`;
};