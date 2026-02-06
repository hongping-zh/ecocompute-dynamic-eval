export interface ModelData {
  id: string;
  name: string;
  provider: string;
  accuracy: number;
  executionTime: number; // seconds
  cost: number; // per 1k tokens
  carbonImpact: number; // grams CO2
  energyEfficiency: number; // tokens per watt
  tags: string[];
}

export interface CalculatorState {
  hardware: string;
  count: number;
  hours: number;
  pue: number; // Power Usage Effectiveness
  region: string;
}

export type SortField = 'accuracy' | 'executionTime' | 'cost' | 'carbonImpact' | 'energyEfficiency';
export type SortDirection = 'asc' | 'desc';

export enum AppView {
  CALCULATOR = 'CALCULATOR',
  LEADERBOARD = 'LEADERBOARD',
  MONITOR = 'MONITOR',
  METHODOLOGY = 'METHODOLOGY',
  DEEPSEEK_VS_GPT = 'DEEPSEEK_VS_GPT'
}