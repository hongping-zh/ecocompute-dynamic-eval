# EcoCompute Energy Auditor Bot — Multi-Channel Promotion Playbook

> **Landing Page**: `https://hongping-zh.github.io/ecocompute-dynamic-eval/bot-landing/`
> **Install Link**: `https://github.com/apps/ecocompute-energy-auditor`
> **Last Updated**: 2026-02-19

---

## Table of Contents

1. [Reddit r/LocalLLaMA](#1-reddit-rlocalllama)
2. [Reddit r/MachineLearning](#2-reddit-rmachinelearning)
3. [Hacker News Show HN](#3-hacker-news-show-hn)
4. [Twitter/X Thread](#4-twitterx-thread)
5. [Xiaohongshu Updated](#5-xiaohongshu-updated)
6. [bitsandbytes Issue Comment](#6-bitsandbytes-issue-comment)
7. [GitHub Marketplace Submission](#7-github-marketplace-submission)
8. [Launch Schedule](#8-launch-schedule)

---

## 1. Reddit r/LocalLLaMA

**Subreddit**: r/LocalLLaMA (~700K members, tool-friendly, technical audience)

### Title (pick one)

- `We measured 93 configs and found load_in_8bit=True wastes up to 147% energy - built a free GitHub Bot to catch it automatically`
- `PSA: Default bitsandbytes INT8 wastes 17-147% energy. We built a free Bot that audits your PRs automatically.`

### Body

```
Hey r/LocalLLaMA,

We ran 93+ measurements across RTX 4090D, A800, and RTX 5090, and found some
counterintuitive results about quantization energy efficiency:

**Finding 1: Default INT8 is an energy trap**

`load_in_8bit=True` (bitsandbytes default, threshold=6.0) causes 17-147% MORE
energy consumption vs FP16. The culprit is mixed-precision decomposition -
continuous INT8<->FP16 type conversion at every linear layer.

One-line fix: add `llm_int8_threshold=0.0`. This recovers +79-84% throughput.

**Finding 2: BS=1 wastes 95.7% of your GPU**

We swept batch sizes 1-64 on A800 + Mistral-7B. Going from BS=1 to BS=16
saves 88% energy. Most tutorials and quick-start examples use BS=1.

**What we built**

We turned these findings into a **free GitHub Bot** that auto-audits your Pull
Requests:

- Install in 60 seconds (one-click GitHub App)
- Scans PR diffs for quantization anti-patterns
- Posts a comment with data-backed fixes
- Completely silent when your code is correct

Landing page with demo:
https://hongping-zh.github.io/ecocompute-dynamic-eval/bot-landing/

Direct install:
https://github.com/apps/ecocompute-energy-auditor

Full data + methodology:
https://github.com/hongping-zh/ecocompute-dynamic-eval

The Bot detects 6 patterns:
- Default INT8 without threshold override (17-147% waste)
- Mixed precision config conflicts
- NF4 on small models <3B (~29% penalty)
- Sequential BS=1 processing (up to 95.7% waste)
- Missing device_map
- Redundant quantization params

It only reads PR diffs, never the full repo. Fully open-source.

Happy to answer questions about the measurements or the Bot.
```

### Tips

- **Time**: US West Coast 9-11 AM (Beijing 1-3 AM)
- **Flair**: `News | Tools`
- **Engagement**: Reply actively in the first 2 hours, especially to technical challenges
- **Images**: Add Bot PR screenshot as a comment

---

## 2. Reddit r/MachineLearning

**Subreddit**: r/MachineLearning (~3M members, academic-leaning, more rigorous)

### Title

`[P] Free GitHub Bot that auto-audits LLM quantization code for energy waste - based on 93+ GPU measurements`

### Body

```
**TL;DR**: We systematically measured energy consumption of quantized LLM
inference across 3 NVIDIA GPU architectures and found that common
configurations waste 17-147% energy. We built a free GitHub Bot that
automatically audits Pull Requests and flags these issues.

**Background**

We ran controlled experiments (n=10 per config, CV<2%, NVML 10Hz power
sampling) on RTX 4090D (Ada), A800 (Ampere), and RTX 5090 (Blackwell) and
documented three "energy paradoxes":

1. **INT8 Paradox**: bitsandbytes `load_in_8bit=True` with default
   `llm_int8_threshold=6.0` increases energy by 17-147% vs FP16 due to
   mixed-precision decomposition overhead. Setting threshold to 0.0
   eliminates this.

2. **Small Model NF4 Paradox**: NF4 quantization on models <=3B wastes ~29%
   energy - dequantization overhead exceeds memory savings.

3. **Batch Size Paradox**: BS=1 (common in tutorials) wastes up to 95.7%
   energy vs BS=64.

**The Tool**

We packaged these findings into a GitHub App that scans PR diffs:

- https://hongping-zh.github.io/ecocompute-dynamic-eval/bot-landing/
- Zero config, one-click install, fully open-source
- Only comments when it finds a real issue
- Never stores code, never modifies code

**Links**
- Install: https://github.com/apps/ecocompute-energy-auditor
- Data + methodology: https://github.com/hongping-zh/ecocompute-dynamic-eval
- bitsandbytes issue: https://github.com/bitsandbytes-foundation/bitsandbytes/issues/1867

Feedback welcome. We're especially interested in: (a) accuracy impact data
for Pure INT8, and (b) measurements on H100/MI300X.
```

### Tips

- **Tag**: `[P]` (Project)
- **Tone**: Academic + practical, avoid over-marketing

---

## 3. Hacker News Show HN

### Title

`Show HN: Free GitHub Bot that catches LLM energy waste in your PRs`

### Body

```
We measured energy consumption across 93+ quantized LLM configs on 3 NVIDIA
GPUs and found that common practices waste massive amounts of energy:

- load_in_8bit=True (bitsandbytes default) -> +147% energy vs FP16
- batch_size=1 (most tutorials) -> wastes 95.7% of GPU capacity

We built a free GitHub Bot that auto-audits your PRs:

Landing page: https://hongping-zh.github.io/ecocompute-dynamic-eval/bot-landing/
Install (one click): https://github.com/apps/ecocompute-energy-auditor

How it works:
1. Install the GitHub App on your repos
2. Open a PR with Python code containing LLM quantization configs
3. Bot scans the diff and posts a comment with data-backed fixes

It detects 6 anti-patterns, stays completely silent when your code is fine,
and never stores or modifies code. Fully open-source.

The underlying data: 93+ measurements, n=10 each, NVML 10Hz power sampling,
CV<2%. Tested on RTX 4090D, A800, RTX 5090. Full dataset:
https://github.com/hongping-zh/ecocompute-dynamic-eval

Built by an independent researcher. Feedback and contributions welcome.
```

### Tips

- **Time**: US East Coast 8-10 AM (Beijing 8-10 PM)
- **Prepare for questions**:
  - "What about accuracy impact?" -> Honestly say energy-focused, accuracy pending
  - "Why not just use FP16?" -> Explain VRAM constraints
  - "Does it work with vLLM/TGI?" -> Bot scans code patterns, framework-agnostic

---

## 4. Twitter/X Thread

### Tweet 1 (Hook)

```
Your LLM is secretly wasting up to 147% more energy.

We measured 93+ configs across 3 NVIDIA GPUs and found that common
quantization code is an energy disaster.

Built a free GitHub Bot to catch it automatically. Thread
```

### Tweet 2 (Problem)

```
The #1 energy trap:

load_in_8bit=True (bitsandbytes default)

Sounds efficient, right? Wrong.

Mixed-precision decomposition causes INT8-FP16 type conversion at EVERY
linear layer.

Result: 17-147% MORE energy than just using FP16.
```

### Tweet 3 (Fix)

```
The fix is one line:

llm_int8_threshold=0.0

This disables mixed-precision decomposition.

Effect:
+79-84% throughput recovery
-27-36% energy reduction
Same memory savings

But who remembers to add this every time?
```

### Tweet 4 (Bot)

```
That's why we built EcoCompute Energy Auditor.

A free GitHub App that:
- Auto-scans your PRs
- Flags 6 energy waste patterns
- Posts data-backed fixes
- Stays silent when code is correct

One-click install. Zero config. Open-source.
```

### Tweet 5 (CTA)

```
Install in 60 seconds:
https://hongping-zh.github.io/ecocompute-dynamic-eval/bot-landing/

Open-source. Free forever. Based on real GPU measurements, not vibes.

Data: https://github.com/hongping-zh/ecocompute-dynamic-eval

RT if you've ever used load_in_8bit=True without thinking twice
```

### Tips

- **Images**: Tweet 1 - Bot PR screenshot; Tweet 2 - data comparison chart
- **Timing**: Post 5 tweets, 1-2 min apart
- **Tags**: #LLM #AI #GreenAI #MachineLearning #bitsandbytes #quantization

---

## 5. Xiaohongshu Updated

### Title

**你的大模型在偷偷浪费电！这个免费Bot帮你自动抓bug**

### Body

```
搞AI的姐妹/兄弟们看过来！

我们测了3张显卡（RTX 5090/4090D/A800）跑了93组实验，发现一个惊人事实：

load_in_8bit=True 这行代码，能让你的模型多耗 147% 的电！
batch_size=1 逐条推理，浪费 95.7% 的GPU算力！

于是我做了一个 GitHub Bot，装上之后：
- 提PR自动扫描你的量化代码
- 发现问题直接评论+给修复建议
- 完全免费，零配置

效果见图（Bot自动在PR上标红问题+给代码修复）

一键安装+效果演示：
hongping-zh.github.io/ecocompute-dynamic-eval/bot-landing/

60秒装好，一行代码都不用改！

技术原理：
bitsandbytes 的 INT8 默认配置（threshold=6.0）会在每个线性层做
INT8和FP16类型转换，导致能耗暴增。加一行 llm_int8_threshold=0.0 就能修复。

我们的 Bot 就是自动帮你检查这类问题的。

如果你身边有搞大模型部署的朋友，转发给TA看看！
```

### Tags

```
#大模型 #AI省电 #GPU优化 #量化推理 #LLM #开源工具 #程序员必备
#AIops #省钱攻略 #绿色AI #bitsandbytes #INT8
```

### Images

1. Bot PR audit screenshot (real PR #5)
2. "147% vs fixed" energy comparison chart
3. Landing Page screenshot (3-step install section)
4. Code comparison (bad vs Bot-recommended)

---

## 6. bitsandbytes Issue Comment

Post on existing Issue #1867, 1-2 days AFTER Reddit/HN launch:

```markdown
**Update**: We've built a free GitHub Bot that automatically catches this
pattern in Pull Requests.

When a PR contains `load_in_8bit=True` without `llm_int8_threshold=0.0`,
the Bot flags it with a comment explaining the energy impact and providing
the fix.

- **Install (one click)**: https://github.com/apps/ecocompute-energy-auditor
- **Details**: https://hongping-zh.github.io/ecocompute-dynamic-eval/bot-landing/

The Bot also catches 5 other energy waste patterns (NF4 on small models,
BS=1 sequential processing, etc.). It only reads PR diffs, never stores
code, and stays silent when the code is correct.

This doesn't replace a potential fix in bitsandbytes itself (e.g., a
documentation warning or a performance optimization of the decomposition
pathway), but it helps practitioners avoid the pitfall right now.
```

### Tips

- Wait 1-2 days after Reddit/HN to avoid looking spammy
- Keep tone technical and constructive, not promotional

---

## 7. GitHub Marketplace Submission

### Steps

1. Go to https://github.com/settings/apps/ecocompute-energy-auditor
2. Click **"Marketplace listing"** in sidebar
3. Fill in:

**Name**: EcoCompute Energy Auditor

**Tagline**:
```
Auto-audit PRs for LLM energy waste. Catches the INT8 147% paradox and more.
Free and open-source.
```

**Description**:
```markdown
## What it does

EcoCompute Energy Auditor automatically scans your Pull Requests for LLM
energy waste patterns and posts a comment with data-backed fixes.

## Why you need it

Common quantization configurations waste massive amounts of energy:

- `load_in_8bit=True` (bitsandbytes default) - 17-147% more energy than FP16
- `batch_size=1` (most tutorials) - 95.7% GPU waste
- NF4 on small models (<3B) - ~29% energy penalty

These findings are based on 93+ real measurements across RTX 4090D, A800,
and RTX 5090.

## How it works

1. Install - One click, choose your repos
2. Open a PR - Push code with LLM quantization configs
3. Get audited - Bot scans the diff and comments with fixes

## Key features

- Zero config - Install and forget
- Smart silence - Only comments when it finds a real issue
- Safe - Only reads PR diffs, never stores or modifies code
- 6 detection patterns - Critical issues, warnings, and info hints
- Open-source - https://github.com/hongping-zh/ecocompute-dynamic-eval

## Pricing

Free. Forever.
```

**Category**: Code quality / Code review

### Tips

- Marketplace listings need GitHub review (3-5 days)
- Once approved, appears in Marketplace search results (organic traffic)

---

## 8. Launch Schedule

| Day | Channel | Action |
|-----|---------|--------|
| **Day 0** | GitHub Pages | Deploy Landing Page |
| **Day 0** | GitHub App | Confirm App is set to Public |
| **Day 0** | GitHub Marketplace | Submit listing (wait for review) |
| **Day 1** | Reddit r/LocalLLaMA | Post (US West 9 AM) |
| **Day 1** | Twitter/X | Post thread (same time) |
| **Day 2** | Reddit r/MachineLearning | Post (stagger by 1 day) |
| **Day 2** | Xiaohongshu | Post (Chinese hours, daytime) |
| **Day 3** | Hacker News | Show HN (US East 8 AM) |
| **Day 4-5** | bitsandbytes #1867 | Add comment |
| **Week 2** | All channels | Reply to comments, share updates |

### Key Principles

- **Stagger launches** across 3-5 days to maximize individual channel attention
- **Reply actively** in the first 2 hours after each post
- **Be honest about limitations**: accuracy data pending, energy-focused research
- **Link to Landing Page first**, not the full Dashboard
- **Prepare screenshots** before launch day
- **Monitor analytics**: GitHub App install count, Landing Page visits, GitHub stars
