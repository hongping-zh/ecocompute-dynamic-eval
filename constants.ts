import { ModelData } from './types';

export const INITIAL_MODELS: ModelData[] = [
  // Existing Modern Models
  {
    id: 'm1',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    accuracy: 96.4,
    executionTime: 0.8,
    cost: 0.0005,
    carbonImpact: 0.12,
    energyEfficiency: 850,
    tags: ['efficient', 'fast']
  },
  {
    id: 'm2',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    accuracy: 98.2,
    executionTime: 2.1,
    cost: 0.002,
    carbonImpact: 0.45,
    energyEfficiency: 420,
    tags: ['reasoning', 'complex']
  },
  {
    id: 'm3',
    name: 'GPT-4o',
    provider: 'OpenAI',
    accuracy: 97.9,
    executionTime: 1.8,
    cost: 0.005,
    carbonImpact: 0.52,
    energyEfficiency: 380,
    tags: ['general', 'popular']
  },
  {
    id: 'm4',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    accuracy: 98.0,
    executionTime: 2.4,
    cost: 0.003,
    carbonImpact: 0.48,
    energyEfficiency: 400,
    tags: ['coding']
  },

  // Transformer Series (from screenshot)
  {
    id: 't-small',
    name: 'Transformer Small (125M params)',
    provider: 'Research',
    accuracy: 76.5,
    executionTime: 0.05,
    cost: 0.00005,
    carbonImpact: 0.01,
    energyEfficiency: 1500,
    tags: ['legacy', 'tiny']
  },
  {
    id: 't-medium',
    name: 'Transformer Medium (350M params)',
    provider: 'Research',
    accuracy: 82.1,
    executionTime: 0.12,
    cost: 0.0001,
    carbonImpact: 0.03,
    energyEfficiency: 1100,
    tags: ['legacy']
  },
  {
    id: 't-large',
    name: 'Transformer Large (1.3B params)',
    provider: 'Research',
    accuracy: 88.4,
    executionTime: 0.45,
    cost: 0.0003,
    carbonImpact: 0.09,
    energyEfficiency: 900,
    tags: ['legacy']
  },
  {
    id: 't-xl',
    name: 'Transformer XL (6.7B params)',
    provider: 'Research',
    accuracy: 91.2,
    executionTime: 1.1,
    cost: 0.0008,
    carbonImpact: 0.25,
    energyEfficiency: 600,
    tags: ['legacy']
  },

  // LLaMA-style Models (from screenshot)
  {
    id: 'llama-7b',
    name: 'LLaMA-style 7B',
    provider: 'Meta Research',
    accuracy: 92.5,
    executionTime: 1.2,
    cost: 0.0006,
    carbonImpact: 0.18,
    energyEfficiency: 750,
    tags: ['text-generation', 'open-weights']
  },
  {
    id: 'llama-13b',
    name: 'LLaMA-style 13B',
    provider: 'Meta Research',
    accuracy: 94.1,
    executionTime: 2.1,
    cost: 0.0012,
    carbonImpact: 0.35,
    energyEfficiency: 500,
    tags: ['text-generation', 'open-weights']
  },
  {
    id: 'llama-70b',
    name: 'LLaMA-style 70B',
    provider: 'Meta Research',
    accuracy: 96.8,
    executionTime: 4.5,
    cost: 0.004,
    carbonImpact: 0.95,
    energyEfficiency: 180,
    tags: ['text-generation', 'heavy']
  },

  // Computer Vision Models (from screenshot)
  {
    id: 'resnet-50',
    name: 'ResNet-50 (CNN)',
    provider: 'Microsoft',
    accuracy: 89.5,
    executionTime: 0.25,
    cost: 0.0002,
    carbonImpact: 0.05,
    energyEfficiency: 1000,
    tags: ['computer-vision']
  },
  {
    id: 'resnet-152',
    name: 'ResNet-152 (CNN)',
    provider: 'Microsoft',
    accuracy: 91.8,
    executionTime: 0.55,
    cost: 0.0004,
    carbonImpact: 0.11,
    energyEfficiency: 700,
    tags: ['computer-vision']
  },

  // BERT Models (from screenshot)
  {
    id: 'bert-base',
    name: 'BERT Base',
    provider: 'Google',
    accuracy: 85.2,
    executionTime: 0.15,
    cost: 0.00015,
    carbonImpact: 0.04,
    energyEfficiency: 1100,
    tags: ['nlp', 'encoder']
  },
  {
    id: 'bert-large',
    name: 'BERT Large',
    provider: 'Google',
    accuracy: 88.9,
    executionTime: 0.35,
    cost: 0.0003,
    carbonImpact: 0.08,
    energyEfficiency: 850,
    tags: ['nlp', 'encoder']
  }
];

export const HARDWARE_OPTIONS = [
  { value: 'a100', label: 'NVIDIA A100 (400W)', power: 400 },
  { value: 'h100', label: 'NVIDIA H100 (700W)', power: 700 },
  { value: 'v100', label: 'NVIDIA V100 (300W)', power: 300 },
  { value: 't4', label: 'NVIDIA T4 (70W)', power: 70 },
  { value: 'cpu', label: 'Standard CPU Server (200W)', power: 200 },
];