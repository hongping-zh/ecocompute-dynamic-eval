# A800 Batch Size Experiment Data

## Overview

This directory contains raw data from the **batch size sweep experiment** on NVIDIA A800 (Ampere) with Mistral-7B Pure INT8 (`llm_int8_threshold=0.0`).

- **GPU**: NVIDIA A800 80GB HBM2e (Ampere, SM 80)
- **Model**: Mistral-7B-Instruct-v0.3 (Pure INT8)
- **Batch sizes**: 1, 2, 4, 8, 16, 32, 64
- **Runs per config**: 10
- **Total measurements**: 70
- **Date**: 2026-02-15

## Files

| File | Description |
|------|-------------|
| `a800_mistral7b_pure_int8_batch_size_metadata_*.json` | Experiment metadata (hardware, software, configs) |
| `a800_mistral7b_pure_int8_batch_size_raw_*.csv` | Raw per-run measurements (70 rows: 7 BS × 10 runs) |
| `a800_mistral7b_pure_int8_batch_size_summary_*.csv` | Aggregated summary statistics per batch size |
| `batch_size_results_*.png` | Visualization of results |

## Key Results

| Batch Size | Throughput (tok/s) | Energy/Request (J) | GPU Util (%) | Δ Energy vs BS=1 |
|-----------|-------------------|-------------------|-------------|-----------------|
| 1 | 18.09 | 14.16 | 45% | — |
| 2 | 36.48 | 7.57 | 58% | −46.5% |
| 4 | 72.96 | 3.79 | 72% | −73.3% |
| 8 | 144.32 | 1.77 | 85% | −87.5% |
| 16 | 283.71 | 0.98 | 92% | −93.1% |
| 32 | 548.20 | 0.72 | 95% | −94.9% |
| 64 | 1,003.50 | 0.61 | 97% | −95.7% |

## Data Quality

- Throughput CV: < 1% across all batch sizes
- Power CV: < 3% across all batch sizes
- Measurement protocol: 3 warmup + 10 measured runs, 30s thermal stabilization

## Interactive Dashboard

View these results interactively: [**Batch Size Analysis →**](https://hongping-zh.github.io/ecocompute-dynamic-eval/?view=BATCH_SIZE)

## Citation

```bibtex
@techreport{zhang2026quantization,
  title={Energy Efficiency of Quantized Large Language Model Inference},
  author={Zhang, Hongping},
  year={2026},
  url={https://github.com/hongping-zh/ecocompute-dynamic-eval}
}
```
