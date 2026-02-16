# EcoCompute OpenClaw Skill — Usage Manual

> **Version**: 1.0 · **Author**: Hongping Zhang · **Last Updated**: 2026-02-16

The EcoCompute Skill transforms your AI agent into an **LLM energy efficiency expert**, equipped with 93+ empirical measurements across 3 NVIDIA GPU architectures. It prevents common energy waste patterns that even experienced engineers miss.

---

## Table of Contents

1. [Installation](#1-installation)
2. [Quick Start (2 Minutes)](#2-quick-start)
3. [The 5 Protocols](#3-the-5-protocols)
   - [OPTIMIZE — Deployment Recommendation](#31-optimize)
   - [DIAGNOSE — Performance Troubleshooting](#32-diagnose)
   - [COMPARE — Quantization Comparison](#33-compare)
   - [ESTIMATE — Cost & Carbon Calculator](#34-estimate)
   - [AUDIT — Configuration Review](#35-audit)
4. [Example Conversations](#4-example-conversations)
5. [What Makes This Skill Unique](#5-what-makes-this-skill-unique)
6. [Reference Data Overview](#6-reference-data-overview)
7. [FAQ](#7-faq)
8. [Troubleshooting](#8-troubleshooting)
9. [Contributing](#9-contributing)

---

## 1. Installation

### Option A: Via `npx skills` (Recommended)

```bash
npx skills add hongping-zh/ecocompute-dynamic-eval --skill ecocompute
```

This installs the skill into your agent's workspace automatically.

### Option B: Via ClawHub (Coming Soon)

Search for `ecocompute` on [ClawHub](https://clawhub.com) and install with one click.

### Option C: Manual Installation

```bash
# Clone the repository
git clone https://github.com/hongping-zh/ecocompute-dynamic-eval.git

# Copy the skill to your OpenClaw workspace
cp -r ecocompute-dynamic-eval/skills/ecocompute ~/.openclaw/workspace/skills/
```

### Verify Installation

After installation, your skill directory should look like:

```
~/.openclaw/workspace/skills/ecocompute/
├── SKILL.md
└── references/
    ├── hardware_profiles.md
    ├── paradox_data.md
    ├── batch_size_guide.md
    └── quantization_guide.md
```

Send any energy-related question to your agent to confirm the skill is active.

---

## 2. Quick Start

Once installed, just talk to your agent naturally. The skill activates automatically when you discuss LLM deployment, quantization, energy, or inference optimization.

### Try These First

| Say This | Skill Does This |
|----------|----------------|
| "I want to deploy Mistral-7B on an A800" | → **OPTIMIZE**: recommends precision, batch size, estimates energy |
| "My INT8 model is slower than FP16, why?" | → **DIAGNOSE**: identifies the bitsandbytes INT8 paradox |
| "Compare FP16 vs NF4 vs INT8 for Yi-6B" | → **COMPARE**: data-driven table with clear recommendation |
| "How much will 1M requests/month cost?" | → **ESTIMATE**: energy, dollar cost, and carbon footprint |
| "Review my inference code for energy waste" | → **AUDIT**: scans for known anti-patterns |

---

## 3. The 5 Protocols

### 3.1 OPTIMIZE

**When to use**: You're planning a new deployment and want the most energy-efficient configuration.

**What to provide**:
- Model name and size (e.g., "Mistral-7B", "Qwen2-1.5B")
- GPU (e.g., "RTX 4090D", "A800", "H100")
- Use case (e.g., "production API", "batch processing", "interactive chat")

**What you get**:
- Recommended precision (FP16 / NF4 / Pure INT8)
- Recommended batch size
- Expected throughput, energy, cost, and carbon estimates
- Warnings about potential paradoxes

**Example prompt**:
```
I'm deploying Mistral-7B-Instruct on NVIDIA A800 for a production API 
serving ~500K requests/month. What's the most energy-efficient setup?
```

**Example output** (summarized):
```
## Recommended Configuration
- Precision: FP16 (A800 has 80GB — no memory pressure)
- Batch size: 16–32 (use vLLM continuous batching)
- Expected: ~284 tok/s (BS=16), 0.98 J/request
- Monthly: ~490 kWh, $20, 272 kgCO2

## Warning
Do NOT use load_in_8bit=True on A800 — it increases energy by 122–147%.
If you must use INT8, set llm_int8_threshold=0.0.
```

---

### 3.2 DIAGNOSE

**When to use**: Something seems wrong — slow inference, high power draw, unexpectedly high costs.

**What to provide**:
- Current configuration (model, GPU, precision, batch size)
- Observed symptoms (throughput, power, latency)

**What you get**:
- Pattern match against 3 known paradoxes
- Root cause analysis with evidence
- Fix with code snippet and expected improvement

**Example prompt**:
```
I'm running Yi-1.5-6B with load_in_8bit=True on RTX 4090D. 
Getting only 8.4 tok/s — FP16 was 34.7 tok/s. What's wrong?
```

**Example output** (summarized):
```
## Diagnosis: INT8 Energy Paradox (HIGH confidence)

Your throughput matches the known pattern exactly:
- Expected with default INT8: 8.42 tok/s ← matches your 8.4 tok/s
- FP16 baseline: 34.72 tok/s ← matches your 34.7 tok/s

Root cause: bitsandbytes mixed-precision decomposition (threshold=6.0)
causes INT8↔FP16 type conversion at every linear layer.

## Fix (one line)
quantization_config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=0.0,  # ← Add this
)

## Expected improvement
- Throughput: 8.4 → ~15.5 tok/s (+84%)
- Energy: 6,258 → ~4,568 J/1k tok (−27%)
```

---

### 3.3 COMPARE

**When to use**: You're choosing between precision formats and want a data-driven comparison.

**What to provide**:
- Model name
- GPU (optional — skill will use closest match)
- Methods to compare (or "compare all")

**What you get**:
- Side-by-side table with throughput, energy, memory, Δ vs FP16
- Clear recommendation with reasoning
- Paradox warnings

**Example prompt**:
```
Compare all quantization options for Mistral-7B on RTX 4090D.
```

---

### 3.4 ESTIMATE

**When to use**: You need to budget for energy costs or report carbon emissions.

**What to provide**:
- Model, GPU, precision, batch size
- Request volume (per day or per month)
- Region (optional — for electricity price and carbon intensity)

**What you get**:
- Monthly energy (kWh), cost ($), and carbon (kgCO2)
- Comparison: current config vs optimized config
- Savings if you apply recommended changes

**Example prompt**:
```
Estimate monthly costs for serving Mistral-7B Pure INT8 on A800, 
batch size 1, 200K requests/month, hosted in China.
```

---

### 3.5 AUDIT

**When to use**: You have existing inference code and want to check for energy waste.

**What to provide**:
- Your Python inference code (paste it into the chat)
- Or describe your setup

**What you get**:
- 🔴 Critical issues (>30% energy waste)
- 🟡 Warnings (10–30% waste)
- ✅ Good practices
- Prioritized fix list with code snippets

**Example prompt**:
```
Audit this code for energy efficiency:

model = AutoModelForCausalLM.from_pretrained(
    "mistralai/Mistral-7B-Instruct-v0.2",
    load_in_8bit=True,
)
# Running single requests in a loop
for prompt in prompts:
    output = model.generate(tokenizer(prompt, return_tensors="pt").to("cuda"))
```

**Example output** (summarized):
```
## 🔴 Critical Issues

1. Default INT8 (no threshold override)
   Energy penalty: +17–147% vs FP16
   Fix: Add llm_int8_threshold=0.0

2. Sequential single-request processing (BS=1)
   Energy waste: up to 95.7% vs batched
   Fix: Batch prompts or use vLLM

## Recommended Changes (priority order)
1. Add BitsAndBytesConfig with llm_int8_threshold=0.0
2. Batch prompts: tokenizer(prompts, padding=True)
3. Consider FP16 if VRAM permits (simplest, no quant overhead)
```

---

## 4. Example Conversations

### Conversation 1: New Project Planning

> **You**: I'm building a chatbot using Qwen2-1.5B on an RTX 5090. Should I use NF4 to save energy?
>
> **Agent** (with EcoCompute): No — NF4 would waste **29% more energy** on Qwen2-1.5B. At 1.5B parameters, the model fits easily in VRAM at FP16. The de-quantization overhead dominates any memory savings. **Use FP16.**

### Conversation 2: Production Optimization

> **You**: We're serving 2M requests/month on A800 with Mistral-7B, batch size 1. Our energy bill is $300/month. Can we do better?
>
> **Agent**: Absolutely. Switching from BS=1 to BS=32 would reduce your energy bill from **$300 → ~$15/month** (−95%). That's a saving of **$3,420/year** and **24,864 kgCO2/year**. Use vLLM for automatic continuous batching.

### Conversation 3: Debugging

> **You**: I switched to INT8 to save memory but inference got 4× slower.
>
> **Agent**: This is the **bitsandbytes INT8 Energy Paradox**. Default `load_in_8bit=True` uses mixed-precision decomposition that causes 72–76% throughput loss. Add one line: `llm_int8_threshold=0.0`. This will recover +79–98% of your lost throughput.

---

## 5. What Makes This Skill Unique

| Feature | General AI Agent | Agent + EcoCompute Skill |
|---------|-----------------|-------------------------|
| "Should I use INT8?" | "Yes, it saves memory and energy" ❌ | "Default INT8 wastes 17–147% energy. Use threshold=0.0" ✅ |
| "NF4 for my 1.5B model?" | "Yes, 4-bit saves memory" ❌ | "No — 29% energy penalty. Use FP16 for ≤3B" ✅ |
| "Best batch size?" | Generic advice | "BS=8 saves 87.5%, here's the exact data for your GPU" ✅ |
| Data backing | Training data (potentially outdated) | **93+ real measurements**, CV < 2%, 3 GPU architectures ✅ |

**Core advantage**: This skill contains **empirical findings that contradict conventional wisdom**. Without it, AI agents will give well-intentioned but wrong advice about LLM energy efficiency.

---

## 6. Reference Data Overview

The skill includes 4 reference files with complete measurement data:

| File | Contents | Key Data Points |
|------|----------|----------------|
| `hardware_profiles.md` | GPU specs, measurement protocol, grid/cost tables | 3 GPUs, NVML 10Hz, 6 regions |
| `paradox_data.md` | All 3 paradox datasets with full tables | 23+ configs, Δ vs FP16 |
| `batch_size_guide.md` | BS 1–64 sweep, scaling law, cost examples | 7 batch sizes, code examples |
| `quantization_guide.md` | Decision tree, ranking tables, common mistakes | 4 quant methods, 3 model sizes |

**Total**: ~93+ measurements, n=10 per config, CV < 2%.

---

## 7. FAQ

### Q: Does this skill work with Claude, GPT, Gemini, or just OpenClaw?
**A**: The skill follows the Anthropic Agent Skills open standard, supported by 27+ platforms including Claude Code, Cursor, GitHub Copilot, Gemini CLI, and OpenAI Codex. OpenClaw is just one host.

### Q: What if my GPU isn't listed (e.g., H100, MI300X)?
**A**: The skill will extrapolate from the closest architecture. Ampere data (A800) applies to A100/H100 family. For unlisted GPUs, the skill recommends running a quick benchmark using our measurement protocol.

### Q: Is accuracy affected by Pure INT8 (threshold=0.0)?
**A**: This research focuses on energy efficiency. Accuracy assessment (PPL, MMLU) for Pure INT8 is pending. The skill will flag this caveat when recommending Pure INT8. If accuracy is critical, use FP16 or validate with your specific task.

### Q: How often is the data updated?
**A**: The skill is versioned with the main repository. New measurements (more GPUs, models, batch sizes) are added as they become available. Check the [GitHub repo](https://github.com/hongping-zh/ecocompute-dynamic-eval) for the latest data.

### Q: Can I contribute my own measurements?
**A**: Yes! Submit your benchmark results via [GitHub Issue template](https://github.com/hongping-zh/ecocompute-dynamic-eval/issues/new?template=benchmark_result.yml). Verified data will be incorporated into future skill updates.

---

## 8. Troubleshooting

### Skill not activating
- Verify files exist in `~/.openclaw/workspace/skills/ecocompute/`
- Check that `SKILL.md` is present (this is the entry point)
- Try explicitly asking: "Use the EcoCompute skill to analyze my deployment"

### Agent gives generic advice instead of data-backed recommendations
- The agent may not have loaded the reference files. Try: "Check the EcoCompute reference data for [specific question]"
- Ensure all 4 files in `references/` are present

### Data seems outdated
- Pull the latest version: `npx skills add hongping-zh/ecocompute-dynamic-eval --skill ecocompute`
- Or manually update from GitHub

---

## 9. Contributing

We welcome contributions to make this skill more comprehensive:

- **New GPU data**: H100, A100, AMD MI300X, Intel Gaudi measurements
- **New model data**: LLaMA-3, Gemma-2, DeepSeek-V3, Qwen2.5-72B
- **Accuracy data**: PPL and MMLU for Pure INT8 configurations
- **Batch size data**: Extended sweeps on different hardware

**How to contribute**:
1. Fork the [repository](https://github.com/hongping-zh/ecocompute-dynamic-eval)
2. Add your measurements following the existing format in `metadata/`
3. Update the relevant `references/` files
4. Submit a PR

---

## Links

- **Live Dashboard**: https://hongping-zh.github.io/ecocompute-dynamic-eval/
- **GitHub Repository**: https://github.com/hongping-zh/ecocompute-dynamic-eval
- **Paper (Draft)**: https://github.com/hongping-zh/ecocompute-dynamic-eval/blob/main/TECHNICAL_DOCUMENTATION.md
- **bitsandbytes Issue #1867**: https://github.com/bitsandbytes-foundation/bitsandbytes/issues/1867
- **bitsandbytes Issue #1851**: https://github.com/bitsandbytes-foundation/bitsandbytes/issues/1851

---

*"Measure, don't assume. Reproduce, don't trust. Share, don't hoard."*

**Hongping Zhang** · Independent Researcher · zhanghongping1982@gmail.com
