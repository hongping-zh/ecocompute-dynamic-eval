# EcoCompute Technical Documentation

**Version**: 2.0  
**Last Updated**: February 8, 2026  
**Repository**: https://github.com/hongping-zh/ecocompute-dynamic-eval  
**Live Demo**: https://hongping-zh.github.io/ecocompute-dynamic-eval/

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Feature Documentation](#feature-documentation)
4. [API Reference](#api-reference)
5. [Data Models](#data-models)
6. [Development Guide](#development-guide)
7. [Deployment](#deployment)
8. [Performance Optimization](#performance-optimization)

---

## Overview

EcoCompute is a comprehensive AI model evaluation and cost optimization platform that combines:
- Real-time model performance benchmarking
- Carbon footprint estimation
- API cost comparison and optimization
- Interactive calculators with advanced formula support
- Community-driven template library

### Tech Stack

```
Frontend:
- React 19.2.4 (Functional Components + Hooks)
- TypeScript 5.x
- TailwindCSS 3.x
- Recharts 3.7.0 (Data Visualization)
- Lucide React 0.563.0 (Icons)

Build Tools:
- Vite 6.4.1
- ESM Modules

Deployment:
- GitHub Pages
- GitHub Actions (CI/CD)

External Libraries:
- html2canvas 1.4.1 (Report Generation)
```

---

## Architecture

### Component Hierarchy

```
App.tsx (Root)
├── Leaderboard.tsx (Model Comparison)
│   ├── Data Provenance System
│   ├── Configurable Scoring Engine
│   └── Live Data Simulation
├── Calculator.tsx (Cost Estimator)
│   ├── Formula Engine
│   ├── History Management
│   ├── Template System
│   └── Report Generator
├── ApiCostComparison.tsx (SEO-Optimized Comparison)
├── Pricing.tsx (Business Model)
├── Methodology.tsx (Documentation)
├── AudioMonitor.tsx (Real-time Monitoring)
└── SettingsPanel.tsx (Configuration)
```

### State Management

```typescript
// Global App State
interface AppState {
  view: AppView;
  settingsOpen: boolean;
  apiConfig: ApiConfig;
}

// Calculator State (Extended)
interface ExtendedState extends CalculatorState {
  tokensPerDay?: number;
  apiModel?: string;
}

// Leaderboard State
interface LeaderboardState {
  models: ModelData[];
  sortField: SortField;
  sortDirection: SortDirection;
  weights: ScoringWeights;
  showWeights: boolean;
}
```

---

## Feature Documentation

### 1. Data Transparency & Provenance System

**Purpose**: Establish trust through detailed data sourcing and confidence indicators.

#### Implementation

**Data Model** (`types.ts`):
```typescript
export type DataConfidence = 'measured' | 'estimated' | 'research';

export interface DataProvenance {
  source: string;           // e.g., "MLPerf Inference v4.0"
  confidence: DataConfidence;
  methodology: string;      // Measurement approach
  lastUpdated: string;      // ISO date
  citation?: string;        // Academic reference
}

export interface ModelData {
  // ... existing fields
  provenance: DataProvenance;
}
```

**UI Components** (`Leaderboard.tsx`):
```typescript
// Confidence Badge
const ConfidenceBadge = ({ confidence }: { confidence: DataConfidence }) => {
  const config = {
    measured: { color: 'eco', icon: '✓', label: 'Measured' },
    estimated: { color: 'amber', icon: '≈', label: 'Estimated' },
    research: { color: 'blue', icon: '📄', label: 'Research' }
  };
  // ... render badge with tooltip
};

// Provenance Tooltip
<div className="tooltip">
  <strong>Source:</strong> {model.provenance.source}<br/>
  <strong>Method:</strong> {model.provenance.methodology}<br/>
  <strong>Updated:</strong> {model.provenance.lastUpdated}
</div>
```

**Data Population** (`constants.ts`):
```typescript
export const MODELS: ModelData[] = [
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    provenance: {
      source: 'DeepSeek Official Benchmark',
      confidence: 'measured',
      methodology: 'Internal testing on NVIDIA H800 cluster',
      lastUpdated: '2024-12-26',
      citation: 'https://github.com/deepseek-ai/DeepSeek-V3'
    },
    // ... other fields
  },
  // ... 21 more models
];
```

**Benefits**:
- Transparency builds user trust
- Clear distinction between measured vs estimated data
- Academic citations for research-based metrics
- Audit trail for data updates

---

### 2. Local Storage Persistence System

**Purpose**: Enable session recovery and configuration sharing without backend infrastructure.

#### Implementation

**Storage Architecture**:
```typescript
// Storage Keys
const STORAGE_KEY = 'ecocompute-calculator-state';
const HISTORY_STORAGE_KEY = 'ecocompute-calculator-history';
const MAX_HISTORY_ENTRIES = 50;

// History Entry Structure
interface HistoryEntry {
  id: string;
  timestamp: number;
  state: ExtendedState;
  label?: string;
  monthlyCost: number;
  co2: number;
}
```

**Core Functions** (`Calculator.tsx`):
```typescript
// Save current state to history
const saveToHistory = () => {
  const entry: HistoryEntry = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    state: { ...state },
    monthlyCost: results.monthlyCost,
    co2: results.co2
  };
  
  const updated = [entry, ...history].slice(0, MAX_HISTORY_ENTRIES);
  setHistory(updated);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
};

// Restore from history
const restoreFromHistory = (entry: HistoryEntry) => {
  setState(entry.state);
};

// Export history as JSON
const exportHistory = () => {
  const blob = new Blob([JSON.stringify(history, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ecocompute-history-${Date.now()}.json`;
  a.click();
};

// Import history from JSON
const importHistory = (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const imported = JSON.parse(e.target?.result as string);
    setHistory(imported);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(imported));
  };
  reader.readAsText(file);
};
```

**UI Components**:
```tsx
{/* History Panel */}
{showHistory && (
  <div className="collapsible-panel">
    <div className="actions">
      <button onClick={exportHistory}>Export</button>
      <label>
        Import
        <input type="file" accept=".json" onChange={importHistory} />
      </label>
      <button onClick={clearHistory}>Clear All</button>
    </div>
    
    <div className="history-list">
      {history.map(entry => (
        <div key={entry.id} className="history-item">
          <div className="timestamp">{new Date(entry.timestamp).toLocaleString()}</div>
          <div className="cost">${entry.monthlyCost.toFixed(2)}/mo</div>
          <button onClick={() => restoreFromHistory(entry)}>Restore</button>
        </div>
      ))}
    </div>
  </div>
)}
```

**Auto-save Mechanism**:
```typescript
// Auto-save on state change
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}, [state]);

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    setState(JSON.parse(saved));
  }
}, []);
```

---

### 3. Configurable Scoring Engine

**Purpose**: Allow users to customize model ranking based on their priorities.

#### Implementation

**Scoring Weights Model**:
```typescript
interface ScoringWeights {
  accuracy: number;      // 0-100
  speed: number;         // 0-100
  cost: number;          // 0-100
  carbon: number;        // 0-100
  efficiency: number;    // 0-100
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  accuracy: 30,
  speed: 20,
  cost: 20,
  carbon: 15,
  efficiency: 15
};
```

**Normalization & Scoring Algorithm**:
```typescript
const calculateCompositeScore = (model: ModelData): number => {
  // Min-max normalization for each metric
  const normalize = (value: number, min: number, max: number): number => {
    return max === min ? 0 : (value - min) / (max - min);
  };
  
  // Find min/max for each dimension
  const accuracyRange = { 
    min: Math.min(...models.map(m => m.accuracy)),
    max: Math.max(...models.map(m => m.accuracy))
  };
  // ... repeat for speed, cost, carbon, efficiency
  
  // Normalize (invert for cost/carbon - lower is better)
  const normalizedAccuracy = normalize(model.accuracy, accuracyRange.min, accuracyRange.max);
  const normalizedSpeed = normalize(model.executionTime, speedRange.min, speedRange.max);
  const normalizedCost = 1 - normalize(model.cost, costRange.min, costRange.max); // Inverted
  const normalizedCarbon = 1 - normalize(model.carbonImpact, carbonRange.min, carbonRange.max); // Inverted
  const normalizedEfficiency = normalize(model.energyEfficiency, effRange.min, effRange.max);
  
  // Weighted sum (normalize weights to sum to 1)
  const totalWeight = weights.accuracy + weights.speed + weights.cost + 
                      weights.carbon + weights.efficiency;
  
  const score = (
    normalizedAccuracy * (weights.accuracy / totalWeight) +
    normalizedSpeed * (weights.speed / totalWeight) +
    normalizedCost * (weights.cost / totalWeight) +
    normalizedCarbon * (weights.carbon / totalWeight) +
    normalizedEfficiency * (weights.efficiency / totalWeight)
  ) * 100;
  
  return Math.round(score * 10) / 10; // Round to 1 decimal
};
```

**UI Controls**:
```tsx
{/* Weight Configuration Panel */}
{showWeights && (
  <div className="weights-panel">
    {Object.entries(weights).map(([key, value]) => (
      <div key={key} className="weight-slider">
        <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setWeights({
            ...weights,
            [key]: parseInt(e.target.value)
          })}
        />
        <span>{value}%</span>
      </div>
    ))}
  </div>
)}

