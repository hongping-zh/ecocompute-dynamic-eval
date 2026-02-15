# ⚡ EcoCompute Dynamic Eval

[![Paper](https://img.shields.io/badge/Paper-Draft-b31b1b.svg)](TECHNICAL_DOCUMENTATION.md)
[![Dashboard](https://img.shields.io/badge/Dashboard-Live-brightgreen.svg)](https://hongping-zh.github.io/ecocompute-dynamic-eval/)
[![Metadata](https://img.shields.io/badge/Metadata-Complete-blue.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)
[![Reproducible](https://img.shields.io/badge/Reproducible-✓-success.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)
[![Measurements](https://img.shields.io/badge/Measurements-93%2B-orange.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata/COMPLETE_DATASET_MEMO.md)
[![Batch Size](https://img.shields.io/badge/Batch_Size-A800_Sweep-ff6600.svg)](https://hongping-zh.github.io/ecocompute-dynamic-eval/?view=BATCH_SIZE)
[![bitsandbytes](https://img.shields.io/badge/bitsandbytes-Issue_%231867-purple.svg)](https://github.com/bitsandbytes-foundation/bitsandbytes/issues/1867)
[![Data Quality](https://img.shields.io/badge/CV-<2%25-success.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/tree/main/metadata)
[![Discussions](https://img.shields.io/github/discussions/hongping-zh/ecocompute-dynamic-eval)](https://github.com/hongping-zh/ecocompute-dynamic-eval/discussions)
[![Issues](https://img.shields.io/github/issues/hongping-zh/ecocompute-dynamic-eval)](https://github.com/hongping-zh/ecocompute-dynamic-eval/issues)
[![Cite](https://img.shields.io/badge/Cite-BibTeX-blue.svg)](https://github.com/hongping-zh/ecocompute-dynamic-eval/blob/main/CITATION.cff)

> **Breakthrough Finding**: bitsandbytes INT8 increases energy by **17–147%** due to mixed-precision decomposition. Disabling this pathway recovers **+79–98% throughput** and **−35–41% energy** across consumer (RTX 4090D) and datacenter (A800) GPUs.

> **NEW — Batch Size Optimization**: A800 sweep (BS 1→64) shows **95.7% energy reduction** and **55.5× throughput scaling**. [**View Interactive Results →**](https://hongping-zh.github.io/ecocompute-dynamic-eval/?view=BATCH_SIZE)

> **Research Scope**: This work focuses on energy efficiency diagnosis. Accuracy assessment (perplexity, downstream tasks) is not yet complete. Pure INT8 (`threshold=0.0`) shows major performance gains, but accuracy impact requires validation. Next steps: PPL and MMLU evaluation—contributions welcome!

Compare AI models by **Accuracy × Cost × Carbon** across **3 GPU architectures** (RTX 5090, RTX 4090D, A800) — revealing that 4-bit quantization wastes energy on small models.

---

## 🚀 Start Here (30 seconds)

- 📊 **[Live Dashboard](https://hongping-zh.github.io/ecocompute-dynamic-eval/)**
- 📄 **[Paper (Draft)](TECHNICAL_DOCUMENTATION.md)**
- 📁 **[Metadata / Raw Data](metadata/)**

**One-line takeaway**: Default bitsandbytes INT8 can be **energy-worse than FP16** because of **mixed-precision decomposition** (INT8↔FP16 conversion overhead), not because INT8 compute is inherently inefficient.

**Key numbers**:
- **Default INT8 vs FP16**: **+17–33% energy** (tested models)
- **Ablation fix**: **+79% throughput** and **−36% energy** (average)
- **Batch size**: BS=1→64 on A800 shows **95.7% energy reduction** (55.5× throughput)
- **Dataset**: **93+ measurements**, **n=10** per config, **CV < 2%**, 3 GPU architectures

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

### 4. Batch Size Scaling Law (A800)
Energy per request follows an inverse relationship with batch size:

| Batch Size | Throughput (tok/s) | Energy (J/req) | Δ vs BS=1 |
|-----------|-------------------|----------------|----------|
| 1 | 18.09 | 14.16 | — |
| 8 | 144.32 | 1.77 | **−87.5%** |
| 64 | 1,003.50 | 0.61 | **−95.7%** |

**Key insight**: BS=1 wastes ~55% GPU capacity. Batching is the single largest energy optimization lever.

### 5. Practical Solution
Set `llm_int8_threshold=0.0` to avoid 30-35% energy penalty. Use batch sizes ≥8 for production. Validate accuracy separately.

---

## 🔬 Experimental Setup

### Hardware Platforms

| Platform | Architecture | VRAM | Tensor Cores | TDP | Use Case |
|----------|-------------|------|--------------|-----|----------|
| **NVIDIA RTX 5090** | Blackwell (SM 120) | 32 GB GDDR7 | 5th Gen | 575W | Consumer flagship |
| **NVIDIA RTX 4090D** | Ada Lovelace (SM 89) | 24 GB GDDR6X | 4th Gen | 425W | Consumer high-end |
| **NVIDIA A800** | Ampere (SM 80) | 80 GB HBM2e | 3rd Gen | 400W | Datacenter |

### Software Environment

| Component | RTX 5090 | RTX 4090D | A800 |
|-----------|----------|-----------|------|
| **Python** | 3.10 | 3.10 | 3.10 |
| **PyTorch** | 2.6.0 | 2.4.1 | 2.4.1 |
| **CUDA** | 12.6 | 12.1 | 12.1 |
| **transformers** | 4.48.0 | 4.47.0 | 4.47.0 |
| **bitsandbytes** | 0.45.3 | 0.45.0 | 0.45.0 |
| **Driver** | 570.86.15 | 560.35.03 | 535.183.01 |

### Models Tested

| Model | Parameters | Architectures | HuggingFace Path |
|-------|-----------|---------------|-------------------|
| Qwen2-1.5B | 1.5B | Qwen2 | `Qwen/Qwen2-1.5B-Instruct` |
| Phi-3-mini | 3.8B | Phi-3 | `microsoft/Phi-3-mini-4k-instruct` |
| Yi-1.5-6B | 6B | Yi | `01-ai/Yi-1.5-6B-Chat` |
| Mistral-7B | 7B | Mistral | `mistralai/Mistral-7B-Instruct-v0.2` |
| Qwen2.5-7B | 7B | Qwen2.5 | `Qwen/Qwen2.5-7B-Instruct` |

### Energy Measurement Methodology

```
Method:     NVIDIA Management Library (NVML) via pynvml
Frequency:  10 Hz (100ms polling interval)
Metric:     GPU board power (watts), excluding CPU/DRAM
Idle power: Subtracted per-GPU (RTX 5090: ~22W, RTX 4090D: ~17W, A800: ~65W)
Duration:   Full inference run per sample (256 output tokens)
```

**Protocol per configuration**:
1. Load model with specified quantization config
2. **3 warmup runs** (discarded) to stabilize GPU clocks and caches
3. **30-second thermal stabilization** between model loads
4. **10 measured runs** with continuous NVML power sampling
5. Record: throughput (tok/s), average power (W), energy per 1k tokens (J)
6. Compute: mean, std, CV for each metric

**Quality gates**: CV < 2% (throughput), CV < 5% (power). Configurations exceeding these thresholds were re-run.

**Generation settings**: Greedy decoding (`do_sample=False`), `max_new_tokens=256`, fixed prompt across all runs.

---

## 🧠 Deep Analysis: Why These Paradoxes Occur

### Why NF4 Wastes Energy on Small Models (<5B)

We propose a **de-quantization tax** model:

```
E_total = E_compute + E_memory + E_dequant
```

**For small models** (≤3B parameters):
- Model weights fit comfortably in GPU cache/VRAM even at FP16
- Memory bandwidth is **not** the bottleneck
- NF4 adds a de-quantization step at every linear layer (NF4 → FP16 conversion)
- This extra compute **dominates** the small memory savings
- Result: **11–29% energy penalty** on RTX 5090

**For larger models** (≥6B parameters):
- FP16 weights strain memory bandwidth
- NF4 reduces memory traffic by ~4×
- Memory savings **dominate** de-quantization overhead
- Result: **8–35% energy savings** on RTX 4090D

**Numerical verification** (Qwen2-1.5B on RTX 5090):
```
E_ratio = (T_NF4 / T_FP16) × (P_NF4 / P_FP16)
        = (1000/41.57) / (1000/71.45) × (129.83 / 172.30)
        ≈ 1.72 × 0.75 ≈ 1.29  (≈ +29%)
```
This matches the empirical **+29.4%** energy penalty, confirming throughput degradation dominates power reduction.

### Why bitsandbytes INT8 Wastes Energy

The `LLM.int8()` algorithm (Dettmers et al., 2022) performs **outlier-aware mixed-precision decomposition**:

1. For each linear layer, features with magnitude > threshold (default: 6.0) are classified as "outliers"
2. Outlier features extracted and computed in **FP16**
3. Remaining features computed in **INT8**
4. Results merged back

This creates **continuous INT8↔FP16 type conversion** at every linear layer, causing:
- **72–76% throughput loss** vs FP16
- **+17–147% energy increase** (throughput penalty dominates power savings)

**Ablation proof**: Setting `llm_int8_threshold=0.0` (disabling decomposition) recovers +79–98% throughput and −35–41% energy. The energy penalty is **entirely** attributable to the type conversion pathway.

### Why Batch Size Has Such a Large Impact

At BS=1, the GPU spends most time on:
- Kernel launch overhead
- Memory latency (not bandwidth-bound)
- Idle cycles between operations

At BS≥8, operations become **compute-bound**:
- GPU Tensor Cores are fully utilized
- Fixed overhead (kernel launches, memory latency) is amortized across requests
- Energy per request drops by **85–96%**

This follows an approximate inverse relationship: `Energy/request ∝ 1/BS` (verified on A800 with Mistral-7B Pure INT8).

---

## � Future Work & Roadmap

### Near-term (Q1 2026)
- [ ] **Accuracy assessment**: Perplexity (PPL) and MMLU evaluation for Pure INT8 vs Default INT8 vs FP16
- [ ] **Statistical testing**: Welch's t-test and confidence intervals for all comparisons
- [ ] **LaTeX paper**: Convert to NeurIPS/ICML format for arXiv submission
- [ ] **Extended batch size sweep**: BS=1–128 on A800 with multiple models

### Medium-term (Q2–Q3 2026)
- [ ] **More hardware**: H100, A100, AMD MI300X, Intel Gaudi
- [ ] **More quantization methods**: GPTQ, AWQ, GGUF, TensorRT-LLM
- [ ] **More models**: LLaMA-3, Gemma-2, DeepSeek-V3, Qwen2.5-72B
- [ ] **Prefill vs Decode**: Separate energy measurement for prompt processing vs token generation
- [ ] **Multi-GPU**: Tensor parallelism energy overhead measurement

### Long-term Vision
- [ ] **EcoCompute Benchmark Suite**: Standardized energy benchmark like MLPerf but focused on energy efficiency
- [ ] **Hugging Face Dataset**: Publish measurements as a HF dataset for community access
- [ ] **CI/CD energy tracking**: GitHub Action for automatic energy regression testing
- [ ] **Carbon-aware scheduling**: Optimize inference scheduling based on grid carbon intensity

---

## �📊 Research Quality Standards

This benchmark follows rigorous reproducibility standards:

![Data Quality](https://img.shields.io/badge/Data%20Quality-CV%20%3C%202%25-brightgreen?style=for-the-badge)
![Measurements](https://img.shields.io/badge/Measurements-93%2B-blue?style=for-the-badge)
![Reproducible](https://img.shields.io/badge/Reproducible-✓-success?style=for-the-badge)

- ✅ **93+ measurements** across 3 GPU architectures (RTX 5090 Blackwell, RTX 4090D Ada Lovelace, A800 Ampere)
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
| [`a800_metadata.json`](metadata/a800_metadata.json) | A800 (Ampere) complete environment | 10 KB | ✅ |
| [`batch_size_experiment/`](metadata/batch_size_experiment/) | A800 batch size sweep (BS 1–64, 70 measurements) | 467 KB | ✅ |
| [`COMPLETE_DATASET_MEMO.md`](metadata/COMPLETE_DATASET_MEMO.md) | Full dataset documentation (93+ measurements) | 45 KB | ✅ |

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
| Total measurements | **93+** | 8 RTX 5090 + 12 RTX 4090D + 3 Pure INT8 + 70 A800 Batch Size |
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
  note={93+ measurements across RTX 5090 Blackwell, RTX 4090D Ada Lovelace, and A800 Ampere}
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
