# 📁 EcoCompute Metadata & Raw Data

Complete reproducibility artifacts for the energy efficiency research.

## Directory Structure

```
metadata/
├── README.md                          ← You are here
├── COMPLETE_DATASET_MEMO.md           ← Full dataset documentation (93+ measurements)
├── rtx5090_metadata.json              ← RTX 5090 Blackwell environment & results
├── rtx4090d_metadata.json             ← RTX 4090D Ada Lovelace environment & results
├── pure_int8_metadata.json            ← Pure INT8 ablation (Yi-6B + Mistral-7B on RTX 4090D)
├── a800_metadata.json                 ← A800 Ampere environment & results
└── batch_size_experiment/             ← A800 batch size sweep (BS 1–64)
    ├── README.md                      ← Experiment details & key results
    ├── *_metadata_*.json              ← Experiment configuration
    ├── *_raw_*.csv                    ← Raw per-run measurements (70 rows)
    ├── *_summary_*.csv                ← Aggregated statistics per batch size
    └── *_results_*.png                ← Result visualization
```

## Data Coverage

| GPU | Architecture | Experiments | Measurements | Config Types |
|-----|-------------|-------------|-------------|--------------|
| RTX 5090 | Blackwell | NF4 crossover | 8 | FP16, NF4 |
| RTX 4090D | Ada Lovelace | INT8 paradox + ablation | 15 | FP16, NF4, INT8, Pure INT8 |
| A800 | Ampere | Batch size sweep | 70 | Pure INT8 × 7 batch sizes |
| **Total** | **3 architectures** | **4 experiments** | **93+** | **5 config types** |

## What Each Metadata File Contains

- **Hardware**: GPU model, architecture, VRAM, Tensor Cores, TDP
- **Software**: Python, PyTorch, CUDA, transformers, bitsandbytes (exact versions)
- **Models**: HuggingFace paths and commit hashes
- **Quantization configs**: Complete code snippets for each precision
- **Protocol**: Sampling rate (10 Hz), iterations (n=10), warmup, prompts
- **Quality metrics**: CV, sample size, duration
- **Known issues**: Documented problems and resolutions

## Measurement Methodology

```
Tool:       NVIDIA Management Library (NVML) via pynvml
Frequency:  10 Hz (100ms polling)
Metric:     GPU board power (watts)
Protocol:   3 warmup + 10 measured runs + 30s thermal stabilization
Quality:    CV < 2% (throughput), CV < 5% (power)
Generation: Greedy decoding, max_new_tokens=256, fixed prompt
```

## Interactive Dashboard

All data is visualized in the interactive dashboard:
- **[Leaderboard](https://hongping-zh.github.io/ecocompute-dynamic-eval/)** — Compare all models
- **[Batch Size Analysis](https://hongping-zh.github.io/ecocompute-dynamic-eval/?view=BATCH_SIZE)** — A800 sweep results

## License

MIT License — See [LICENSE](../LICENSE) for details.