{/* Score Display in Table */}
<td className="score-cell">
  <div className="score-bar" style={{ width: `${model.compositeScore}%` }} />
  <span className="score-value">{model.compositeScore}</span>
</td>
```

**Use Cases**:
- **Cost-sensitive**: Increase cost/carbon weights
- **Performance-first**: Maximize accuracy/speed weights
- **Balanced**: Use default equal distribution
- **Green AI**: Prioritize carbon/efficiency

---

### 4. Formula Engine with Advanced Functions

**Purpose**: Enable complex billing logic with conditional statements and mathematical functions.

#### Supported Functions

```typescript
const FORMULA_FUNCTIONS = [
  { name: 'IF', syntax: 'IF(condition, then, else)', 
    example: 'IF(tokens > 1000000, (tokens - 1000000) * price, 0)' },
  { name: 'MIN', syntax: 'MIN(a, b)', 
    example: 'MIN(tokens * price, 500)' },
  { name: 'MAX', syntax: 'MAX(a, b)', 
    example: 'MAX((tokens - 100000) * price, 0)' },
  { name: 'ROUND', syntax: 'ROUND(value, decimals)', 
    example: 'ROUND(tokens * price / 1000000, 2)' },
  { name: 'ABS', syntax: 'ABS(value)' },
  { name: 'SQRT', syntax: 'SQRT(value)' },
  { name: 'LOG', syntax: 'LOG(value)' },
  { name: 'POW', syntax: 'POW(base, exp)' }
];
```

#### Formula Validation & Execution

```typescript
const validateFormula = (formula: string, vars: Record<string, number>): FormulaValidation => {
  if (!formula.trim()) return { valid: true };
  
  try {
    // Replace custom functions with JavaScript equivalents
    let expr = formula
      .replace(/\bIF\s*\(/gi, '((__c,__t,__e) => __c ? __t : __e)(')
      .replace(/\bMIN\s*\(/gi, 'Math.min(')
      .replace(/\bMAX\s*\(/gi, 'Math.max(')
      .replace(/\bROUND\s*\(/gi, '((__v,__d=0) => Math.round(__v * 10**__d) / 10**__d)(')
      .replace(/\bABS\s*\(/gi, 'Math.abs(')
      .replace(/\bSQRT\s*\(/gi, 'Math.sqrt(')
      .replace(/\bLOG\s*\(/gi, 'Math.log(')
      .replace(/\bPOW\s*\(/gi, 'Math.pow(');
    
    // Replace variables with values
    Object.entries(vars).forEach(([name, value]) => {
      expr = expr.replace(new RegExp(`\\b${name}\\b`, 'g'), value.toString());
    });
    
    // Safe evaluation using Function constructor
    const fn = new Function('Math', `"use strict"; return (${expr});`);
    const result = fn(Math);
    
    if (typeof result !== 'number' || !isFinite(result)) {
      return { valid: false, error: 'Formula must return a finite number' };
    }
    
    return { valid: true, result };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
};
```

#### Real-time Formula Preview

```tsx
{/* Formula Preview Component */}
{customFormula && (
  <div className="formula-preview">
    <div className="preview-label">Preview:</div>
    <div className="preview-content">
      {(() => {
        let preview = customFormula;
        // Highlight variables with actual values
        Object.entries(formulaVars).forEach(([name, val]) => {
          preview = preview.replace(
            new RegExp(`\\b${name}\\b`, 'g'),
            `<span class="var-highlight">${val}</span>`
          );
        });
        // Highlight function names
        preview = preview.replace(
          /\b(IF|MIN|MAX|ROUND|ABS|SQRT|LOG|POW)\b/g,
          '<span class="func-highlight">$1</span>'
        );
        return <span dangerouslySetInnerHTML={{ __html: preview }} />;
      })()}
    </div>
  </div>
)}
```

#### Example Use Cases

**Free Tier Billing**:
```javascript
// Charge only for tokens exceeding 1M/day
IF(tokens > 1000000, (tokens - 1000000) * input_price / 1000000, 0)
```

**Volume Discount**:
```javascript
// 10% discount for high volume
tokens * input_price / 1000000 * IF(tokens > 5000000, 0.9, 1.0)
```

**Cost Cap**:
```javascript
// Maximum $500/month
MIN(tokens * input_price / 1000000 * 30, 500)
```

**Minimum Charge**:
```javascript
// At least $10/month
MAX(tokens * input_price / 1000000 * 30, 10)
```

---

### 5. Professional Report Generation

**Purpose**: Generate shareable report images for presentations and documentation.

#### Implementation

**Report Structure**:
```typescript
const generateReportImage = async () => {
  // Create off-screen container
  const reportContainer = document.createElement('div');
  reportContainer.style.cssText = `
    position: fixed; 
    left: -9999px; 
    width: 800px; 
    background: white; 
    padding: 32px;
  `;
  
  // Build HTML report
  reportContainer.innerHTML = `
    <!-- Header with gradient -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                padding: 24px; border-radius: 16px;">
      <h1 style="color: white; font-size: 28px;">EcoCompute Analysis Report</h1>
      <p style="color: rgba(255,255,255,0.9);">${new Date().toLocaleDateString()}</p>
    </div>
    
    <!-- Configuration Summary -->
    <div style="background: #f8fafc; padding: 20px; margin-top: 20px;">
      <h2>Configuration</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div><strong>Hardware:</strong> ${hw?.label}</div>
        <div><strong>GPU Count:</strong> ${state.count}</div>
        <div><strong>API Model:</strong> ${pricing.name}</div>
        <div><strong>Tokens/Day:</strong> ${state.tokensPerDay?.toLocaleString()}</div>
      </div>
    </div>
    
    <!-- Cost Cards -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px;">
      <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); 
                  padding: 20px; border-radius: 12px;">
        <div style="font-size: 12px; color: #059669;">DAILY COST</div>
        <div style="font-size: 32px; font-weight: bold;">${formatCurrency(results.dailyCost)}</div>
      </div>
      <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); 
                  padding: 20px; border-radius: 12px;">
        <div style="font-size: 12px; color: #7c3aed;">MONTHLY COST</div>
        <div style="font-size: 32px; font-weight: bold;">${formatCurrency(results.monthlyCost)}</div>
      </div>
    </div>
    
    <!-- Key Insight -->
    <div style="background: #fef3c7; padding: 20px; margin-top: 20px; 
                border-left: 4px solid #f59e0b;">
      <div style="font-weight: bold; margin-bottom: 8px;">💡 Key Insight</div>
      <p>${insight.main}</p>
      <p style="font-size: 12px;">${insight.detail}</p>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
      Generated by EcoCompute · https://hongping-zh.github.io/ecocompute-dynamic-eval/
    </div>
  `;
  
  document.body.appendChild(reportContainer);
  
  try {
    // Use html2canvas to render
    const canvas = await (window as any).html2canvas(reportContainer, {
      backgroundColor: '#ffffff',
      scale: 2, // High DPI
    });
    
    // Convert to downloadable image
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecocompute-report-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  } finally {
    document.body.removeChild(reportContainer);
  }
};
```

**Dependencies**:
```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
```

**Output Format**:
- PNG image (800px width, variable height)
- 2x scale for retina displays
- Embedded branding and timestamp
- Ready for PowerPoint/Notion/Slack

---

### 6. Community Template System

**Purpose**: Enable users to share and discover calculator configurations.

#### Workflow

```
User configures calculator
    ↓
Clicks "Share Template" button
    ↓
Opens pre-filled GitHub Issue
    ↓
User adds context (use case, industry)
    ↓
Submits issue with "template" label
    ↓
Maintainers review
    ↓
Approved templates merged to PRESET_TEMPLATES
    ↓
Available in template gallery
```

#### Implementation

**Share Function** (`Calculator.tsx`):
```typescript
const shareAsTemplate = () => {
  const hw = HARDWARE_OPTIONS.find(h => h.value === state.hardware);
  const pricing = API_PRICING[state.apiModel as keyof typeof API_PRICING];
  
  const templateData = {
    hardware: state.hardware,
    hardwareLabel: hw?.label || state.hardware,
    count: state.count,
    hours: state.hours,
    pue: state.pue,
    apiModel: state.apiModel,
    apiModelName: pricing.name,
    tokensPerDay: state.tokensPerDay || 100000,
    monthlyCost: results.monthlyCost,
    co2: results.co2,
  };
  
  const issueTitle = `[Template] ${pricing.name} - ${(templateData.tokensPerDay / 1000000).toFixed(1)}M tokens/day`;
  
  const issueBody = `
## Template Submission

**Use Case Name**: [Please describe, e.g., "Customer Support Chatbot"]
**Category**: [Software Engineering / Customer Support / Content Creation / Research / Education / Enterprise]
**Description**: [Explain scenario, team size, workload pattern]

---

### Configuration
- **API Model**: ${templateData.apiModelName}
- **Tokens/Day**: ${templateData.tokensPerDay.toLocaleString()}
- **Hardware**: ${templateData.hardwareLabel}
- **GPU Count**: ${templateData.count}
- **Hours/Day**: ${templateData.hours}
- **PUE**: ${templateData.pue}

### Estimated Costs
- **Monthly Cost**: $${templateData.monthlyCost.toFixed(2)}
- **Daily CO₂**: ${templateData.co2.toFixed(2)} kg

---

### Template Code
\`\`\`typescript
{
  id: 'your-template-id',
  name: 'Your Template Name',
  description: 'Brief description',
  config: {
    hardware: '${templateData.hardware}',
    count: ${templateData.count},
    hours: ${templateData.hours},
    pue: ${templateData.pue},
    region: 'global'
  },
  tokensPerDay: ${templateData.tokensPerDay},
  apiModel: '${templateData.apiModel}',
  gallery: true,
  galleryCategory: 'Your Category',
  galleryIcon: '🎯',
  galleryColor: 'indigo'
}
\`\`\`

**Checklist**:
- [ ] I've tested this configuration
- [ ] The use case is realistic
- [ ] I've provided context
  `;
  
  const githubUrl = `https://github.com/hongping-zh/ecocompute-dynamic-eval/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=template`;
  window.open(githubUrl, '_blank');
};
```

**CONTRIBUTING.md Guidelines**:
- Template quality standards
- Submission process (Issue vs PR)
- Review criteria
- Contributor recognition

**Benefits**:
- Zero backend infrastructure
- GitHub-native workflow
- Community moderation
- Version control for templates

---

### 7. SEO-Optimized API Cost Comparison Page

**Purpose**: Capture organic search traffic for "AI API cost comparison" queries.

#### SEO Strategy

**Target Keywords**:
- Primary: "AI API cost comparison", "AI model pricing calculator"
- Secondary: "GPT-4 pricing", "Claude API cost", "Gemini pricing"
- Long-tail: "cheapest AI API", "how much does GPT-4 cost", "AI cost optimization"

**On-Page Optimization**:
```html
<!-- index.html -->
<title>AI API Cost Comparison 2026 | EcoCompute - Compare GPT-4, Claude, Gemini, DeepSeek Pricing</title>
<meta name="description" content="Compare AI API costs across GPT-4, Claude, Gemini, DeepSeek, and Llama. Interactive calculator shows real-time pricing, carbon footprint, and potential savings. Find the cheapest AI model for your use case." />
<meta name="keywords" content="AI API cost comparison, GPT-4 pricing, Claude API cost, Gemini pricing, DeepSeek cost, LLM API comparison, AI model pricing calculator, cheapest AI API, OpenAI pricing, Anthropic pricing, Google AI pricing, AI cost optimization..." />
```

**Content Structure** (`ApiCostComparison.tsx`):
```tsx
export const ApiCostComparison: React.FC = () => {
  return (
    <div>
      {/* H1 with primary keyword */}
      <h1>AI API Cost Comparison 2026: Complete Guide</h1>
      
      {/* Interactive calculator for engagement */}
      <div className="calculator">
        <input type="range" /* tokens/day slider */ />
        <table>
          {/* 8 models with pricing data */}
        </table>
      </div>
      
      {/* Long-form content for SEO */}
      <section>
        <h2>How to Choose the Right AI API for Your Budget</h2>
        <p>For high-volume chatbots (1M+ tokens/day): Gemini 2.0 Flash...</p>
        <p>For complex reasoning tasks: DeepSeek-V3 provides...</p>
      </section>
      
      {/* Real-world scenarios */}
      <section>
        <h2>Real-World Cost Scenarios</h2>
        <div>Customer Support Chatbot: $27/mo with GPT-4o-mini</div>
        <div>Code Review Assistant: $8/mo with DeepSeek-V3</div>
      </section>
      
      {/* FAQ for long-tail keywords */}
      <section>
        <h2>Frequently Asked Questions</h2>
        <div>
          <h3>What is the cheapest AI API in 2026?</h3>
          <p>Gemini 2.0 Flash at $0.10/$0.40 per million tokens...</p>
        </div>
        <div>
          <h3>How much does GPT-4 API cost per month?</h3>
          <p>GPT-4o costs $2.50 input / $10.00 output...</p>
        </div>
      </section>
      
      {/* CTA to full calculator */}
      <div className="cta">
        <a href="#calculator">Open Full Calculator</a>
      </div>
    </div>
  );
};
```

**Structured Data** (Future Enhancement):
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "EcoCompute API Cost Calculator",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

**Content Depth**:
- 8 model comparison table
- Interactive cost calculator
- 4 real-world scenarios
- 4 FAQ entries
- Key insights cards
- CTA to full platform

---

## API Reference

### Calculator State Management

```typescript
// Initialize calculator
const [state, setState] = useState<ExtendedState>({
  hardware: 'rtx5090',
  count: 1,
  hours: 24,
  pue: 1.2,
  region: 'global',
  tokensPerDay: 100000,
  apiModel: 'deepseek-v3'
});

// Calculate results
const results = useMemo(() => calculateResults(state), [state]);

// Update single field
const handleChange = (field: keyof ExtendedState, value: string | number) => {
  setState(prev => ({ ...prev, [field]: value }));
};
```

### Formula Evaluation

```typescript
// Validate and execute formula
const validation = validateFormula(
  'IF(tokens > 1000000, (tokens - 1000000) * 0.27 / 1000000, 0)',
  { tokens: 2000000 }
);

if (validation.valid) {
  console.log('Result:', validation.result); // 0.27
} else {
  console.error('Error:', validation.error);
}
```

### History Management

```typescript
// Save to history
saveToHistory(); // Adds current state to history

// Restore from history
restoreFromHistory(historyEntry);

// Export history
exportHistory(); // Downloads JSON file

// Import history
importHistory(fileInputEvent);

// Clear history
clearHistory();
```

### Report Generation

```typescript
// Generate PNG report
await generateReportImage();
// Downloads: ecocompute-report-1707350400000.png

// Print PDF report
printReport();
// Opens browser print dialog
```

---

## Data Models

### ModelData

```typescript
interface ModelData {
  id: string;
  name: string;
  accuracy: number;          // 0-100
  executionTime: number;     // seconds
  cost: number;              // USD
  carbonImpact: number;      // kg CO2
  energyEfficiency: number;  // tokens/watt
  hardware: string;
  provenance: DataProvenance;
  compositeScore?: number;   // Calculated
}
```

### DataProvenance

```typescript
interface DataProvenance {
  source: string;
  confidence: 'measured' | 'estimated' | 'research';
  methodology: string;
  lastUpdated: string;       // ISO 8601
  citation?: string;
}
```

### ExtendedState

```typescript
interface ExtendedState extends CalculatorState {
  tokensPerDay?: number;
  apiModel?: string;
}

interface CalculatorState {
  hardware: string;
  count: number;
  hours: number;
  pue: number;
  region: string;
}
```

### ScoringWeights

```typescript
interface ScoringWeights {
  accuracy: number;    // 0-100
  speed: number;       // 0-100
  cost: number;        // 0-100
  carbon: number;      // 0-100
  efficiency: number;  // 0-100
}
```

---

## Development Guide

### Setup

```bash
# Clone repository
git clone https://github.com/hongping-zh/ecocompute-dynamic-eval.git
cd ecocompute-dynamic-eval

# Install dependencies
npm install

# Start dev server
npm run dev
# Open http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
ecocompute-dynamic-eval/
├── components/
│   ├── Calculator.tsx           # Main cost calculator
│   ├── Leaderboard.tsx          # Model comparison table
│   ├── ApiCostComparison.tsx    # SEO-optimized page
│   ├── Pricing.tsx              # Business model page
│   ├── Methodology.tsx          # Documentation
│   ├── AudioMonitor.tsx         # Real-time monitoring
│   └── SettingsPanel.tsx        # Configuration
├── constants.ts                 # Model data, pricing, templates
├── types.ts                     # TypeScript interfaces
├── App.tsx                      # Root component
├── index.tsx                    # Entry point
├── index.html                   # HTML template
├── index.css                    # Global styles
├── vite.config.ts               # Vite configuration
├── CONTRIBUTING.md              # Contribution guidelines
└── TECHNICAL_DOCUMENTATION.md   # This file
```

### Adding a New Model

1. **Add model data** (`constants.ts`):
```typescript
export const MODELS: ModelData[] = [
  // ... existing models
  {
    id: 'new-model-id',
    name: 'New Model Name',
    accuracy: 85.5,
    executionTime: 2.3,
    cost: 150,
    carbonImpact: 12.5,
    energyEfficiency: 450,
    hardware: 'H100',
    provenance: {
      source: 'Official Benchmark',
      confidence: 'measured',
      methodology: 'Internal testing',
      lastUpdated: '2026-02-08',
      citation: 'https://example.com/benchmark'
    }
  }
];
```

2. **Update API pricing** (if applicable):
```typescript
export const API_PRICING = {
  // ... existing models
  'new-model-api': {
    name: 'New Model API',
    input: 1.50,
    output: 6.00
  }
};
```

3. **Test in Leaderboard**:
- Verify sorting works correctly
- Check provenance badge displays
- Confirm composite score calculation

### Adding a Template

1. **Add to PRESET_TEMPLATES** (`constants.ts`):
```typescript
export const PRESET_TEMPLATES = [
  // ... existing templates
  {
    id: 'new-template',
    name: 'New Use Case',
    description: 'Description of the use case',
    config: {
      hardware: 'rtx5090',
      count: 2,
      hours: 16,
      pue: 1.3,
      region: 'global'
    },
    tokensPerDay: 500000,
    apiModel: 'deepseek-v3',
    gallery: true,
    galleryCategory: 'Software Engineering',
    galleryIcon: '🚀',
    galleryColor: 'indigo'
  }
];
```

2. **Test template**:
- Load template in Calculator
- Verify all fields populate correctly
- Check cost calculations

### Testing Formula Engine

```typescript
// Test basic arithmetic
validateFormula('tokens * 2', { tokens: 1000 });
// Expected: { valid: true, result: 2000 }

// Test IF function
validateFormula('IF(tokens > 1000, 100, 50)', { tokens: 1500 });
// Expected: { valid: true, result: 100 }

// Test MIN/MAX
validateFormula('MIN(tokens, 5000)', { tokens: 10000 });
// Expected: { valid: true, result: 5000 }

// Test error handling
validateFormula('tokens / 0', { tokens: 1000 });
// Expected: { valid: false, error: '...' }
```

---

## Deployment

### GitHub Pages (Current)

**Configuration** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Base Path** (`vite.config.ts`):
```typescript
export default defineConfig({
  base: '/ecocompute-dynamic-eval/',
  // ... other config
});
```

### Manual Deployment

```bash
# Build production bundle
npm run build

# Output in dist/ directory
# - dist/index.html
# - dist/assets/index-[hash].js
# - dist/assets/index-[hash].css

# Deploy to any static host
# - Netlify: drag dist/ folder
# - Vercel: import GitHub repo
# - Cloudflare Pages: connect repo
```

---

## Performance Optimization

### Bundle Size

**Current**: 1,025 KB (272 KB gzipped)

**Optimization Strategies**:

1. **Code Splitting** (Future):
```typescript
// Lazy load heavy components
const ApiCostComparison = lazy(() => import('./components/ApiCostComparison'));
const AudioMonitor = lazy(() => import('./components/AudioMonitor'));
```

2. **Tree Shaking**:
```typescript
// Import only needed icons
import { Leaf, Cloud, Download } from 'lucide-react';
// Instead of: import * as Icons from 'lucide-react';
```

3. **Chart Optimization**:
```typescript
// Use ResponsiveContainer to prevent unnecessary re-renders
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    {/* ... */}
  </BarChart>
</ResponsiveContainer>
```

### Rendering Performance

**Memoization**:
```typescript
// Expensive calculations
const results = useMemo(() => calculateResults(state), [state]);
const compositeScore = useMemo(() => calculateCompositeScore(model, weights), [model, weights]);

// Callback stability
const handleChange = useCallback((field, value) => {
  setState(prev => ({ ...prev, [field]: value }));
}, []);
```

**Virtual Scrolling** (Future for large model lists):
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={models.length}
  itemSize={60}
>
  {({ index, style }) => (
    <div style={style}>{models[index].name}</div>
  )}
</FixedSizeList>
```

### LocalStorage Optimization

```typescript
// Debounce auto-save
const debouncedSave = useMemo(
  () => debounce((state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, 500),
  []
);

useEffect(() => {
  debouncedSave(state);
}, [state, debouncedSave]);
```

---

## Changelog

### Version 2.0 (February 8, 2026)

**New Features**:
- ✅ Data provenance system with confidence badges
- ✅ Local storage persistence with history management
- ✅ Configurable scoring weights (5 dimensions)
- ✅ Pricing page with tier comparison
- ✅ Competitive differentiation section
- ✅ Real-time formula preview
- ✅ Professional report image generation
- ✅ Advanced formula functions (IF/MIN/MAX)
- ✅ Community template submission system
- ✅ SEO-optimized API cost comparison page

**Improvements**:
- Enhanced formula validation with better error messages
- Improved UI responsiveness on mobile devices
- Added tooltips for all provenance data
- Optimized bundle size (tree shaking)

**Bug Fixes**:
- Fixed formula parsing for nested IF statements
- Corrected min-max normalization edge cases
- Resolved localStorage quota exceeded errors

### Version 1.0 (December 2025)

- Initial release
- Basic calculator functionality
- Model leaderboard
- Real-time monitoring
- Template system

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on:
- Submitting calculator templates
- Reporting bugs
- Requesting features
- Contributing data

---

## License

MIT License - See LICENSE file for details

---

## Support

- **GitHub Issues**: https://github.com/hongping-zh/ecocompute-dynamic-eval/issues
- **Email**: hello@ecocompute.ai
- **Documentation**: This file

---

**Last Updated**: February 8, 2026  
**Maintainer**: @hongping-zh  
**Contributors**: Community (see GitHub contributors page)
