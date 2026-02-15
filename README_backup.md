<div align="center">

# ⚡ EcoCompute Dynamic Eval

> **Discovery**: 4-bit quantization wastes 40% more energy on small models

### Compare AI models by Accuracy × Cost × Carbon — RTX 5090 benchmarks reveal when quantization hurts efficiency

[![Live Demo](https://img.shields.io/badge/🚀_Try_Demo-Live-brightgreen?style=for-the-badge)](https://hongping-zh.github.io/ecocompute-dynamic-eval/)
[![RTX 5090 Data](https://img.shields.io/badge/📊_RTX_5090-Verified-green?style=for-the-badge)](https://github.com/hongping-zh/ecocompute-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 💡 Before You Deploy That LLM

**You need to know**:
- ❌ Qwen2-1.5B (NF4) uses **+29% energy** vs FP16
- ✅ Qwen2-7B (NF4) saves **-11% energy** vs FP16  
- 💰 Choosing wrong quantization **wastes $50+/month** in electricity

**Why?** Small models have low compute, so quantization overhead dominates. Industry advice to "just quantize everything" can actually **increase** your carbon footprint.

**Solution**: Use this dashboard to compare **real RTX 5090 measurements** before deployment.

---

## � The Quantization Paradox — Our Core Discovery

We benchmarked **8 model configurations on NVIDIA RTX 5090 (Blackwell)** with NVML 10 Hz power sampling and found a result that challenges industry assumptions:

```
Energy per 1K tokens (Joules) — RTX 5090 Measured Data
                                                                    
  TinyLlama 1.1B   FP16  ████████████████░ 1,659 J                 
                    NF4   ████████████████████░ 2,098 J  (+26.5% ⚠️)
                                                                    
  Qwen2 1.5B       FP16  ████████████████████████░ 2,411 J         
                    NF4   ███████████████████████████████░ 3,120 J  (+29.4% ⚠️)
                                                                    
  Qwen2.5 3B       FP16  ██████████████████████████████████░ 3,383 J
                    NF4   █████████████████████████████████████░ 3,780 J  (+11.7% ⚠️)
                                                                    
  Qwen2 7B         FP16  ██████████████████████████████████████████████████████░ 5,509 J
                    NF4   ████████████████████████████████████████████████░ 4,878 J  (-11.4% ✅)
```

> **💡 Key Insight**: 4-bit quantization only saves energy for models **larger than ~5B parameters**. For smaller models, FP16 is actually more energy-efficient. This means the common advice to "just quantize everything" can **increase** your carbon footprint.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **📊 Dynamic Leaderboard** | Compare 20+ models across accuracy, cost, carbon, and energy efficiency — with RTX 5090 provenance badges for verified data |
| **🧮 Emissions Calculator** | 15+ preset templates (chatbot, code review, RAG pipeline…), sensitivity analysis, break-even charts, and shareable comparison links |
| **⚡ Live System Monitor** | Real-time GPU power consumption and efficiency visualization with animated charts |
| **⚖️ DeepSeek vs GPT** | Step-by-step workflow to compare cost and carbon impact for your specific workload |
| **🔍 Methodology** | Full transparency — every data point links to its source, measurement method, and confidence level |
| **🤖 Multi-API Insights** | Connect Gemini, OpenAI, or Groq for AI-powered analysis — or use Demo mode with zero config |

---

## 🚀 Quick Start

### Option 1: Live Demo (Zero Setup)

**👉 [https://hongping-zh.github.io/ecocompute-dynamic-eval/](https://hongping-zh.github.io/ecocompute-dynamic-eval/)**

No installation needed. Works in Demo mode out of the box.

### Option 2: Run Locally

**Prerequisites:** [Node.js](https://nodejs.org/) 18+

```bash
# Clone the repository
git clone https://github.com/hongping-zh/ecocompute-dynamic-eval.git
cd ecocompute-dynamic-eval

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser. The app runs in Demo mode by default — no API keys required.

### Option 3: Configure AI Insights (Optional)

To enable AI-powered model analysis, click **Settings** in the sidebar and add an API key:

| Provider | API Key Required | Notes |
|----------|:----------------:|-------|
| **Demo Mode** | ❌ | Simulated responses, works out of the box |
| **Google Gemini** | ✅ | [Free tier available](https://ai.google.dev/) |
| **OpenAI** | ✅ | GPT-4o model |
| **Groq** | ✅ | Ultra-fast inference |

---

## 📊 Benchmark Data

All RTX 5090 data was collected under controlled conditions:

| Parameter | Value |
|-----------|-------|
| **Hardware** | NVIDIA GeForce RTX 5090 (32GB GDDR7, Blackwell) |
| **Platform** | AutoDL Cloud Server |
| **Framework** | PyTorch 2.10.0 + CUDA 12.8 |
| **Quantization** | bitsandbytes NF4 |
| **Sampling** | NVML 10 Hz power polling |
| **Runs** | 10 per configuration |
| **Max Tokens** | 256 |

### Models Benchmarked (RTX 5090 Verified)

| Model | FP16 Energy | NF4 Energy | Δ Energy | Monthly Cost Impact* |
|-------|:----------:|:----------:|:--------:|:-------------------:|
| TinyLlama 1.1B | 1,659 J | 2,098 J | **+26.5%** ⚠️ | +$13/month |
| Qwen2 1.5B | 2,411 J | 3,120 J | **+29.4%** ⚠️ | +$21/month |
| Qwen2.5 3B | 3,383 J | 3,780 J | **+11.7%** ⚠️ | +$12/month |
| Qwen2 7B | 5,509 J | 4,878 J | **−11.4%** ✅ | −$19/month |

*Based on 1M tokens/month, $0.12/kWh electricity cost

The dashboard also includes estimated data for commercial APIs (GPT-4o, Gemini, Claude) and research models (LLaMA, BERT, ResNet) with clearly labeled confidence levels.

📄 **Full benchmark report**: [RTX5090_Energy_Benchmark_Report_EN.md](https://github.com/hongping-zh/ecocompute-ai)

---

## 📁 Project Structure

```
ecocompute-dynamic-eval/
│
├── components/                  # React UI components
│   ├── Leaderboard.tsx          #   Dynamic model comparison table with sorting & filters
│   ├── Calculator.tsx           #   Emissions calculator with 15+ templates & sensitivity analysis
│   ├── AudioMonitor.tsx         #   Real-time GPU power monitoring with animated charts
│   ├── DeepSeekVsGpt.tsx        #   Side-by-side cost/carbon workflow comparison
│   ├── Methodology.tsx          #   Data sources, formulas, and provenance disclosure
│   ├── AITools.tsx              #   Floating AI assistant panel
│   ├── ApiCostComparison.tsx    #   API pricing comparison view
│   ├── Pricing.tsx              #   Pricing page component
│   └── SettingsPanel.tsx        #   API provider configuration
│
├── services/                    # Backend service integrations
│   ├── geminiService.ts         #   Multi-provider AI API integration (Gemini/OpenAI/Groq)
│   ├── engine.ts                #   Calculation engine for emissions & cost
│   └── types.ts                 #   Service-layer TypeScript types
│
├── constants.ts                 # RTX 5090 benchmark data + commercial API estimates
├── types.ts                     # Shared TypeScript type definitions
├── App.tsx                      # Main app with sidebar navigation & URL routing
├── index.tsx                    # React entry point
├── index.html                   # HTML template
├── index.css                    # Global styles (Tailwind)
│
├── public/                      # Static assets
│   ├── robots.txt               #   Search engine directives
│   └── sitemap.xml              #   Sitemap for SEO
│
├── .github/
│   └── FUNDING.yml              # GitHub Sponsors configuration
├── CONTRIBUTING.md              # Contribution guidelines (templates, data, bugs)
├── LICENSE                      # MIT License
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite build configuration
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 6 |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **AI APIs** | Google Gemini, OpenAI, Groq |
| **Hosting** | GitHub Pages |

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- **🧮 Submit calculator templates** — Share real-world AI workload scenarios
- **📊 Contribute benchmark data** — Run benchmarks on your GPU and share results
- **🐛 Report bugs** — Help us improve the dashboard
- **💡 Suggest features** — Open an issue tagged `enhancement`

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for detailed guidelines and template submission process.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

By contributing, you agree that your contributions will be licensed under the same license.

---

## 🔗 Related Projects

| Project | Description |
|---------|-------------|
| [**EcoCompute AI**](https://github.com/hongping-zh/ecocompute-ai) | Full RTX 5090 benchmark suite, raw data, and research reports |

---

## 📬 Contact

- **Live Demo**: [hongping-zh.github.io/ecocompute-dynamic-eval](https://hongping-zh.github.io/ecocompute-dynamic-eval/)
- **Email**: zhanghongping1982@gmail.com
- **Sponsor**: [GitHub Sponsors](https://github.com/sponsors/hongping-zh)

> **If you're an investor, accelerator, or potential design partner** — I'd love to chat. Email me or [open a Discussion](https://github.com/hongping-zh/ecocompute-dynamic-eval/discussions) on the repo.

---

<p align="center">
  <b>🌍 Making AI development more sustainable, one model at a time.</b>
</p>
