import { GoogleGenAI } from "@google/genai";
import { ModelData } from '../types';
import { ApiConfig, ApiProvider } from '../components/SettingsPanel';

const ANALYSIS_PROMPT = (dataSummary: string) => `You are an expert Eco-AI Analyst. Analyze the following AI model performance data. 
Focus on the trade-off between Accuracy and Carbon Impact. 
Recommend the best model for "Green Computing" vs "High Performance".
Keep it brief (max 3 sentences).

Data:
${dataSummary}`;

// Demo mode response
const getDemoResponse = async (models: ModelData[]): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const bestModel = models[0];
  const efficientModel = models.reduce((prev, current) => 
    (prev.energyEfficiency > current.energyEfficiency) ? prev : current
  );
  return `[DEMO] Based on real-time metrics, ${bestModel.name} is currently the top performer. ` +
         `However, ${efficientModel.name} offers the best energy efficiency (${efficientModel.energyEfficiency.toFixed(0)} Tok/W), ` +
         `making it the ideal choice for green computing workflows.`;
};

// Gemini API call
const callGemini = async (prompt: string, apiKey: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  return response.text || "Could not generate analysis.";
};

// OpenAI API call
const callOpenAI = async (prompt: string, apiKey: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || "Could not generate analysis.";
};

// Groq API call
const callGroq = async (prompt: string, apiKey: string): Promise<string> => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || "Could not generate analysis.";
};

export const analyzeLeaderboard = async (models: ModelData[], config: ApiConfig): Promise<string> => {
  const dataSummary = models.map(m => 
    `- ${m.name}: Acc ${m.accuracy}%, Time ${m.executionTime}s, Carbon ${m.carbonImpact}g`
  ).join('\n');
  const prompt = ANALYSIS_PROMPT(dataSummary);

  try {
    switch (config.provider) {
      case 'demo':
        return await getDemoResponse(models);
      case 'gemini':
        return await callGemini(prompt, config.apiKey);
      case 'openai':
        return await callOpenAI(prompt, config.apiKey);
      case 'groq':
        return await callGroq(prompt, config.apiKey);
      default:
        return await getDemoResponse(models);
    }
  } catch (error) {
    console.error(`${config.provider} API Error:`, error);
    return `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key.`;
  }
};