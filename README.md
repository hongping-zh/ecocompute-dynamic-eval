# ⚡ EcoCompute Dynamic Eval

[![Paper](https://img.shields.io/badge/Paper-Draft-b31b1b.svg)](TECHNICAL_DOCUMENTATION.md)
[![Dashboard](https://img.shields.io/badge/Dashboard-Live-brightgreen.svg)](https://hongping-zh.github.io/ecocompute-dynamic-eval/)
[![Metadata](https://img.shields.io/badge/Metadata-Complete-blue.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)
[![Reproducible](https://img.shields.io/badge/Reproducible-✓-success.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)
[![Measurements](https://img.shields.io/badge/Measurements-23-orange.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata/COMPLETE_DATASET_MEMO.md)
[![Data Quality](https://img.shields.io/badge/CV-<2%25-success.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)
[![Discussions](https://img.shields.io/github/discussions/hongping-zh/ecocompute-dynamic-eval)](https://github.com/hongping-zh/ecocompute-dynamic-eval/discussions)
[![Issues](https://img.shields.io/github/issues/hongping-zh/ecocompute-dynamic-eval)](https://github.com/hongping-zh/ecocompute-dynamic-eval/issues)
[![Cite](https://img.shields.io/badge/Cite-BibTeX-blue.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/blob/main/CITATION.cff)

> **Breakthrough Finding**: bitsandbytes INT8 increases energy by 17-33% due to mixed-precision decomposition. Disabling this pathway recovers **+79% throughput** and **−36% energy**, achieving **5.5% energy savings** vs FP16.

> **Research Scope**: This work focuses on energy efficiency diagnosis. Accuracy assessment (perplexity, downstream tasks) is not yet complete. The default `threshold=6.0` preserves accuracy but incurs significant performance cost (122-147% energy increase on Ampere/Ada). Pure INT8 (`threshold=0.0`) shows major performance gains, but accuracy impact requires validation. Next steps: PPL and MMLU evaluation—contributions welcome!

Compare AI models by **Accuracy × Cost × Carbon** — RTX 5090 benchmarks reveal that 4-bit quantization wastes energy on small models.

---

## 🚀 Start Here (30 seconds)

- 📊 **[Live Dashboard](https://hongping-zh.github.io/ecocompute-dynamic-eval/)**
- 📄 **[Paper (Draft)](TECHNICAL_DOCUMENTATION.md)**
- 📁 **[Metadata / Raw Data](metadata/)**

**One-line takeaway**: Default bitsandbytes INT8 can be **energy-worse than FP16** because of **mixed-precision decomposition** (INT8↔FP16 conversion overhead), not because INT8 compute is inherently inefficient.

**Key numbers**:
- **Default INT8 vs FP16**: **+17–33% energy** (tested models)
- **Ablation fix**: **+79% throughput** and **−36% energy** (average)
- **Dataset**: **23 measurements**, **n=10** per config, **CV < 2%**, 2 GPU architectures

### Quick Start (10 minutes)

1. **View results**: open the [live dashboard](https://hongping-zh.github.io/ecocompute-dynamic-eval/)
2. **Validate provenance**: inspect [`metadata/`](metadata/) for hardware/software/model commits and protocols
3. **Reproduce figures locally**: use the commands in **Reproducibility Artifacts → Reproduction Commands** (below)

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
- ✅ **Open data**: All raw data, configurations, and provenance publicly available

📁 **[View Complete Metadata →](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)**

---

## 💬 Community & Contributions

### Join the Discussion

We welcome community participation! Join our discussions to:
- 🙋 **Ask questions** about the research methodology or results
- 📊 **Share your benchmark results** on different hardware
- 💡 **Suggest new experiments** or visualizations
- 🤝 **Find collaborators** for extended studies
- 🎓 **Discuss academic topics** related to energy efficiency

[![Join Discussion](https://img.shields.io/badge/Join-Discussion-blue?style=for-the-badge&logo=github)](https://github.com/hongping-zh/ecocompute-dynamic-eval/discussions)

**Quick links**:
- [📣 Announcements](https://github.com/hongping-zh/ecocompute-dynamic-eval/discussions/categories/announcements) - Project updates
- [� Q&A](https://github.com/hongping-zh/ecocompute-dynamic-eval/discussions/categories/q-a) - Ask questions
- [📊 Results Sharing](https://github.com/hongping-zh/ecocompute-dynamic-eval/discussions/categories/results-sharing) - Share your data
- [🤝 Collaboration](https://github.com/hongping-zh/ecocompute-dynamic-eval/discussions/categories/collaboration) - Find partners

### Report Issues or Share Data

Found a bug or have benchmark results to share? Use our Issue templates:

- [🐛 Report a Bug](https://github.com/hongping-zh/ecocompute-dynamic-eval/issues/new?template=bug_report.yml)
- [📊 Share Benchmark Results](https://github.com/hongping-zh/ecocompute-dynamic-eval/issues/new?template=benchmark_result.yml)
- [🙋 Ask a Question](https://github.com/hongping-zh/ecocompute-dynamic-eval/issues/new?template=question.yml)

### We Especially Welcome

- **Hardware coverage**: Measurements on H100, A100, AMD MI300, Intel GPUs
- **Model coverage**: LLaMA-3, Gemma, Qwen, other architectures
- **Batch size studies**: Energy efficiency at different batch sizes
- **Accuracy assessment**: Perplexity and downstream task evaluation for pure INT8

---

## �🔬 Reproducibility Artifacts

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
# Install dependencies
npm install

# Run the dashboard locally (it reads from the dataset bundled in this repo)
npm run dev

# Build a static version (same as GitHub Pages build)
npm run build
```

**Expected outputs**:
- A local dashboard identical in logic to the live site
- Plots/metrics computed from the included dataset and metadata under `metadata/`
- A production build under `dist/`

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

## 🎓 Citation

If you use this dataset or findings in your research, please cite:

[![Cite](https://img.shields.io/badge/Cite-BibTeX-blue.svg?style=for-the-badge)](https://github.com/hongping-zh/ecocompute-dynamic-eval/blob/main/CITATION.cff)

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

GitHub will also display a **"Cite this repository"** button using our [CITATION.cff](CITATION.cff) file.

---

## 🔗 Links

- 📊 **[Live Dashboard](https://hongping-zh.github.io/ecocompute-dynamic-eval/)**: Interactive visualization
- 📄 **[Paper (Draft)](TECHNICAL_DOCUMENTATION.md)**: Full technical report
- 📁 **[Metadata](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)**: Complete reproducibility artifacts

---

## 🤝 Contributing

Contributions are welcome! Please see the [Community & Contributions](#-community--contributions) section above for:
- How to join discussions
- Issue templates for bug reports and data sharing
- Areas where we especially need help

For code contributions, please open a pull request with a clear description of your changes.

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
