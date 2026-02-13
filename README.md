# ⚡ EcoCompute Dynamic Eval

[![Paper](https://img.shields.io/badge/Paper-Draft-b31b1b.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval)
[![Dashboard](https://img.shields.io/badge/Dashboard-Live-brightgreen.svg)](https://hongping-zh.github.io/ecocompute-dynamic-eval/)
[![Metadata](https://img.shields.io/badge/Metadata-Complete-blue.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)
[![Reproducible](https://img.shields.io/badge/Reproducible-✓-success.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)
[![Measurements](https://img.shields.io/badge/Measurements-23-orange.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata/COMPLETE_DATASET_MEMO.md)
[![Data Quality](https://img.shields.io/badge/CV-<2%25-success.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)

> **Breakthrough Finding**: bitsandbytes INT8 increases energy by 17-33% due to mixed-precision decomposition. Disabling this pathway recovers **+79% throughput** and **−36% energy**, achieving **5.5% energy savings** vs FP16.

Compare AI models by **Accuracy × Cost × Carbon** — RTX 5090 benchmarks reveal that 4-bit quantization wastes energy on small models.

---

## 🏆 Key Discoveries

### 1. bitsandbytes INT8 Paradox
**Default INT8 is the worst choice for energy efficiency** across all tested models.

| Model | Default INT8 vs FP16 | Pure INT8 vs FP16 | Improvement |
|-------|---------------------|-------------------|-------------|
| Yi-1.5-6B | **+32.7%** ⚠️ | **−3.1%** ✅ | **−34.2%** |
| Mistral-7B | **+30.7%** ⚠️ | **−7.9%** ✅ | **−36.9%** |
| **Average** | **+31.7%** ⚠️ | **−5.5%** ✅ | **−35.6%** |

### 2. Root Cause Identified
Mixed-precision decomposition (INT8↔FP16 conversion overhead) is the bottleneck, not INT8 itself.

**Evidence**: Disabling decomposition (`llm_int8_threshold=0.0`) recovers:
- **+79% throughput** on average (Yi: +80.9%, Mistral: +77.8%)
- **−36% energy** on average (Yi: -34.2%, Mistral: -36.9%)

### 3. NF4 Crossover Behavior
Energy savings for models ≥6B, penalty for <5B.

| Model Size | NF4 vs FP16 | Architecture |
|------------|-------------|--------------|
| 1.1B-3B | **+11.7% to +29.4%** ⚠️ | RTX 5090 Blackwell |
| 6B-7B | **−8.1% to −34.5%** ✅ | RTX 4090D Ada Lovelace |

### 4. Practical Solution
Set `llm_int8_threshold=0.0` to avoid 30-35% energy penalty. Validate accuracy separately.

---

## 📊 Research Quality Standards

This benchmark follows rigorous reproducibility standards:

![Data Quality](https://img.shields.io/badge/Data%20Quality-CV%20%3C%202%25-brightgreen?style=for-the-badge)
![Measurements](https://img.shields.io/badge/Measurements-23-blue?style=for-the-badge)
![Reproducible](https://img.shields.io/badge/Reproducible-✓-success?style=for-the-badge)

- ✅ **23 measurements** across 2 GPU architectures (RTX 5090 Blackwell, RTX 4090D Ada Lovelace)
- ✅ **Complete metadata**: Hardware specs, software versions, model commits, quantization configs
- ✅ **High precision**: Coefficient of Variation < 2% (n=10 per configuration)
- ✅ **Causal analysis**: Ablation experiments to isolate root causes
- ✅ **Multi-model validation**: Consistent results across Yi-1.5-6B and Mistral-7B
- ✅ **Open data**: All raw data, scripts, and provenance publicly available

📁 **[View Complete Metadata →](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)**

---

## 🔬 Reproducibility Artifacts

All metadata required to reproduce this research is available in the [`metadata/`](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata) directory:

| File | Description | Size | Status |
|------|-------------|------|--------|
| [`rtx5090_metadata.json`](metadata/rtx5090_metadata.json) | RTX 5090 (Blackwell) complete environment | 8 KB | ✅ |
| [`rtx4090d_metadata.json`](metadata/rtx4090d_metadata.json) | RTX 4090D (Ada Lovelace) complete environment | 9 KB | ✅ |
| [`pure_int8_metadata.json`](metadata/pure_int8_metadata.json) | Pure INT8 ablation experiment (Yi-6B + Mistral-7B) | 13 KB | ✅ |
| [`COMPLETE_DATASET_MEMO.md`](metadata/COMPLETE_DATASET_MEMO.md) | Full dataset documentation (23 measurements) | 45 KB | ✅ |

### What's Included

Each metadata file contains:
- **Hardware specifications**: GPU model, architecture, VRAM, Tensor Cores, TDP
- **Software versions**: PyTorch, CUDA, transformers, bitsandbytes (exact versions)
- **Model versions**: HuggingFace paths and commit hashes
- **Quantization configurations**: Complete code snippets for FP16, NF4, INT8 (default), INT8 (pure)
- **Measurement protocol**: Sampling rate (10 Hz), iterations (n=10), prompts, generation settings
- **Data quality metrics**: Coefficient of Variation, sample size, total duration
- **Known issues**: Documented problems and resolutions

### Reproduction Commands

```bash
# RTX 5090 reproduction
python energy_benchmark.py --gpu rtx5090 --models all --configs fp16,nf4

# RTX 4090D standard reproduction
python energy_benchmark.py --gpu rtx4090d --models all --configs fp16,nf4,int8

# RTX 4090D pure INT8 reproduction
python test_pure_int8.py --model 01-ai/Yi-1.5-6B-Chat
python test_pure_int8_mistral.py --model mistralai/Mistral-7B-Instruct-v0.3
```

---

## 📈 Data Quality

| Metric | Value | Interpretation |
|--------|-------|----------------|
| Total measurements | **23** | 8 RTX 5090 + 12 RTX 4090D + 2 Pure INT8 + 1 Mistral Pure INT8 |
| Coefficient of Variation | **0.3-1.7%** | Excellent reproducibility |
| Sample size per config | **n=10** | Sufficient for statistical power |
| Total benchmark time | **~15 hours** | Comprehensive coverage |
| Cross-model consistency | **±3.5%** | Very high |

---

## 🎯 Impact

This research prevents a potential industry-wide mistake:

### Without This Work
- ❌ Industry conclusion: "INT8 is bad for energy, avoid it"
- ❌ NVIDIA's INT8 Tensor Cores underutilized
- ❌ Missed opportunity for energy savings
- ❌ 30-35% energy waste in production deployments

### With This Work
- ✅ Industry conclusion: "bitsandbytes INT8 is bad due to decomposition; use TensorRT/GPTQ or set threshold=0.0"
- ✅ Correct understanding of INT8's value
- ✅ Energy savings realized in production
- ✅ Clear actionable guidance for practitioners

---

## 🚀 Quick Start

### View Dashboard
Visit the [live dashboard](https://hongping-zh.github.io/ecocompute-dynamic-eval/) to explore interactive visualizations of all benchmark results.

### Explore Metadata
Browse the [`metadata/`](metadata/) directory for complete reproducibility artifacts.

### Run Benchmarks
Clone the repository and follow reproduction commands above.

---

## 📚 Citation

If you use this data or methodology, please cite:

```bibtex
@techreport{zhang2026quantization,
  title={Energy Efficiency of Quantized Large Language Model Inference: 
         Evidence for Quantization Efficiency Paradoxes},
  author={Zhang, Hongping},
  year={2026},
  institution={Independent Research},
  url={https://github.com/hongping-zh/ecocompute-dynamic-eval},
  note={23 measurements across RTX 5090 Blackwell and RTX 4090D Ada Lovelace}
}
```

---

## 🔗 Links

- 📊 **[Live Dashboard](https://hongping-zh.github.io/ecocompute-dynamic-eval/)**: Interactive visualization
- 📄 **[Paper (Draft)](https://github.com/hongping-zh/ecocompute-dynamic-eval)**: Full technical report
- 📁 **[Metadata](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)**: Complete reproducibility artifacts
- 💻 **[Code](https://github.com/hongping-zh/ecocompute-ai)**: Benchmark scripts and raw data

---

## 🤝 Contributing

Contributions are welcome! If you:
- Run benchmarks on additional GPUs (A100, H100, etc.)
- Test alternative quantization methods (GPTQ, TensorRT, llama.cpp)
- Measure accuracy impact of pure INT8
- Find issues or have suggestions

Please open an issue or submit a pull request.

---

## 📧 Contact

- **Author**: Hongping Zhang
- **Email**: zhanghongping1982@gmail.com
- **GitHub**: [@hongping-zh](https://github.com/hongping-zh)

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **AutoDL** for providing GPU cloud infrastructure
- **HuggingFace** for model hosting and transformers library
- **bitsandbytes** team for quantization library (and inspiring this research!)
- **Open source community** for tools and support

---

*"Measure, don't assume. Reproduce, don't trust. Share, don't hoard."*
