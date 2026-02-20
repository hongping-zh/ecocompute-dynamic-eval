# EcoCompute Energy Audit — GitHub Action v2.0

> Auto-audit your CI/CD pipeline for LLM energy waste. Based on 93+ real GPU measurements.
> **v2.0**: Hardware detection, baseline calibration, relative change reporting, cross-architecture estimation.

## Quick Start

Add this to your repository at `.github/workflows/energy-audit.yml`:

```yaml
name: EcoCompute Energy Audit

on:
  pull_request:
    paths: ['**.py']

permissions:
  contents: read
  pull-requests: write

jobs:
  energy-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Restore baseline
        uses: actions/cache@v4
        with:
          path: .ecocompute
          key: ecocompute-baseline-${{ runner.os }}

      - name: EcoCompute Energy Audit
        uses: hongping-zh/ecocompute-dynamic-eval/action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

Next time a PR touches Python files, the Action scans for energy waste patterns, compares against the baseline, and posts a comment.

## What It Does

### 4-Phase Pipeline

```
[1/4] Hardware Detection → GPU model, driver, CUDA, architecture matching
[2/4] Calibration        → Optional GPU benchmark for energy baseline
[3/4] Code Analysis      → 6 static rules scan PR diff for waste patterns
[4/4] Relative Change    → Compare against cached baseline → pass/fail
```

### Detection Rules

| # | Pattern | Severity | Energy Impact |
|---|---------|----------|---------------|
| 1 | Default INT8 (`load_in_8bit` without threshold fix) | 🔴 Critical | +17–147% |
| 2 | Mixed precision conflicts (INT8 + NF4) | 🔴 Critical | Unpredictable |
| 3 | NF4 on small models (≤3B) | 🟡 Warning | +11–29% |
| 4 | Sequential BS=1 processing | 🟡 Warning | Up to 95.7% waste |
| 5 | Missing `device_map` | 🟠 Info | Potential waste |
| 6 | Redundant quantization params | 🟠 Info | Code quality |

All rules are derived from the [EcoCompute OpenClaw Skill](https://clawhub.ai/hongping-zh/ecocompute) AUDIT protocol and backed by [93+ empirical measurements](https://github.com/hongping-zh/ecocompute-dynamic-eval).

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `github-token` | No | `${{ github.token }}` | Token for posting PR comments |
| `severity-threshold` | No | `warning` | Minimum severity: `critical`, `warning`, or `info` |
| `post-comment` | No | `true` | Post results as PR comment |
| `calibrate` | No | `false` | Run GPU benchmark for energy baseline (requires GPU runner) |
| `energy-threshold` | No | `5` | Max energy regression % before CI fails |
| `baseline-path` | No | `.ecocompute/baseline.json` | Path to store/load baseline |

## Outputs

| Output | Description |
|--------|-------------|
| `issues-found` | Total number of issues found |
| `critical-count` | Number of critical issues |
| `warning-count` | Number of warnings |
| `passed` | Whether the audit passed (no regressions beyond threshold) |
| `hardware-hash` | Hardware fingerprint for cache isolation |
| `report` | Path to full audit report (Markdown) |

## Key Features (v2.0)

### 1. Hardware Detection

Automatically detects GPU model, driver, CUDA version via `nvidia-smi`. Maps to known architecture profiles (Blackwell, Ada, Ampere, Hopper, Turing, Volta) for accurate energy estimation.

If no GPU is detected, the Action degrades gracefully to static analysis + estimation.

### 2. Baseline Calibration

On GPU runners, enable `calibrate: true` to run a lightweight FP16 matrix benchmark:
- Measures TFLOPS and power draw
- Computes energy/TFLOP as a hardware-normalized metric
- Stored as baseline for future comparisons (cached via `actions/cache`)

```yaml
- uses: hongping-zh/ecocompute-dynamic-eval/action@main
  with:
    calibrate: 'true'
