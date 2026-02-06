# 🌱 EcoCompute Dynamic Eval

**Compare AI models by Accuracy, Cost, AND Carbon Impact — all in one dashboard.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen)](https://hongping-zh.github.io/ecocompute-dynamic-eval/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 🔬 **Featuring real benchmark data from NVIDIA RTX 5090 (Blackwell architecture)**

## ✨ Features

- **📊 Dynamic Leaderboard** - Real-time model comparison with live evaluation
- **🔋 Energy Metrics** - Actual power consumption and carbon footprint data
- **⚡ RTX 5090 Benchmarks** - Real measurements, not simulations
- **🤖 Multi-API Support** - Gemini, OpenAI, Groq, or Demo mode
- **📈 Live Monitor** - Real-time power and efficiency visualization
- **🧮 Carbon Calculator** - Estimate your AI workload's environmental impact

## 🔬 Key Research Finding

Based on our RTX 5090 benchmarks:

| Model Size | FP16 vs 4-bit Quantization | Energy Change |
|------------|---------------------------|---------------|
| 1.1B (TinyLlama) | FP16 wins | 4-bit uses **26.5% MORE** energy |
| 1.5B (Qwen2) | FP16 wins | 4-bit uses **29.4% MORE** energy |
| 3B (Qwen2.5) | FP16 wins | 4-bit uses **11.7% MORE** energy |
| 7B (Qwen2) | **4-bit wins** | 4-bit saves **11.4%** energy ⭐ |

> **💡 Insight**: 4-bit quantization only saves energy for models **larger than ~5B parameters**. For smaller models, FP16 is more energy-efficient!

## 🚀 Live Demo

**👉 [https://hongping-zh.github.io/ecocompute-dynamic-eval/](https://hongping-zh.github.io/ecocompute-dynamic-eval/)**

## 🛠️ Run Locally

**Prerequisites:** Node.js 18+

```bash
# Clone the repository
git clone https://github.com/hongping-zh/ecocompute-dynamic-eval.git
cd ecocompute-dynamic-eval

# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

## ⚙️ API Configuration

The app supports multiple AI providers for the "Gemini Insights" feature:

| Provider | API Key Required | Notes |
|----------|------------------|-------|
| **Demo Mode** | No | Simulated responses, no API needed |
| **Google Gemini** | Yes | Free tier available |
| **OpenAI** | Yes | GPT-4o model |
| **Groq** | Yes | Ultra-fast inference |

Click the **Settings** button in the sidebar to configure your API provider.

## 📁 Project Structure

```
ecocompute-dynamic-eval/
├── components/
│   ├── Leaderboard.tsx      # Dynamic model comparison
│   ├── AudioMonitor.tsx     # Real-time power monitoring
│   ├── Calculator.tsx       # Carbon footprint calculator
│   └── SettingsPanel.tsx    # API configuration
├── services/
│   └── geminiService.ts     # Multi-API integration
├── constants.ts             # RTX 5090 benchmark data
├── App.tsx                  # Main application
└── types.ts                 # TypeScript definitions
```

## 📊 Benchmark Data Source

All RTX 5090 benchmark data was collected using:

- **Hardware**: NVIDIA GeForce RTX 5090 (32GB GDDR7, Blackwell)
- **Platform**: AutoDL Cloud Server
- **Framework**: PyTorch 2.10.0 + CUDA 12.8
- **Methodology**: 10 runs per configuration, 256 max tokens

Full benchmark report: [RTX5090_Energy_Benchmark_Report_EN.md](https://github.com/hongping-zh/ecocompute-ai)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Related Projects

- [EcoCompute AI](https://github.com/hongping-zh/ecocompute-ai) - Full benchmark suite and research papers

---

<p align="center">
  <b>🌍 Making AI development more sustainable, one model at a time.</b>
</p>
