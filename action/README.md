# EcoCompute Energy Audit — GitHub Action

> Auto-audit your CI/CD pipeline for LLM energy waste. Based on 93+ real GPU measurements.

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

      - name: EcoCompute Energy Audit
        uses: hongping-zh/ecocompute-dynamic-eval/action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

That's it. Next time a PR touches Python files, the Action scans for energy waste patterns and posts a comment.

## What It Detects

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

## Outputs

| Output | Description |
|--------|-------------|
| `issues-found` | Total number of issues found |
| `critical-count` | Number of critical issues |
| `warning-count` | Number of warnings |
| `report` | Path to full audit report (Markdown) |

## Advanced Usage

### Use as CI Gate (fail on critical issues)

The Action exits with code 1 if critical issues are found:

```yaml
- name: EcoCompute Energy Audit
  uses: hongping-zh/ecocompute-dynamic-eval/action@main
  id: audit

- name: Check results
  if: steps.audit.outputs.critical-count > 0
  run: echo "Critical energy issues found!" && exit 1
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

## How It Relates to the EcoCompute Ecosystem

| Tool | Layer | Trigger | Depth |
|------|-------|---------|-------|
| **This Action** | CI/CD | PR event (workflow) | Pattern matching + data |
| [Bot](https://github.com/apps/ecocompute-energy-auditor) | GitHub App | PR event (auto) | Pattern matching + data |
| [OpenClaw Skill](https://clawhub.ai/hongping-zh/ecocompute) | AI Agent | User conversation | Deep analysis (5 protocols) |

All three share the same empirical dataset and detection rules.

- **Action**: Best for teams that want CI/CD integration and control over the workflow
- **Bot**: Best for individuals who want zero-config, one-click install
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