```

### 3. Relative Change Reporting

Compares each run against the cached baseline:
- **Issue count change**: New issues introduced vs fixed
- **Energy regression**: Benchmark score degradation (if calibrated)
- **Pass/Fail**: CI fails if critical issues increase or energy regresses beyond threshold
- **Hardware change detection**: Warns if runner hardware changed between runs

### 4. Cross-Architecture Estimation

Uses empirically derived scaling factors to estimate energy on unsupported hardware:
- Ampere (A800): 0.77× vs Ada (4090D) baseline for FP16
- Blackwell (5090): 0.85× estimated
- Hopper (H100): 0.65× estimated

## Advanced Usage

### CI Gate with energy threshold

```yaml
- uses: hongping-zh/ecocompute-dynamic-eval/action@main
  with:
    energy-threshold: '5'    # fail if >5% regression
    calibrate: 'true'        # requires GPU runner
```

### GPU runner with full calibration

```yaml
jobs:
  energy-audit:
    runs-on: [self-hosted, gpu]
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/cache@v4
        with:
          path: .ecocompute
          key: ecocompute-baseline-${{ runner.os }}-gpu

      - uses: hongping-zh/ecocompute-dynamic-eval/action@main
        with:
          calibrate: 'true'
          energy-threshold: '5'
```

### Only report critical issues

```yaml
- uses: hongping-zh/ecocompute-dynamic-eval/action@main
  with:
    severity-threshold: critical
```

### Silent mode (no PR comment, just outputs)

```yaml
- uses: hongping-zh/ecocompute-dynamic-eval/action@main
  with:
    post-comment: 'false'
```

## Architecture

```
action/
├── action.yml          # GitHub Action metadata (inputs/outputs/branding)
├── audit.py            # Main entry point: 4-phase pipeline
├── hardware.py         # GPU detection + architecture matching
├── calibrate.py        # Baseline calibration + relative change + estimation
├── example-workflow.yml # Copy-paste workflow with cache
├── test_sample.py      # Test file (triggers CRITICAL + WARNING)
└── README.md           # This file
```

## How It Relates to the EcoCompute Ecosystem

| Tool | Layer | Trigger | Depth |
|------|-------|---------|-------|
| **This Action** | CI/CD | PR event (workflow) | Static analysis + calibration + relative change |
| [Bot](https://github.com/apps/ecocompute-energy-auditor) | GitHub App | PR event (auto) | Pattern matching + data |
| [OpenClaw Skill](https://clawhub.ai/hongping-zh/ecocompute) | AI Agent | User conversation | Deep analysis (5 protocols) |

All three share the same empirical dataset and detection rules.

- **Action**: Best for teams wanting CI/CD integration, baseline tracking, and pass/fail gates
- **Bot**: Best for individuals wanting zero-config, one-click install
- **Skill**: Best for interactive deep-dive analysis (cost estimation, comparisons, diagnostics)

## Data Source

93+ measurements, n=10 per config, NVML 10Hz power sampling, CV<2%.
- **GPUs**: RTX 5090 (Blackwell), RTX 4090D (Ada Lovelace), A800 (Ampere)
- **Models**: Qwen2-1.5B, Phi-3-mini, Yi-1.5-6B, Mistral-7B, Qwen2.5-7B
- **Methods**: FP16, NF4, INT8 Default, INT8 Pure

Full dataset: https://github.com/hongping-zh/ecocompute-dynamic-eval

## Links

- 🔗 [Landing Page](https://hongping-zh.github.io/ecocompute-dynamic-eval/bot-landing/)
- 🤖 [GitHub Bot](https://github.com/apps/ecocompute-energy-auditor)
- 🧠 [OpenClaw Skill](https://clawhub.ai/hongping-zh/ecocompute)
- 📊 [Interactive Dashboard](https://hongping-zh.github.io/ecocompute-dynamic-eval/)
- 📄 [Technical Documentation](https://github.com/hongping-zh/ecocompute-dynamic-eval/blob/main/TECHNICAL_DOCUMENTATION.md)
