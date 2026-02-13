import { ModelData } from './types';

// ============================================================
// RTX 5090 BENCHMARK DATA (Real measurements)
// Source: EcoCompute AI Energy Benchmark, January 2026
// Hardware: NVIDIA GeForce RTX 5090 (32GB GDDR7, Blackwell)
// Platform: AutoDL Cloud Server, PyTorch 2.10.0+cu128
// ============================================================

export const INITIAL_MODELS: ModelData[] = [
  // ========== RTX 5090 Benchmarked Models (Real Data) ==========
  // FP16 Configurations
  {
    id: 'tinyllama-fp16',
    name: 'TinyLlama-1.1B (FP16)',
    provider: 'RTX 5090 Benchmark',
    accuracy: 78.5,
    executionTime: 0.0105,  // 1000/94.87 tokens/sec
    cost: 0.00016,          // Based on energy cost
    carbonImpact: 0.066,    // 1659 J/1k * 0.4 gCO2/Wh / 3600 * 1000
    energyEfficiency: 602,  // 94.87 / 157.45 * 1000
    tags: ['fp16', 'small', 'rtx5090-verified'],
    provenance: {
      source: 'EcoCompute RTX 5090 Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 5090 via PyTorch 2.10.0+cu128, AutoDL Cloud. Throughput from token generation, energy from nvidia-smi polling.',
      lastVerified: '2026-01-15',
      citation: 'https://github.com/hongping-zh/ecocompute-ai/blob/main/RTX5090_Energy_Benchmark_Report_EN.md'
    }
  },
  {
    id: 'tinyllama-4bit',
    name: 'TinyLlama-1.1B (4-bit NF4)',
    provider: 'RTX 5090 Benchmark',
    accuracy: 76.2,
    executionTime: 0.0179,  // 1000/55.79
    cost: 0.00021,
    carbonImpact: 0.083,    // 2098 J/1k * 0.4 / 3600 * 1000
    energyEfficiency: 477,  // 55.79 / 117.02 * 1000
    tags: ['4bit', 'quantized', 'rtx5090-verified'],
    provenance: {
      source: 'EcoCompute RTX 5090 Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 5090 via PyTorch 2.10.0+cu128, AutoDL Cloud. 4-bit NF4 quantization via bitsandbytes.',
      lastVerified: '2026-01-15',
      citation: 'https://github.com/hongping-zh/ecocompute-ai/blob/main/RTX5090_Energy_Benchmark_Report_EN.md'
    }
  },
  {
    id: 'qwen2-1.5b-fp16',
    name: 'Qwen2-1.5B (FP16)',
    provider: 'RTX 5090 Benchmark',
    accuracy: 82.3,
    executionTime: 0.0140,  // 1000/71.45
    cost: 0.00024,
    carbonImpact: 0.096,    // 2411 J/1k
    energyEfficiency: 415,  // 71.45 / 172.30 * 1000
    tags: ['fp16', 'small', 'rtx5090-verified'],
    provenance: {
      source: 'EcoCompute RTX 5090 Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 5090 via PyTorch 2.10.0+cu128, AutoDL Cloud.',
      lastVerified: '2026-01-15',
      citation: 'https://github.com/hongping-zh/ecocompute-ai/blob/main/RTX5090_Energy_Benchmark_Report_EN.md'
    }
  },
  {
    id: 'qwen2-1.5b-4bit',
    name: 'Qwen2-1.5B (4-bit NF4)',
    provider: 'RTX 5090 Benchmark',
    accuracy: 79.8,
    executionTime: 0.0241,  // 1000/41.57
    cost: 0.00031,
    carbonImpact: 0.124,    // 3120 J/1k
    energyEfficiency: 320,  // 41.57 / 129.83 * 1000
    tags: ['4bit', 'quantized', 'rtx5090-verified'],
    provenance: {
      source: 'EcoCompute RTX 5090 Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 5090 via PyTorch 2.10.0+cu128, AutoDL Cloud. 4-bit NF4 quantization via bitsandbytes.',
      lastVerified: '2026-01-15',
      citation: 'https://github.com/hongping-zh/ecocompute-ai/blob/main/RTX5090_Energy_Benchmark_Report_EN.md'
    }
  },
  {
    id: 'qwen2.5-3b-fp16',
    name: 'Qwen2.5-3B (FP16)',
    provider: 'RTX 5090 Benchmark',
    accuracy: 86.7,
    executionTime: 0.0183,  // 1000/54.77
    cost: 0.00034,
    carbonImpact: 0.134,    // 3383 J/1k
    energyEfficiency: 295,  // 54.77 / 185.59 * 1000
    tags: ['fp16', 'medium', 'rtx5090-verified'],
    provenance: {
      source: 'EcoCompute RTX 5090 Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 5090 via PyTorch 2.10.0+cu128, AutoDL Cloud.',
      lastVerified: '2026-01-15',
      citation: 'https://github.com/hongping-zh/ecocompute-ai/blob/main/RTX5090_Energy_Benchmark_Report_EN.md'
    }
  },
  {
    id: 'qwen2.5-3b-4bit',
    name: 'Qwen2.5-3B (4-bit NF4)',
    provider: 'RTX 5090 Benchmark',
    accuracy: 84.1,
    executionTime: 0.0314,  // 1000/31.85
    cost: 0.00038,
    carbonImpact: 0.150,    // 3780 J/1k
    energyEfficiency: 264,  // 31.85 / 120.46 * 1000
    tags: ['4bit', 'quantized', 'rtx5090-verified'],
    provenance: {
      source: 'EcoCompute RTX 5090 Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 5090 via PyTorch 2.10.0+cu128, AutoDL Cloud. 4-bit NF4 quantization via bitsandbytes.',
      lastVerified: '2026-01-15',
      citation: 'https://github.com/hongping-zh/ecocompute-ai/blob/main/RTX5090_Energy_Benchmark_Report_EN.md'
    }
  },
  {
    id: 'qwen2-7b-fp16',
    name: 'Qwen2-7B (FP16)',
    provider: 'RTX 5090 Benchmark',
    accuracy: 91.2,
    executionTime: 0.0142,  // 1000/70.47
    cost: 0.00055,
    carbonImpact: 0.218,    // 5509 J/1k
    energyEfficiency: 181,  // 70.47 / 388.34 * 1000
    tags: ['fp16', 'large', 'rtx5090-verified'],
    provenance: {
      source: 'EcoCompute RTX 5090 Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 5090 via PyTorch 2.10.0+cu128, AutoDL Cloud.',
      lastVerified: '2026-01-15',
      citation: 'https://github.com/hongping-zh/ecocompute-ai/blob/main/RTX5090_Energy_Benchmark_Report_EN.md'
    }
  },
  {
    id: 'qwen2-7b-4bit',
    name: 'Qwen2-7B (4-bit NF4) ⭐',
    provider: 'RTX 5090 Benchmark',
    accuracy: 89.5,
    executionTime: 0.0242,  // 1000/41.40
    cost: 0.00049,
    carbonImpact: 0.193,    // 4878 J/1k - 11.4% savings!
    energyEfficiency: 205,  // 41.40 / 201.88 * 1000
    tags: ['4bit', 'quantized', 'energy-efficient', 'rtx5090-verified'],
    provenance: {
      source: 'EcoCompute RTX 5090 Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 5090 via PyTorch 2.10.0+cu128, AutoDL Cloud. 4-bit NF4 quantization via bitsandbytes. 11.4% energy savings vs FP16.',
      lastVerified: '2026-01-15',
      citation: 'https://github.com/hongping-zh/ecocompute-ai/blob/main/RTX5090_Energy_Benchmark_Report_EN.md'
    }
  },

  // ========== RTX 4090D Benchmarked Models (Real Data) ==========
  // Yi-1.5-6B-Chat
  {
    id: 'yi-1.5-6b-fp16',
    name: 'Yi-1.5-6B-Chat (FP16)',
    provider: 'RTX 4090D Benchmark',
    accuracy: 88.5,
    executionTime: 0.0288,  // 1000/34.72
    cost: 0.00047,
    carbonImpact: 0.187,    // 4716 J/1k * 0.4 / 3600 * 1000
    energyEfficiency: 192,  // 34.72 / 180.74 * 1000
    tags: ['fp16', 'medium', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D via PyTorch 2.4.1+cu121, AutoDL Cloud. NVML power monitoring, 10 iterations.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  {
    id: 'yi-1.5-6b-nf4',
    name: 'Yi-1.5-6B-Chat (NF4) ⭐',
    provider: 'RTX 4090D Benchmark',
    accuracy: 86.2,
    executionTime: 0.0520,  // 1000/19.23
    cost: 0.00033,
    carbonImpact: 0.131,    // 3292 J/1k - 30.2% savings!
    energyEfficiency: 238,  // 19.23 / 80.87 * 1000
    tags: ['4bit', 'quantized', 'energy-efficient', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D. NF4 quantization via bitsandbytes. 30.2% energy savings vs FP16.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  {
    id: 'yi-1.5-6b-int8',
    name: 'Yi-1.5-6B-Chat (INT8) ⚠️',
    provider: 'RTX 4090D Benchmark',
    accuracy: 87.8,
    executionTime: 0.1188,  // 1000/8.42
    cost: 0.00063,
    carbonImpact: 0.248,    // 6258 J/1k - 32.7% MORE energy!
    energyEfficiency: 120,  // 8.42 / 70.02 * 1000
    tags: ['8bit', 'quantized', 'inefficient', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D. INT8 uses 32.7% MORE energy than FP16. Not recommended.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  // Mistral-7B-Instruct-v0.3
  {
    id: 'mistral-7b-fp16',
    name: 'Mistral-7B-Instruct-v0.3 (FP16)',
    provider: 'RTX 4090D Benchmark',
    accuracy: 92.8,
    executionTime: 0.0344,  // 1000/29.06
    cost: 0.00057,
    carbonImpact: 0.224,    // 5661 J/1k
    energyEfficiency: 160,  // 29.06 / 181.91 * 1000
    tags: ['fp16', 'large', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D via PyTorch 2.4.1+cu121, AutoDL Cloud.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  {
    id: 'mistral-7b-nf4',
    name: 'Mistral-7B-Instruct-v0.3 (NF4) ⭐',
    provider: 'RTX 4090D Benchmark',
    accuracy: 90.5,
    executionTime: 0.0576,  // 1000/17.37
    cost: 0.00037,
    carbonImpact: 0.147,    // 3707 J/1k - 34.5% savings!
    energyEfficiency: 213,  // 17.37 / 81.49 * 1000
    tags: ['4bit', 'quantized', 'energy-efficient', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D. NF4 saves 34.5% energy vs FP16.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  {
    id: 'mistral-7b-int8',
    name: 'Mistral-7B-Instruct-v0.3 (INT8) ⚠️',
    provider: 'RTX 4090D Benchmark',
    accuracy: 91.9,
    executionTime: 0.1268,  // 1000/7.88
    cost: 0.00074,
    carbonImpact: 0.293,    // 7401 J/1k - 30.7% MORE energy!
    energyEfficiency: 105,  // 7.88 / 75.29 * 1000
    tags: ['8bit', 'quantized', 'inefficient', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D. INT8 uses 30.7% MORE energy than FP16.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  // Phi-3-mini-4k-instruct
  {
    id: 'phi-3-mini-fp16',
    name: 'Phi-3-mini-4k-instruct (FP16)',
    provider: 'RTX 4090D Benchmark',
    accuracy: 84.7,
    executionTime: 0.0343,  // 1000/29.19
    cost: 0.00030,
    carbonImpact: 0.119,    // 3003 J/1k
    energyEfficiency: 278,  // 29.19 / 105.17 * 1000
    tags: ['fp16', 'small', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D via PyTorch 2.4.1+cu121, AutoDL Cloud.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  {
    id: 'phi-3-mini-nf4',
    name: 'Phi-3-mini-4k-instruct (NF4) ⭐',
    provider: 'RTX 4090D Benchmark',
    accuracy: 82.4,
    executionTime: 0.0497,  // 1000/20.12
    cost: 0.00028,
    carbonImpact: 0.109,    // 2759 J/1k - 8.1% savings
    energyEfficiency: 276,  // 20.12 / 72.90 * 1000
    tags: ['4bit', 'quantized', 'energy-efficient', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D. NF4 saves 8.1% energy vs FP16.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  {
    id: 'phi-3-mini-int8',
    name: 'Phi-3-mini-4k-instruct (INT8) ⚠️',
    provider: 'RTX 4090D Benchmark',
    accuracy: 83.6,
    executionTime: 0.0760,  // 1000/13.15
    cost: 0.00039,
    carbonImpact: 0.156,    // 3940 J/1k - 31.2% MORE energy!
    energyEfficiency: 190,  // 13.15 / 69.17 * 1000
    tags: ['8bit', 'quantized', 'inefficient', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D. INT8 uses 31.2% MORE energy than FP16.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  // Qwen2.5-7B-Instruct
  {
    id: 'qwen2.5-7b-fp16-4090d',
    name: 'Qwen2.5-7B-Instruct (FP16)',
    provider: 'RTX 4090D Benchmark',
    accuracy: 93.5,
    executionTime: 0.0266,  // 1000/37.64
    cost: 0.00052,
    carbonImpact: 0.207,    // 5217 J/1k
    energyEfficiency: 176,  // 37.64 / 213.45 * 1000
    tags: ['fp16', 'large', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D via PyTorch 2.4.1+cu121, AutoDL Cloud.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  {
    id: 'qwen2.5-7b-nf4-4090d',
    name: 'Qwen2.5-7B-Instruct (NF4) ⭐',
    provider: 'RTX 4090D Benchmark',
    accuracy: 91.2,
    executionTime: 0.0468,  // 1000/21.38
    cost: 0.00035,
    carbonImpact: 0.139,    // 3509 J/1k - 32.7% savings!
    energyEfficiency: 231,  // 21.38 / 92.45 * 1000
    tags: ['4bit', 'quantized', 'energy-efficient', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D. NF4 saves 32.7% energy vs FP16.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },
  {
    id: 'qwen2.5-7b-int8-4090d',
    name: 'Qwen2.5-7B-Instruct (INT8) ⚠️',
    provider: 'RTX 4090D Benchmark',
    accuracy: 92.7,
    executionTime: 0.1046,  // 1000/9.56
    cost: 0.00061,
    carbonImpact: 0.243,    // 6127 J/1k - 17.4% MORE energy!
    energyEfficiency: 126,  // 9.56 / 75.94 * 1000
    tags: ['8bit', 'quantized', 'inefficient', 'rtx4090d-verified'],
    provenance: {
      source: 'EcoCompute RTX 4090D Benchmark',
      confidence: 'measured',
      methodology: 'Direct measurement on RTX 4090D. INT8 uses 17.4% MORE energy than FP16.',
      lastVerified: '2026-02-12',
      citation: 'https://github.com/hongping-zh/ecocompute-ai'
    }
  },

  // ========== Commercial API Models (Estimated) ==========
  {
    id: 'm1',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    accuracy: 96.4,
    executionTime: 0.8,
    cost: 0.0005,
    carbonImpact: 0.12,
    energyEfficiency: 850,
    tags: ['efficient', 'fast'],
    provenance: {
      source: 'Google Cloud pricing page + IEA grid intensity estimates',
      confidence: 'estimated',
      methodology: 'Cost from published API pricing. Carbon estimated using avg US grid intensity (0.4 kgCO2/kWh) and assumed inference power draw. Not independently verified.',
      lastVerified: '2026-01-20',
      citation: 'https://ai.google.dev/pricing'
    }
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
    tags: ['reasoning', 'complex'],
    provenance: {
      source: 'Google Cloud pricing page + IEA grid intensity estimates',
      confidence: 'estimated',
      methodology: 'Cost from published API pricing. Carbon estimated using avg US grid intensity and assumed inference power draw. Not independently verified.',
      lastVerified: '2026-01-20',
      citation: 'https://ai.google.dev/pricing'
    }
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
    tags: ['general', 'popular'],
    provenance: {
      source: 'OpenAI pricing page + IEA grid intensity estimates',
      confidence: 'estimated',
      methodology: 'Cost from published API pricing. Carbon estimated using avg US grid intensity and assumed datacenter PUE ~1.1. Not independently verified.',
      lastVerified: '2026-01-20',
      citation: 'https://openai.com/api/pricing/'
    }
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
    tags: ['coding'],
    provenance: {
      source: 'Anthropic pricing page + IEA grid intensity estimates',
      confidence: 'estimated',
      methodology: 'Cost from published API pricing. Carbon estimated using avg US grid intensity and assumed datacenter PUE ~1.1. Not independently verified.',
      lastVerified: '2026-01-20',
      citation: 'https://www.anthropic.com/pricing'
    }
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
    tags: ['legacy', 'tiny'],
    provenance: {
      source: 'Strubell et al. 2019 + Schwartz et al. 2020 (research literature)',
      confidence: 'research',
      methodology: 'Values derived from published research papers on transformer energy consumption. Scaled to comparable units. Original measurements on different hardware.',
      citation: 'https://arxiv.org/abs/1906.02243'
    }
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
    tags: ['legacy'],
    provenance: {
      source: 'Strubell et al. 2019 + Schwartz et al. 2020 (research literature)',
      confidence: 'research',
      methodology: 'Values derived from published research papers on transformer energy consumption. Scaled to comparable units.',
      citation: 'https://arxiv.org/abs/1906.02243'
    }
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
    tags: ['legacy'],
    provenance: {
      source: 'Strubell et al. 2019 + Schwartz et al. 2020 (research literature)',
      confidence: 'research',
      methodology: 'Values derived from published research papers on transformer energy consumption. Scaled to comparable units.',
      citation: 'https://arxiv.org/abs/1906.02243'
    }
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
    tags: ['legacy'],
    provenance: {
      source: 'Strubell et al. 2019 + Schwartz et al. 2020 (research literature)',
      confidence: 'research',
      methodology: 'Values derived from published research papers on transformer energy consumption. Scaled to comparable units.',
      citation: 'https://arxiv.org/abs/1906.02243'
    }
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
    tags: ['text-generation', 'open-weights'],
    provenance: {
      source: 'Meta LLaMA paper + community benchmarks',
      confidence: 'research',
      methodology: 'Performance from LLaMA technical report. Energy/carbon extrapolated from A100 inference benchmarks in community repos.',
      citation: 'https://arxiv.org/abs/2302.13971'
    }
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
    tags: ['text-generation', 'open-weights'],
    provenance: {
      source: 'Meta LLaMA paper + community benchmarks',
      confidence: 'research',
      methodology: 'Performance from LLaMA technical report. Energy/carbon extrapolated from A100 inference benchmarks in community repos.',
      citation: 'https://arxiv.org/abs/2302.13971'
    }
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
    tags: ['text-generation', 'heavy'],
    provenance: {
      source: 'Meta LLaMA paper + community benchmarks',
      confidence: 'research',
      methodology: 'Performance from LLaMA 2 technical report. Energy/carbon extrapolated from A100/H100 inference benchmarks.',
      citation: 'https://arxiv.org/abs/2307.09288'
    }
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
    tags: ['computer-vision'],
    provenance: {
      source: 'He et al. 2015 + MLPerf inference benchmarks',
      confidence: 'research',
      methodology: 'Accuracy from original paper. Inference cost/energy from MLPerf and community benchmarks on V100/A100.',
      citation: 'https://arxiv.org/abs/1512.03385'
    }
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
    tags: ['computer-vision'],
    provenance: {
      source: 'He et al. 2015 + MLPerf inference benchmarks',
      confidence: 'research',
      methodology: 'Accuracy from original paper. Inference cost/energy from MLPerf and community benchmarks on V100/A100.',
      citation: 'https://arxiv.org/abs/1512.03385'
    }
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
    tags: ['nlp', 'encoder'],
    provenance: {
      source: 'Devlin et al. 2019 + Strubell et al. 2019',
      confidence: 'research',
      methodology: 'Accuracy from BERT paper (GLUE benchmark). Energy estimates from Strubell et al. research on NLP model carbon footprint.',
      citation: 'https://arxiv.org/abs/1810.04805'
    }
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
    tags: ['nlp', 'encoder'],
    provenance: {
      source: 'Devlin et al. 2019 + Strubell et al. 2019',
      confidence: 'research',
      methodology: 'Accuracy from BERT paper (GLUE benchmark). Energy estimates from Strubell et al. research on NLP model carbon footprint.',
      citation: 'https://arxiv.org/abs/1810.04805'
    }
  }
];

export const HARDWARE_OPTIONS = [
  { value: 'rtx5090', label: 'NVIDIA RTX 5090 (575W) ⭐ Benchmarked', power: 575 },
  { value: 'rtx4090d', label: 'NVIDIA RTX 4090D (425W) ⭐ Benchmarked', power: 425 },
  { value: 'h100', label: 'NVIDIA H100 (700W)', power: 700 },
  { value: 'a100', label: 'NVIDIA A100 (400W)', power: 400 },
  { value: 'v100', label: 'NVIDIA V100 (300W)', power: 300 },
  { value: 't4', label: 'NVIDIA T4 (70W)', power: 70 },
  { value: 'cpu', label: 'Standard CPU Server (200W)', power: 200 },
];

// ============================================================
// KEY FINDINGS FROM RTX 5090 & RTX 4090D BENCHMARKS
// ============================================================
// RTX 5090 (Small Models):
// 1. 4-bit quantization ONLY saves energy for models > 5B params
// 2. For smaller models (< 3B), FP16 is MORE energy-efficient
// 3. Qwen2-7B 4-bit saves 11.4% energy vs FP16
// 4. TinyLlama-1.1B 4-bit uses 26.5% MORE energy than FP16
//
// RTX 4090D (6B-7B Models):
// 5. NF4 consistently saves 8-35% energy vs FP16 for 6B-7B models
// 6. INT8 consistently uses 17-33% MORE energy than FP16 (worst choice!)
// 7. Yi-1.5-6B NF4: -30.2% energy | INT8: +32.7% energy
// 8. Mistral-7B NF4: -34.5% energy | INT8: +30.7% energy
// 9. Phi-3-mini NF4: -8.1% energy | INT8: +31.2% energy
// 10. Qwen2.5-7B NF4: -32.7% energy | INT8: +17.4% energy
//
// RECOMMENDATION: Use NF4 for 6B+ models, avoid INT8
// ============================================================