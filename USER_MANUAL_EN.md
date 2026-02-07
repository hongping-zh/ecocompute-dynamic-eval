# EcoCompute User Manual

**Version**: 2.0  
**Last Updated**: February 8, 2026  
**Website**: https://hongping-zh.github.io/ecocompute-dynamic-eval/

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Model Leaderboard](#model-leaderboard)
3. [Cost Calculator](#cost-calculator)
4. [API Cost Comparison](#api-cost-comparison)
5. [Templates & Presets](#templates--presets)
6. [History Management](#history-management)
7. [Advanced Features](#advanced-features)
8. [Tips & Best Practices](#tips--best-practices)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Getting Started

### What is EcoCompute?

EcoCompute is a comprehensive platform for evaluating AI models and optimizing infrastructure costs. It helps you:

- **Compare AI models** across performance, cost, and carbon footprint
- **Estimate costs** for different API providers and hardware configurations
- **Optimize spending** by finding the most cost-effective solution for your use case
- **Reduce carbon emissions** with eco-friendly model recommendations

### Quick Start (3 Steps)

1. **Visit the website**: https://hongping-zh.github.io/ecocompute-dynamic-eval/
2. **Choose your view**: Click on the sidebar to navigate between features
3. **Start exploring**: Use the Calculator or Leaderboard to analyze your options

No sign-up required! All features are free and work directly in your browser.

---

## Model Leaderboard

### Overview

The Leaderboard displays 22+ AI models with real-time performance metrics, allowing you to compare and rank models based on your priorities.

### Key Features

#### 1. **Sortable Columns**

Click any column header to sort models:
- **Accuracy**: Model performance on benchmarks (higher is better)
- **Speed**: Execution time in seconds (lower is better)
- **Cost**: Estimated monthly cost in USD (lower is better)
- **Carbon**: CO₂ emissions in kg/day (lower is better)
- **Efficiency**: Tokens per watt (higher is better)
- **Score**: Composite score based on your weights (higher is better)

#### 2. **Data Confidence Badges**

Each model shows a colored badge indicating data quality:
- 🟢 **Measured** (Green): Direct measurements from official benchmarks
- 🟡 **Estimated** (Amber): Calculated based on similar hardware
- 🔵 **Research** (Blue): Academic papers or third-party studies

**Hover over badges** to see detailed provenance information:
- Data source
- Measurement methodology
- Last updated date
- Citation links

#### 3. **Configurable Scoring Weights**

Customize how models are ranked:

1. Click the **"Scoring Weights"** button (slider icon)
2. Adjust the 5 sliders to match your priorities:
   - **Accuracy**: How important is model performance?
   - **Speed**: How critical is response time?
   - **Cost**: How budget-conscious are you?
   - **Carbon**: How important is environmental impact?
   - **Efficiency**: How much do you value energy efficiency?
3. Watch the **Score** column update in real-time

**Example Configurations**:
- **Startup (Cost-First)**: Cost 40%, Carbon 30%, Accuracy 20%, Speed 10%, Efficiency 0%
- **Enterprise (Performance-First)**: Accuracy 50%, Speed 30%, Cost 10%, Carbon 5%, Efficiency 5%
- **Green AI**: Carbon 40%, Efficiency 30%, Cost 20%, Accuracy 10%, Speed 0%

#### 4. **RTX 5090 Filter**

Toggle the **"RTX 5090 Only"** button to show only models optimized for NVIDIA's latest GPU.

#### 5. **AI Analysis**

Select multiple models (checkboxes) and click **"Analyze with AI"** to get:
- Comparative strengths and weaknesses
- Use case recommendations
- Cost-benefit analysis

*Note: Requires Google Gemini API key in Settings*

---

## Cost Calculator

### Overview

The Calculator estimates monthly costs and carbon emissions for different hardware and API configurations.

### Basic Usage

#### Step 1: Configure Hardware

1. **Hardware Type**: Select GPU model (RTX 5090, H100, A100, etc.)
2. **GPU Count**: Number of GPUs (1-100)
3. **Hours/Day**: Daily usage hours (1-24)
4. **PUE**: Power Usage Effectiveness (1.0-2.5)
   - 1.0 = Perfect efficiency (theoretical)
   - 1.2 = Excellent (modern data centers)
   - 1.5 = Average
   - 2.0+ = Poor (older facilities)

#### Step 2: Configure API Usage

1. **API Model**: Choose provider (DeepSeek, GPT-4o, Claude, Gemini, etc.)
2. **Tokens/Day**: Daily token volume
   - Small chatbot: 100K-500K
   - Medium app: 1M-5M
   - Large enterprise: 10M+

#### Step 3: View Results

The calculator displays:
- **Daily Cost**: API costs per day
- **Monthly Cost**: Projected monthly spending
- **Carbon Impact**: Daily CO₂ emissions in kg
- **Energy Usage**: kWh consumed per day

### Advanced Features

#### 1. **Compare Mode**

Compare two configurations side-by-side:

1. Click **"Compare"** button
2. Configure "Plan B" settings
3. View cost difference and savings percentage

**Use Cases**:
- Self-hosted vs API comparison
- Different GPU models
- Volume discount scenarios

#### 2. **Custom Formulas**

Create advanced billing logic:

1. Click **"Custom Formula"** toggle
2. Enter formula using available variables:
   - `tokens`: Tokens per day
   - `input_price`: Input price per 1M tokens
   - `output_price`: Output price per 1M tokens
   - `gpu_count`: Number of GPUs
   - `hours`: Hours per day
   - `pue`: PUE value
   - `power`: GPU power in watts

3. Use advanced functions:
   - `IF(condition, then, else)`: Conditional logic
   - `MIN(a, b)`: Minimum value
   - `MAX(a, b)`: Maximum value
   - `ROUND(value, decimals)`: Round numbers

**Example Formulas**:

```javascript
// Free tier: First 1M tokens free
IF(tokens > 1000000, (tokens - 1000000) * input_price / 1000000, 0)

// Volume discount: 10% off for >5M tokens
tokens * input_price / 1000000 * IF(tokens > 5000000, 0.9, 1.0)

// Cost cap: Maximum $500/month
MIN(tokens * input_price / 1000000 * 30, 500)

// Minimum charge: At least $10/month
MAX(tokens * input_price / 1000000 * 30, 10)
```

**Real-time Preview**: The formula preview shows your expression with actual values substituted, helping you debug syntax errors.

#### 3. **Templates**

Quick-start with pre-configured scenarios:

1. Click **"Templates"** button
2. Browse categories:
   - Software Engineering
   - Customer Support
   - Content Creation
   - Research
   - Education
   - Enterprise
3. Click a template to load its configuration

**Popular Templates**:
- **Startup Chatbot**: 1M tokens/day, GPT-4o-mini
- **Code Assistant**: 500K tokens/day, DeepSeek-V3
- **Enterprise Support**: 5M tokens/day, Claude Haiku
- **Research Analysis**: 300K tokens/day, Gemini Pro

#### 4. **Share & Export**

**Share Configuration**:
1. Click **"Share"** button
2. Copy the generated URL
3. Send to colleagues - they'll see your exact configuration

**Share as Template**:
1. Click **"Template"** button
2. Opens GitHub Issue with pre-filled data
3. Add use case description
4. Submit for community review

**Export JSON**:
1. Click **"Export JSON"** button
2. Downloads configuration file
3. Use for backup or automation

**Generate Report Image**:
1. Click **"Report Image"** button (purple icon)
2. Downloads PNG with:
   - Configuration summary
   - Cost breakdown
   - Key insights
   - Branding
3. Ready for PowerPoint/Slack/Notion

**Print Report**:
1. Click **"Print"** button
2. Browser print dialog opens
3. Save as PDF or print

---

## API Cost Comparison

### Overview

Dedicated page for comparing AI API pricing across 8+ providers with interactive cost calculator.

### How to Use

1. Click **"API Costs"** in sidebar
2. Adjust sliders:
   - **Daily Token Volume**: 10K - 10M tokens
   - **Input/Output Ratio**: 0-100%
3. View sorted comparison table
4. Check real-world scenarios
5. Read FAQ for common questions

### Key Insights

The page automatically highlights:
- **Cheapest Option**: Lowest cost model for your volume
- **Potential Savings**: How much you save vs most expensive
- **Eco-Friendly Models**: Low-carbon options

### Use Cases Section

See real-world examples:
- Customer Support Chatbot: $27/mo
- Code Review Assistant: $8/mo
- Content Generation: $9/mo
- Document Analysis: $22/mo

---

## Templates & Presets

### Using Templates

Templates are pre-configured calculator settings for common use cases.

**To Load a Template**:
1. Open Calculator
2. Click **"Templates"** button
3. Select from gallery
4. Configuration loads automatically

### Creating Your Own Template

**Option 1: Share via GitHub**
1. Configure calculator with your settings
2. Click **"Template"** button
3. Fill in use case details
4. Submit GitHub Issue
5. Community reviews and merges

**Option 2: Export JSON**
1. Configure calculator
2. Click **"Export JSON"**
3. Save file locally
4. Share with team
5. They import via **"Import JSON"**

### Template Categories

- **Software Engineering**: Code generation, review, testing
- **Customer Support**: Chatbots, ticket analysis, FAQs
- **Content Creation**: Writing, translation, summarization
- **Research**: Document analysis, literature review
- **Education**: Tutoring, grading, curriculum
- **Enterprise**: Large-scale deployments

---

## History Management

### Overview

Calculator automatically saves your configurations locally (no account needed).

### Features

#### 1. **Auto-Save**

Every configuration change is automatically saved to your browser's local storage. If you close the tab and return later, your settings are restored.

#### 2. **Manual Save to History**

1. Configure calculator
2. Click **"Save"** button (amber icon)
3. Entry added to history with timestamp

#### 3. **View History**

1. Click **"History"** button (clock icon)
2. Panel shows up to 50 recent entries
3. Each entry displays:
   - Timestamp
   - Monthly cost
   - Daily CO₂

#### 4. **Restore from History**

1. Open history panel
2. Find desired entry
3. Click **"Restore"** button
4. Configuration loads instantly

#### 5. **Export History**

1. Open history panel
2. Click **"Export"** button
3. Downloads JSON file with all entries
4. Use for backup or migration

#### 6. **Import History**

1. Open history panel
2. Click **"Import"** button
3. Select previously exported JSON file
4. History merges with existing entries

#### 7. **Clear History**

1. Open history panel
2. Click **"Clear All"** button
3. Confirm deletion
4. All history removed (cannot be undone)

### Privacy Note

All history is stored **locally in your browser**. We never send your data to any server. Clearing browser data will delete your history.

---

## Advanced Features

### 1. **Live Data Simulation**

Toggle **"Live Data"** in Leaderboard to see simulated real-time metric updates. Useful for demonstrations and understanding metric volatility.

### 2. **System Monitor**

Click **"Monitor"** in sidebar to view:
- Real-time audio waveform visualization
- Energy consumption graphs
- System performance metrics

*Note: Requires microphone permission for audio features*

### 3. **Methodology Page**

Click **"Methodology"** to learn:
- How metrics are calculated
- Data sources and citations
- Competitive differentiation
- Measurement standards

### 4. **Pricing Plans**

Click **"Pricing"** to see:
- Free tier features
- Pro plan ($49/mo) benefits
- Enterprise options
- Feature comparison table
- Roadmap timeline

### 5. **Settings Panel**

Click **"Settings"** (gear icon) to configure:
- **Google Gemini API Key**: Enable AI analysis features
- **Theme**: Light/dark mode (future)
- **Language**: English/Chinese (future)

---

## Tips & Best Practices

### Cost Optimization

1. **Start with cheaper models**: Test GPT-4o-mini or DeepSeek before upgrading to GPT-4
2. **Use volume discounts**: Consolidate workloads to reach discount tiers
3. **Optimize prompts**: Reduce token usage with concise prompts
4. **Cache responses**: Store common queries to avoid redundant API calls
5. **Monitor usage**: Use history to track spending trends

### Carbon Reduction

1. **Choose low-carbon models**: Look for green badges in Leaderboard
2. **Optimize PUE**: Use modern data centers (PUE < 1.3)
3. **Reduce idle time**: Scale down during off-peak hours
4. **Batch processing**: Process requests in batches vs real-time
5. **Use efficient hardware**: RTX 5090 has better tokens/watt than older GPUs

### Formula Writing

1. **Test incrementally**: Build complex formulas step-by-step
2. **Use preview**: Check variable substitution before running
3. **Handle edge cases**: Use IF to avoid division by zero
4. **Document formulas**: Add comments in JSON exports
5. **Share with team**: Export working formulas for reuse

### Template Management

1. **Name descriptively**: Use clear names like "Support-Bot-1M-Daily"
2. **Add context**: Include team size, industry, workload pattern
3. **Update regularly**: Refresh templates as pricing changes
4. **Share successes**: Submit templates that save costs
5. **Test before sharing**: Verify calculations are accurate

---

## Troubleshooting

### Calculator Issues

**Problem**: Results seem incorrect
- **Solution**: Check that all inputs are valid (positive numbers)
- **Solution**: Verify API model pricing is up-to-date
- **Solution**: Clear browser cache and reload

**Problem**: Formula validation fails
- **Solution**: Check syntax - use parentheses correctly
- **Solution**: Ensure all variables are spelled correctly
- **Solution**: Test with simpler formula first

**Problem**: History not saving
- **Solution**: Check browser allows local storage
- **Solution**: Ensure you're not in incognito/private mode
- **Solution**: Clear old data if storage quota exceeded

### Leaderboard Issues

**Problem**: Models not sorting correctly
- **Solution**: Click column header again to toggle direction
- **Solution**: Refresh page to reset sort state

**Problem**: AI Analysis not working
- **Solution**: Add Google Gemini API key in Settings
- **Solution**: Check API key has sufficient quota
- **Solution**: Verify internet connection

**Problem**: Provenance tooltips not showing
- **Solution**: Hover longer over the badge
- **Solution**: Try a different browser
- **Solution**: Disable browser extensions that block tooltips

### Export/Import Issues

**Problem**: JSON export downloads empty file
- **Solution**: Ensure you have at least one history entry
- **Solution**: Try a different browser
- **Solution**: Check browser download settings

**Problem**: Import fails with error
- **Solution**: Verify JSON file is valid (not corrupted)
- **Solution**: Ensure file was exported from EcoCompute
- **Solution**: Try exporting again from source

**Problem**: Report image generation fails
- **Solution**: Check that html2canvas library loaded (see browser console)
- **Solution**: Try using Print/PDF instead
- **Solution**: Disable browser extensions that block scripts

### Performance Issues

**Problem**: Page loads slowly
- **Solution**: Clear browser cache
- **Solution**: Disable unnecessary browser extensions
- **Solution**: Use a modern browser (Chrome, Firefox, Edge)

**Problem**: Calculator lags when typing
- **Solution**: Close other tabs to free memory
- **Solution**: Disable Live Data simulation
- **Solution**: Clear history if you have 50+ entries

---

## FAQ

### General

**Q: Is EcoCompute free?**  
A: Yes! All current features are free. We plan to offer Pro features in the future, but the core calculator and leaderboard will remain free.

**Q: Do I need to create an account?**  
A: No. Everything works in your browser without sign-up.

**Q: Is my data private?**  
A: Yes. All data is stored locally in your browser. We don't collect or transmit any personal information.

**Q: Can I use EcoCompute offline?**  
A: Partially. The app loads from GitHub Pages, but once loaded, most features work offline. AI Analysis requires internet.

### Pricing & Costs

**Q: How accurate are the cost estimates?**  
A: We use official pricing from API providers, updated monthly. Hardware costs are estimates based on cloud provider rates. Always verify with your actual provider.

**Q: Why do costs vary from my actual bill?**  
A: Estimates don't include:
- Network egress fees
- Storage costs
- Support contracts
- Volume discounts (unless in formula)
- Regional pricing differences

**Q: Can I add custom pricing?**  
A: Yes! Use custom formulas to implement your specific pricing model.

### Models & Data

**Q: How often is model data updated?**  
A: We update benchmarks monthly. Check the "Last Updated" date in provenance tooltips.

**Q: Can I request a model be added?**  
A: Yes! Open a GitHub Issue with:
- Model name and version
- Benchmark data sources
- Hardware specifications
- Measurement methodology

**Q: Why are some metrics "estimated"?**  
A: When official benchmarks aren't available, we estimate based on:
- Similar hardware configurations
- Vendor specifications
- Academic research
- Community reports

### Features

**Q: Can I compare more than 2 configurations?**  
A: Currently limited to 2 (Plan A vs Plan B). Use History to save multiple configurations and compare manually.

**Q: Can I export data to Excel?**  
A: Export as JSON, then use a converter or write a script to transform to CSV/Excel.

**Q: Will you add more API providers?**  
A: Yes! We add new providers as they gain market share. Request via GitHub Issues.

**Q: Can I embed the calculator on my website?**  
A: Not yet, but it's on our roadmap. For now, link to our hosted version.

### Technical

**Q: What browsers are supported?**  
A: Modern browsers with ES6+ support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Q: Can I self-host EcoCompute?**  
A: Yes! Clone the GitHub repo and run `npm run build`. See TECHNICAL_DOCUMENTATION.md for details.

**Q: Is there an API?**  
A: Not yet. Currently a client-side only application.

**Q: Can I contribute code?**  
A: Yes! See CONTRIBUTING.md for guidelines. We welcome:
- Bug fixes
- New features
- Documentation improvements
- Data contributions

---

## Getting Help

### Resources

- **User Manual**: This document
- **Technical Docs**: TECHNICAL_DOCUMENTATION.md
- **Contributing Guide**: CONTRIBUTING.md
- **GitHub Issues**: https://github.com/hongping-zh/ecocompute-dynamic-eval/issues

### Contact

- **Email**: hello@ecocompute.ai
- **GitHub**: @hongping-zh
- **Website**: https://hongping-zh.github.io/ecocompute-dynamic-eval/

### Reporting Bugs

When reporting bugs, include:
1. Browser and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots if applicable
5. Console errors (F12 → Console tab)

---

## Keyboard Shortcuts

*Coming in future version*

- `Ctrl/Cmd + K`: Open calculator
- `Ctrl/Cmd + L`: Open leaderboard
- `Ctrl/Cmd + S`: Save to history
- `Ctrl/Cmd + E`: Export configuration
- `Ctrl/Cmd + /`: Open help

---

## Glossary

**API**: Application Programming Interface - how you access AI models programmatically

**Carbon Footprint**: Total CO₂ emissions from energy consumption

**Composite Score**: Weighted average of all metrics based on your priorities

**GPU**: Graphics Processing Unit - hardware that runs AI models

**kWh**: Kilowatt-hour - unit of energy consumption

**PUE**: Power Usage Effectiveness - data center efficiency metric (1.0 = perfect)

**Provenance**: Origin and history of data - where metrics come from

**Template**: Pre-configured calculator settings for common use cases

**Token**: Unit of text processed by AI models (~4 characters)

**Tokens/Watt**: Energy efficiency metric - higher is better

---

**Thank you for using EcoCompute!** 🌱

Help us improve by sharing feedback and contributing templates.

*Last updated: February 8, 2026*
