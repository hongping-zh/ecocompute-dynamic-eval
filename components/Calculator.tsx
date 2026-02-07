import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CalculatorState } from '../types';
import { HARDWARE_OPTIONS } from '../constants';
import { Leaf, Cloud, Download, Upload, RotateCcw, BookOpen, ChevronDown, ChevronUp, Sparkles, GitCompare, X, Link2, Check, TrendingUp, AlertTriangle, Printer, HelpCircle, Code2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, ReferenceLine, ReferenceDot } from 'recharts';

// ============================================================
// 公式语法检查器 + 安全求值
// ============================================================
interface FormulaValidation {
  valid: boolean;
  error?: string;
  result?: number;
}

const FORMULA_VARS: Record<string, string> = {
  tokens: 'Tokens/Day',
  input_price: 'Input price ($/1M)',
  output_price: 'Output price ($/1M)',
  gpu_count: 'GPU count',
  hours: 'Hours/Day',
  pue: 'PUE value',
  power: 'GPU power (W)',
};

const FORMULA_FUNCTIONS: { name: string; syntax: string; desc: string; example: string }[] = [
  { name: 'IF', syntax: 'IF(cond, then, else)', desc: 'Conditional logic', example: 'IF(tokens > 1000000, 0.9, 1.0)' },
  { name: 'MIN', syntax: 'MIN(a, b)', desc: 'Minimum of two values', example: 'MIN(tokens * 0.001, 500)' },
  { name: 'MAX', syntax: 'MAX(a, b)', desc: 'Maximum of two values', example: 'MAX(tokens * 0.0001, 10)' },
  { name: 'ROUND', syntax: 'ROUND(value, decimals)', desc: 'Round to N decimals', example: 'ROUND(tokens * input_price / 1000000, 2)' },
  { name: 'ABS', syntax: 'ABS(value)', desc: 'Absolute value', example: 'ABS(input_price - output_price)' },
  { name: 'SQRT', syntax: 'SQRT(value)', desc: 'Square root', example: 'SQRT(gpu_count) * 100' },
  { name: 'LOG', syntax: 'LOG(value)', desc: 'Natural logarithm', example: 'LOG(tokens) * 10' },
  { name: 'POW', syntax: 'POW(base, exp)', desc: 'Power function', example: 'POW(gpu_count, 0.8) * 100' },
];

const validateFormula = (formula: string, vars: Record<string, number>): FormulaValidation => {
  if (!formula.trim()) return { valid: true };

  // Check balanced parentheses
  let depth = 0;
  for (const ch of formula) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) return { valid: false, error: 'Syntax error: unexpected closing parenthesis ")"' };
  }
  if (depth > 0) return { valid: false, error: `Syntax error: missing ${depth} closing parenthesis ")"` };

  // Check for dangerous patterns
  if (/\b(eval|Function|window|document|fetch|import|require)\b/i.test(formula)) {
    return { valid: false, error: 'Security error: forbidden keyword detected' };
  }

  try {
    // Replace custom functions with JS equivalents
    let expr = formula
      .replace(/\bIF\s*\(/gi, '((__c,__t,__e) => __c ? __t : __e)(')
      .replace(/\bMIN\s*\(/gi, 'Math.min(')
      .replace(/\bMAX\s*\(/gi, 'Math.max(')
      .replace(/\bROUND\s*\(/gi, '((__v,__d) => { const __f=Math.pow(10,__d); return Math.round(__v*__f)/__f; })(')
      .replace(/\bABS\s*\(/gi, 'Math.abs(')
      .replace(/\bSQRT\s*\(/gi, 'Math.sqrt(')
      .replace(/\bLOG\s*\(/gi, 'Math.log(')
      .replace(/\bPOW\s*\(/gi, 'Math.pow(');

    // Replace variable names with values
    for (const [name, val] of Object.entries(vars)) {
      expr = expr.replace(new RegExp(`\\b${name}\\b`, 'g'), String(val));
    }

    // Check for remaining unknown identifiers (except Math)
    const unknowns = expr.match(/\b[a-zA-Z_]\w*\b/g)?.filter(
      id => !['Math', 'min', 'max', 'abs', 'sqrt', 'log', 'pow', 'round', 'true', 'false', 'Infinity', 'NaN'].includes(id)
        && !id.startsWith('__')
    );
    if (unknowns && unknowns.length > 0) {
      return { valid: false, error: `Unknown variable: "${unknowns[0]}". Available: ${Object.keys(vars).join(', ')}` };
    }

    // Safe eval via Function constructor (no access to global scope)
    const fn = new Function('Math', `"use strict"; return (${expr});`);
    const result = fn(Math);

    if (typeof result !== 'number' || isNaN(result)) {
      return { valid: false, error: 'Formula returned non-numeric result' };
    }
    if (!isFinite(result)) {
      return { valid: false, error: 'Formula returned Infinity (division by zero?)' };
    }

    return { valid: true, result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    // Make error messages more user-friendly
    if (msg.includes('Unexpected token')) {
      return { valid: false, error: `Syntax error: unexpected character near "${msg.split("'")[1] || '?'}"` };
    }
    return { valid: false, error: `Formula error: ${msg}` };
  }
};

// ============================================================
// Slider + Number Input 双向绑定组件
// ============================================================
interface SliderInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  presets?: { label: string; value: number }[];
  formatDisplay?: (v: number) => string;
}

const SliderInput: React.FC<SliderInputProps> = ({ label, value, onChange, min, max, step, unit, presets, formatDisplay }) => {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => { setInputValue(String(value)); }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    } else if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
      setInputValue(String(clamped));
    } else {
      setInputValue(String(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleInputBlur();
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <span className="text-xs text-slate-500">{formatDisplay ? formatDisplay(value) : `${value} ${unit}`}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco-500"
        />
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-20 p-1.5 bg-slate-50 border border-slate-200 rounded text-sm text-right font-mono"
          />
          <span className="text-xs text-slate-400 w-8">{unit}</span>
        </div>
      </div>
      {presets && (
        <div className="flex gap-1 flex-wrap">
          {presets.map(p => (
            <button
              key={p.value}
              onClick={() => onChange(p.value)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${value === p.value ? 'bg-eco-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 公式引擎：IF / MIN / MAX / 阶梯计费
// ============================================================
interface FormulaError {
  message: string;
  field?: string;
}

const validateInputs = (s: { tokensPerDay?: number; count: number; hours: number; pue: number }): FormulaError | null => {
  if ((s.tokensPerDay || 0) < 0) return { message: 'Tokens/Day cannot be negative', field: 'tokensPerDay' };
  if (s.count < 1 || s.count > 1000) return { message: 'GPU count must be 1-1000', field: 'count' };
  if (s.hours < 0.1 || s.hours > 24) return { message: 'Hours must be 0.1-24', field: 'hours' };
  if (s.pue < 1 || s.pue > 3) return { message: 'PUE must be 1.0-3.0', field: 'pue' };
  return null;
};

// 阶梯计费函数：超过阈值后应用折扣
const tieredCost = (tokens: number, baseInputPrice: number, baseOutputPrice: number): number => {
  // 阶梯定价：>5M tokens/day 享受 10% 折扣，>20M 享受 20% 折扣
  const avgPrice = (baseInputPrice + baseOutputPrice) / 2;
  const dailyMTokens = tokens / 1_000_000;

  if (dailyMTokens <= 5) {
    return dailyMTokens * avgPrice;
  } else if (dailyMTokens <= 20) {
    const base = 5 * avgPrice;
    const discounted = (dailyMTokens - 5) * avgPrice * 0.9;
    return base + discounted;
  } else {
    const tier1 = 5 * avgPrice;
    const tier2 = 15 * avgPrice * 0.9;
    const tier3 = (dailyMTokens - 20) * avgPrice * 0.8;
    return tier1 + tier2 + tier3;
  }
};

// 碳排放惩罚系数：超过阈值后碳税增加
const carbonPenalty = (co2Kg: number): number => {
  // >100 kg/day: 1.2x penalty; >500 kg/day: 1.5x penalty
  if (co2Kg > 500) return co2Kg * 1.5;
  if (co2Kg > 100) return co2Kg * 1.2;
  return co2Kg;
};

// 数值格式化工具
const formatCurrency = (value: number): string => {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(4)}`;
};

const formatNumber = (value: number, unit: string): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ${unit}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K ${unit}`;
  return `${value.toFixed(1)} ${unit}`;
};

// URL 分享功能
const encodeStateToURL = (state: any, compareState: any): string => {
  try {
    const data = { s: state, c: compareState };
    const encoded = btoa(JSON.stringify(data));
    return `${window.location.origin}${window.location.pathname}?data=${encoded}`;
  } catch (e) {
    console.error('Failed to encode state');
    return window.location.href;
  }
};

const decodeStateFromURL = (): { state: any; compareState: any } | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      const decoded = JSON.parse(atob(data));
      return { state: decoded.s, compareState: decoded.c };
    }
  } catch (e) {
    console.error('Failed to decode URL state');
  }
  return null;
};

// API Cost Data ($/1M tokens) - Feb 2026 Latest Pricing
const API_PRICING = {
  'deepseek-v3': { input: 0.27, output: 1.10, name: 'DeepSeek-V3 (671B)', desc: 'Full MoE Architecture' },
  'deepseek-v3-lite': { input: 0.07, output: 0.28, name: 'DeepSeek-V3-Lite', desc: 'Distilled, Best Value' },
  'deepseek-r1': { input: 0.55, output: 2.19, name: 'DeepSeek-R1', desc: 'Reasoning Enhanced' },
  'gpt-4o': { input: 2.50, output: 10.00, name: 'GPT-4o', desc: 'OpenAI Flagship' },
  'gpt-4o-mini': { input: 0.15, output: 0.60, name: 'GPT-4o-mini', desc: 'OpenAI Lightweight' },
  'claude-3.5-sonnet': { input: 3.00, output: 15.00, name: 'Claude 3.5 Sonnet', desc: 'Anthropic Flagship' },
  'gemini-1.5-flash': { input: 0.075, output: 0.30, name: 'Gemini 1.5 Flash', desc: 'Google Fast' },
  'gemini-2.0-flash': { input: 0.10, output: 0.40, name: 'Gemini 2.0 Flash', desc: 'Google Latest' },
};

// Preset Template Library - DeepSeek featured cases first
const PRESET_TEMPLATES = [
  // ⭐ Featured: DeepSeek API Cost Calculator
  {
    id: 'deepseek-api-cost',
    name: '⭐ DeepSeek API Cost Calculator',
    description: 'Compare real cost differences between DeepSeek V3 Full vs Distilled',
    config: { hardware: 'rtx5090', count: 1, hours: 24, pue: 1.2, region: 'global' },
    apiModel: 'deepseek-v3',
    compareModel: 'deepseek-v3-lite',
    tokensPerDay: 1000000,
    featured: true
  },
  {
    id: 'deepseek-vs-gpt',
    name: '🔥 DeepSeek vs GPT-4o Cost Comparison',
    description: 'How much can DeepSeek save at comparable quality?',
    config: { hardware: 'a100', count: 1, hours: 24, pue: 1.2, region: 'global' },
    apiModel: 'deepseek-v3',
    compareModel: 'gpt-4o',
    tokensPerDay: 500000
  },
  {
    id: 'deepseek-r1-compare',
    name: '🧠 DeepSeek-R1 Reasoning Cost',
    description: 'R1 Reasoning Enhanced vs Standard V3',
    config: { hardware: 'h100', count: 1, hours: 24, pue: 1.1, region: 'global' },
    apiModel: 'deepseek-r1',
    compareModel: 'deepseek-v3',
    tokensPerDay: 200000
  },
  {
    id: 'startup-api-budget',
    name: '🚀 Startup API Budget',
    description: 'Monthly cost estimate for 1M tokens/day',
    config: { hardware: 'a100', count: 2, hours: 24, pue: 1.3, region: 'global' },
    apiModel: 'deepseek-v3-lite',
    tokensPerDay: 1000000
  },
  {
    id: 'enterprise-scale',
    name: '🏢 Enterprise Scale',
    description: 'Cost comparison for 10M tokens/day',
    config: { hardware: 'h100', count: 8, hours: 24, pue: 1.2, region: 'global' },
    apiModel: 'deepseek-v3',
    compareModel: 'claude-3.5-sonnet',
    tokensPerDay: 10000000
  },
  {
    id: 'personal-dev',
    name: '👨‍💻 Personal Developer Daily',
    description: 'Monthly cost for light usage scenarios',
    config: { hardware: 't4', count: 1, hours: 8, pue: 1.2, region: 'global' },
    apiModel: 'gemini-1.5-flash',
    tokensPerDay: 50000
  },
  // ========== Template Gallery - Industry Templates ==========
  {
    id: 'infra-deepseek-openai',
    name: '🏗️ AI Infrastructure: DeepSeek vs OpenAI Deep Cost Evaluation',
    description: 'Enterprise AI infrastructure selection: 5M tokens/day, 8×H100 cluster, DeepSeek-V3 vs GPT-4o full-spectrum comparison',
    config: { hardware: 'h100', count: 8, hours: 24, pue: 1.15, region: 'global' },
    apiModel: 'deepseek-v3',
    compareModel: 'gpt-4o',
    tokensPerDay: 5000000,
    featured: true,
    gallery: true,
    galleryCategory: 'AI Infrastructure',
    galleryIcon: '🏗️',
    galleryColor: 'indigo'
  },
  {
    id: 'carbon-quota-trading',
    name: '🌍 Energy & Environment: Carbon Quota Trading Forecast',
    description: 'Large-scale GPU cluster carbon assessment: 16×A100 running 24/7, comparing efficient vs standard PUE carbon cost',
    config: { hardware: 'a100', count: 16, hours: 24, pue: 1.4, region: 'global' },
    apiModel: 'deepseek-v3',
    compareModel: 'claude-3.5-sonnet',
    tokensPerDay: 10000000,
    gallery: true,
    galleryCategory: 'Energy & Environment',
    galleryIcon: '🌍',
    galleryColor: 'emerald'
  },
  {
    id: 'freelancer-net-income',
    name: '💼 Software Engineering: Freelancer Net Income Modeling',
    description: 'Freelance developer AI tool cost analysis: 100K tokens/day, Gemini Flash vs GPT-4o-mini monthly net cost',
    config: { hardware: 't4', count: 1, hours: 10, pue: 1.2, region: 'global' },
    apiModel: 'gemini-2.0-flash',
    compareModel: 'gpt-4o-mini',
    tokensPerDay: 100000,
    gallery: true,
    galleryCategory: 'Software Engineering',
    galleryIcon: '💼',
    galleryColor: 'amber'
  }
];

// 本地存储 key
const STORAGE_KEY = 'ecocompute_calculator_state';

// 扩展状态类型
interface ExtendedState extends CalculatorState {
  tokensPerDay?: number;
  apiModel?: string;
}

export const Calculator: React.FC = () => {
  // 从本地存储加载初始状态
  // 默认加载 DeepSeek 主推案例
  const getDefaultState = (): ExtendedState => ({
    hardware: 'rtx5090', 
    count: 1, 
    hours: 24, 
    pue: 1.2, 
    region: 'global', 
    tokensPerDay: 1000000, 
    apiModel: 'deepseek-v3'
  });

  const getDefaultCompareState = (): ExtendedState => ({
    hardware: 'rtx5090', 
    count: 1, 
    hours: 24, 
    pue: 1.2, 
    region: 'global', 
    tokensPerDay: 1000000, 
    apiModel: 'deepseek-v3-lite'
  });

  const loadSavedState = (): ExtendedState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved calculator state');
    }
    return getDefaultState();
  };

  // 从 URL 或本地存储加载状态
  const loadInitialState = () => {
    const urlState = decodeStateFromURL();
    if (urlState?.state) return urlState.state;
    return loadSavedState();
  };

  const loadInitialCompareState = () => {
    const urlState = decodeStateFromURL();
    if (urlState?.compareState) return urlState.compareState;
    return getDefaultCompareState();
  };

  const [state, setState] = useState<ExtendedState>(loadInitialState);
  const [compareState, setCompareState] = useState<ExtendedState | null>(loadInitialCompareState);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showChart, setShowChart] = useState<'pie' | 'bar' | 'compare' | null>('compare');
  const [configCollapsed, setConfigCollapsed] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [customFormula, setCustomFormula] = useState('');
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const formulaInputRef = useRef<HTMLTextAreaElement>(null);

  // 点击外部关闭模板下拉菜单
  useEffect(() => {
    if (!showTemplates) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(e.target as Node)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTemplates]);
  const templateAppliedRef = useRef(false);

  useEffect(() => {
    if (templateAppliedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    if (params.has('data')) return;

    const templateId = params.get('template');
    if (!templateId) return;

    const template = PRESET_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const nextState: ExtendedState = {
      ...template.config,
      tokensPerDay: (template as any).tokensPerDay || 100000,
      apiModel: (template as any).apiModel || 'deepseek-v3'
    };
    setState(nextState);

    if ((template as any).compareModel) {
      setCompareState({
        ...template.config,
        tokensPerDay: (template as any).tokensPerDay || 100000,
        apiModel: (template as any).compareModel
      });
      setShowChart('compare');
    }

    templateAppliedRef.current = true;
  }, []);

  // 自动保存到本地存储
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 复制分享链接
  const copyShareLink = async () => {
    const url = encodeStateToURL(state, compareState);
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (e) {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // 输入验证
  const validationError = useMemo(() => validateInputs(state), [state]);

  // 计算结果（使用阶梯计费 + 碳排放惩罚系数）
  const calculateResults = (s: ExtendedState) => {
    const hw = HARDWARE_OPTIONS.find(h => h.value === s.hardware);
    const power = hw ? hw.power : 200;
    const kwh = (power * s.count * s.hours * s.pue) / 1000;
    const rawCo2 = kwh * 0.475;
    const co2 = carbonPenalty(rawCo2);
    const co2HasPenalty = co2 > rawCo2;
    
    // API 成本计算（阶梯计费）
    const tokens = s.tokensPerDay || 100000;
    const pricing = API_PRICING[s.apiModel as keyof typeof API_PRICING] || API_PRICING['deepseek-v3'];
    const dailyCost = tieredCost(tokens, pricing.input, pricing.output);
    const monthlyCost = dailyCost * 30;
    
    // 判断是否触发了阶梯折扣
    const linearCost = (tokens / 1_000_000) * ((pricing.input + pricing.output) / 2);
    const hasDiscount = dailyCost < linearCost * 0.99;
    const discountPct = hasDiscount ? ((1 - dailyCost / linearCost) * 100).toFixed(0) : null;
    
    return { power, kwh, co2, rawCo2, co2HasPenalty, dailyCost, monthlyCost, tokens, pricing, hasDiscount, discountPct };
  };

  const results = useMemo(() => calculateResults(state), [state]);
  const compareResults = useMemo(() => compareState ? calculateResults(compareState) : null, [compareState]);

  // 敏感性分析数据：Token 增长趋势 + 盈亏平衡点
  const sensitivityData = useMemo(() => {
    if (!compareState) return [];
    const pricingA = API_PRICING[state.apiModel as keyof typeof API_PRICING] || API_PRICING['deepseek-v3'];
    const pricingB = API_PRICING[compareState.apiModel as keyof typeof API_PRICING] || API_PRICING['gpt-4o'];
    const nameA = pricingA.name;
    const nameB = pricingB.name;

    const points: { tokens: string; tokensRaw: number; A: number; B: number; [key: string]: any }[] = [];
    const tokenSteps = [10000, 50000, 100000, 250000, 500000, 1000000, 2000000, 5000000, 10000000, 20000000];
    
    for (const t of tokenSteps) {
      const costA = tieredCost(t, pricingA.input, pricingA.output) * 30;
      const costB = tieredCost(t, pricingB.input, pricingB.output) * 30;
      points.push({
        tokens: t >= 1000000 ? `${t / 1000000}M` : `${t / 1000}K`,
        tokensRaw: t,
        A: parseFloat(costA.toFixed(2)),
        B: parseFloat(costB.toFixed(2)),
      });
    }
    return points;
  }, [state.apiModel, compareState?.apiModel]);

  // 盈亏平衡点计算
  const breakEvenPoint = useMemo(() => {
    if (!compareState || sensitivityData.length < 2) return null;
    // 对于不同定价的两个模型，找到成本交叉点
    for (let i = 1; i < sensitivityData.length; i++) {
      const prev = sensitivityData[i - 1];
      const curr = sensitivityData[i];
      const prevDiff = prev.A - prev.B;
      const currDiff = curr.A - curr.B;
      if (prevDiff * currDiff < 0) {
        // 线性插值
        const ratio = Math.abs(prevDiff) / (Math.abs(prevDiff) + Math.abs(currDiff));
        const breakTokens = prev.tokensRaw + ratio * (curr.tokensRaw - prev.tokensRaw);
        const breakCost = prev.A + ratio * (curr.A - prev.A);
        return { tokens: breakTokens, cost: breakCost };
      }
    }
    return null;
  }, [sensitivityData, compareState]);

  // 公式实时验证
  const formulaVars = useMemo(() => ({
    tokens: state.tokensPerDay || 100000,
    input_price: results.pricing.input,
    output_price: results.pricing.output,
    gpu_count: state.count,
    hours: state.hours,
    pue: state.pue,
    power: results.power,
  }), [state, results]);

  const formulaValidation = useMemo(
    () => validateFormula(customFormula, formulaVars),
    [customFormula, formulaVars]
  );

  // 插入函数到公式输入框
  const insertFunction = (example: string) => {
    setCustomFormula(prev => prev ? `${prev} + ${example}` : example);
    formulaInputRef.current?.focus();
  };

  // 打印报告
  const printReport = () => {
    window.print();
  };

  const handleChange = (field: keyof ExtendedState, value: string | number) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  // 应用模板
  const applyTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    const newState: ExtendedState = {
      ...template.config,
      tokensPerDay: (template as any).tokensPerDay || 100000,
      apiModel: (template as any).apiModel || 'deepseek-v3'
    };
    setState(newState);
    
    // 如果模板有对比模型，自动启用对比模式
    if ((template as any).compareModel) {
      setCompareState({
        ...template.config,
        tokensPerDay: (template as any).tokensPerDay || 100000,
        apiModel: (template as any).compareModel
      });
      setShowChart('compare');
    }
    setShowTemplates(false);
  };

  // 启用对比模式
  const enableCompareMode = () => {
    setCompareState({ ...state, apiModel: 'gpt-4o' });
    setShowChart('compare');
  };

  // 重置为默认值（DeepSeek 主推案例）
  const resetToDefault = () => {
    setState(getDefaultState());
    setCompareState(getDefaultCompareState());
    setShowChart('compare');
  };

  // 导出为 JSON（预埋 Decision Trace 数据结构，为未来智能路由做准备）
  const exportConfig = () => {
    // 构建候选模型评分（基于月成本倒数归一化）
    const candidateModels = Object.keys(API_PRICING) as (keyof typeof API_PRICING)[];
    const costs = candidateModels.map(k => {
      const p = API_PRICING[k];
      return (((state.tokensPerDay || 100000) / 1000000) * ((p.input + p.output) / 2)) * 30;
    });
    const maxCost = Math.max(...costs);
    const scoring: Record<string, number> = {};
    candidateModels.forEach((k, i) => {
      scoring[k] = maxCost > 0 ? parseFloat((1 - costs[i] / maxCost).toFixed(3)) : 0;
    });

    const exportData = {
      schema_version: '0.2.0',

      // 1️⃣ Task Context
      task_context: {
        task_type: 'cost_comparison',
        hardware: state.hardware,
        gpu_count: state.count,
        runtime_hours: state.hours,
        pue: state.pue,
        tokens_per_day: state.tokensPerDay || 100000,
        constraints: {
          max_monthly_budget: null,
          max_latency_ms: null
        }
      },

      // 2️⃣ Decision Trace
      decision_trace: {
        candidate_models: candidateModels,
        scoring,
        selected_model: state.apiModel || 'deepseek-v3',
        compare_model: compareState?.apiModel || null,
        policy_version: 'manual_v1'
      },

      // 3️⃣ Outcome
      outcome: {
        plan_a: {
          model: state.apiModel,
          daily_cost_usd: results.dailyCost,
          monthly_cost_usd: results.monthlyCost,
          co2_kg_per_day: results.co2,
          kwh_per_day: results.kwh
        },
        plan_b: compareState && compareResults ? {
          model: compareState.apiModel,
          daily_cost_usd: compareResults.dailyCost,
          monthly_cost_usd: compareResults.monthlyCost,
          co2_kg_per_day: compareResults.co2,
          kwh_per_day: compareResults.kwh
        } : null,
        savings: compareResults ? {
          monthly_usd: Math.abs(results.monthlyCost - compareResults.monthlyCost),
          percentage: compareResults.monthlyCost > 0 
            ? parseFloat(((1 - results.monthlyCost / compareResults.monthlyCost) * 100).toFixed(1))
            : 0
        } : null,
        user_feedback: null
      },

      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecocompute-trace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入 JSON
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.config) setState(data.config);
        if (data.compareConfig) setCompareState(data.compareConfig);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // 生成 AI 解释（纯文本，不含 Markdown 语法）
  const generateInsight = (): { main: string; detail: string } => {
    if (compareState && compareResults) {
      const savings = ((compareResults.monthlyCost - results.monthlyCost) / compareResults.monthlyCost * 100).toFixed(0);
      const cheaper = results.monthlyCost < compareResults.monthlyCost ? state.apiModel : compareState.apiModel;
      const diff = Math.abs(results.monthlyCost - compareResults.monthlyCost).toFixed(2);
      return {
        main: `Using ${API_PRICING[cheaper as keyof typeof API_PRICING]?.name || cheaper} saves ${formatCurrency(Number(diff))}/month (${Math.abs(Number(savings))}% less).`,
        detail: `At ${formatNumber(state.tokensPerDay || 0, 'tokens/day')}, the annual savings would be ${formatCurrency(Number(diff) * 12)}. Cost assumes a 50:50 input/output token ratio.`
      };
    }
    
    return {
      main: `Your setup uses ${results.kwh.toFixed(1)} kWh/day, producing ${results.co2.toFixed(2)} kg CO₂.`,
      detail: `API costs: ${formatCurrency(results.dailyCost)}/day (${formatCurrency(results.monthlyCost)}/month). Cost assumes a 50:50 input/output token ratio.`
    };
  };

  // 对比图表数据（硬件相同时不显示 CO₂，因为碳排放只跟硬件有关）
  const sameHardware = compareState?.hardware === state.hardware && compareState?.count === state.count && compareState?.hours === state.hours && compareState?.pue === state.pue;
  const comparisonBarData = compareState ? [
    { 
      name: 'Monthly ($)',
      A: results.monthlyCost,
      B: compareResults?.monthlyCost || 0,
      labelA: API_PRICING[state.apiModel as keyof typeof API_PRICING]?.name || 'Plan A',
      labelB: API_PRICING[compareState.apiModel as keyof typeof API_PRICING]?.name || 'Plan B'
    },
    {
      name: 'Daily ($)',
      A: results.dailyCost,
      B: compareResults?.dailyCost || 0
    },
    ...(!sameHardware ? [{
      name: 'CO₂ (kg)',
      A: results.co2,
      B: compareResults?.co2 || 0
    }] : [])
  ] : [];

  // 饼图数据
  const pieData = [
    { name: 'GPU Power', value: results.power * state.count, color: '#10b981' },
    { name: 'PUE Overhead', value: results.power * state.count * (state.pue - 1), color: '#f59e0b' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-center sm:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
            <Leaf className="w-6 h-6 text-eco-500" />
            AI Cost & Carbon Calculator
          </h2>
          <p className="text-xs text-slate-500 mt-1">Compare API costs, energy usage, and carbon footprint</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <div className="relative" ref={templateDropdownRef}>
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
            </button>
            
            {showTemplates && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="p-2 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">Quick Start Templates</span>
                </div>
                {PRESET_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full p-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div className="font-medium text-sm text-slate-800">{template.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{template.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {!compareState && (
            <button 
              onClick={enableCompareMode}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          )}
          
          <button 
            onClick={copyShareLink}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${linkCopied ? 'bg-eco-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
            title="Copy share link"
          >
            {linkCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{linkCopied ? 'Copied!' : 'Share'}</span>
          </button>

          <button onClick={exportConfig} className="p-2 bg-eco-50 text-eco-700 rounded-lg hover:bg-eco-100 print:hidden" title="Export JSON">
            <Download className="w-4 h-4" />
          </button>
          
          <button onClick={printReport} className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 print:hidden" title="Print Report / Save as PDF">
            <Printer className="w-4 h-4" />
          </button>
          
          <label className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer" title="Import JSON">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={importConfig} className="hidden" />
          </label>
          
          <button onClick={resetToDefault} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Config Panel - Collapsible on mobile */}
        <div className={`lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${configCollapsed ? 'max-h-14' : ''}`}>
          <button 
            onClick={() => setConfigCollapsed(!configCollapsed)}
            className="w-full p-4 flex items-center justify-between lg:hidden bg-slate-50 border-b border-slate-100"
          >
            <span className="font-semibold text-slate-700">Configuration</span>
            {configCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          <div className={`p-4 space-y-4 ${configCollapsed ? 'hidden lg:block' : ''}`}>
            {/* API Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">API Model (Plan A)</label>
              <select 
                value={state.apiModel || 'deepseek-v3'}
                onChange={(e) => handleChange('apiModel', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                {Object.entries(API_PRICING).map(([key, val]) => (
                  <option key={key} value={key}>{val.name} (${val.input}/${val.output})</option>
                ))}
              </select>
            </div>

            {/* Compare Model */}
            {compareState && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Compare Model (Plan B)</label>
                  <button onClick={() => setCompareState(null)} className="text-slate-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <select 
                  value={compareState.apiModel || 'gpt-4o'}
                  onChange={(e) => setCompareState(prev => prev ? {...prev, apiModel: e.target.value} : null)}
                  className="w-full p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-sm"
                >
                  {Object.entries(API_PRICING).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tokens per day — Slider + Number Input 双向绑定 */}
            <SliderInput
              label="Tokens/Day"
              value={state.tokensPerDay || 100000}
              onChange={(v) => handleChange('tokensPerDay', v)}
              min={1000}
              max={50000000}
              step={1000}
              unit="tok"
              formatDisplay={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M tokens` : `${(v/1000).toFixed(0)}K tokens`}
              presets={[
                { label: '100K', value: 100000 },
                { label: '500K', value: 500000 },
                { label: '1M', value: 1000000 },
                { label: '5M', value: 5000000 },
                { label: '10M', value: 10000000 },
              ]}
            />

            {/* Hardware */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Hardware</label>
              <select 
                value={state.hardware}
                onChange={(e) => handleChange('hardware', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                {HARDWARE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* GPUs — Slider + Input */}
            <SliderInput
              label="GPU Count"
              value={state.count}
              onChange={(v) => handleChange('count', Math.round(v))}
              min={1}
              max={64}
              step={1}
              unit="GPUs"
            />

            {/* Hours — Slider + Input */}
            <SliderInput
              label="Hours/Day"
              value={state.hours}
              onChange={(v) => handleChange('hours', v)}
              min={0.5}
              max={24}
              step={0.5}
              unit="hrs"
              presets={[
                { label: '4h', value: 4 },
                { label: '8h', value: 8 },
                { label: '16h', value: 16 },
                { label: '24h', value: 24 },
              ]}
            />

            {/* PUE — Slider + Input */}
            <SliderInput
              label="PUE (Power Usage Effectiveness)"
              value={state.pue}
              onChange={(v) => handleChange('pue', parseFloat(v.toFixed(1)))}
              min={1.0}
              max={2.5}
              step={0.1}
              unit=""
              formatDisplay={(v) => `PUE ${v.toFixed(1)}`}
              presets={[
                { label: 'Best (1.1)', value: 1.1 },
                { label: 'Avg (1.3)', value: 1.3 },
                { label: 'Poor (1.8)', value: 1.8 },
              ]}
            />

            {/* Validation Error */}
            {validationError && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-700">{validationError.message}</span>
              </div>
            )}

            {/* Tiered Pricing Info */}
            {results.hasDiscount && (
              <div className="flex items-center gap-2 p-2.5 bg-eco-50 border border-eco-200 rounded-lg">
                <Sparkles className="w-4 h-4 text-eco-600 flex-shrink-0" />
                <span className="text-xs text-eco-800">Volume discount applied: ~{results.discountPct}% off (tiered pricing for &gt;5M tokens/day)</span>
              </div>
            )}

            {/* Custom Formula with Syntax Checker */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3 print:hidden">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  Custom Formula
                </label>
                <button
                  onClick={() => setShowCheatSheet(!showCheatSheet)}
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-colors ${showCheatSheet ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  <HelpCircle className="w-3 h-3" />
                  Cheat Sheet
                </button>
              </div>

              {/* Cheat Sheet Panel */}
              {showCheatSheet && (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-2.5 space-y-2 animate-fade-in">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Variables (click to insert)</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(FORMULA_VARS).map(([name, desc]) => (
                      <button
                        key={name}
                        onClick={() => { setCustomFormula(prev => prev ? `${prev} ${name}` : name); formulaInputRef.current?.focus(); }}
                        className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-indigo-700 hover:bg-indigo-50 transition-colors"
                        title={desc}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Functions (click to insert example)</div>
                  <div className="space-y-1">
                    {FORMULA_FUNCTIONS.map(fn => (
                      <button
                        key={fn.name}
                        onClick={() => insertFunction(fn.example)}
                        className="w-full text-left px-2 py-1 bg-white border border-slate-200 rounded hover:bg-indigo-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-700">{fn.syntax}</span>
                          <span className="text-[9px] text-slate-400">{fn.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Formula Input */}
              <textarea
                ref={formulaInputRef}
                value={customFormula}
                onChange={(e) => setCustomFormula(e.target.value)}
                placeholder="e.g. tokens * input_price / 1000000 * IF(tokens > 5000000, 0.9, 1.0)"
                rows={2}
                className={`w-full p-2 text-xs font-mono rounded-lg border transition-colors resize-none ${
                  customFormula && !formulaValidation.valid
                    ? 'bg-red-50 border-red-300 text-red-800 focus:ring-red-400'
                    : customFormula && formulaValidation.valid && formulaValidation.result !== undefined
                    ? 'bg-eco-50 border-eco-300 text-eco-800 focus:ring-eco-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-indigo-400'
                } focus:outline-none focus:ring-1`}
              />

              {/* Formula Feedback */}
              {customFormula && !formulaValidation.valid && (
                <div className="flex items-start gap-1.5 px-2 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-red-700 leading-tight">{formulaValidation.error}</span>
                </div>
              )}
              {customFormula && formulaValidation.valid && formulaValidation.result !== undefined && (
                <div className="flex items-center justify-between px-2 py-1.5 bg-eco-50 border border-eco-200 rounded-lg">
                  <span className="text-[11px] text-eco-700">Formula result:</span>
                  <span className="text-sm font-bold font-mono text-eco-800">{formatCurrency(formulaValidation.result)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Cost Cards with formatted values */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-eco-50 to-emerald-50 p-4 rounded-xl border border-eco-100">
              <div className="text-xs text-eco-600 font-medium">Daily Cost</div>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(results.dailyCost)}</div>
              <div className="text-xs text-slate-500">{results.pricing.name}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
              <div className="text-xs text-purple-600 font-medium">Monthly Cost</div>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(results.monthlyCost)}</div>
              <div className="text-xs text-slate-500">{formatNumber(state.tokensPerDay || 0, 'tokens/day')}</div>
            </div>
          </div>

          {/* Compare Results with savings indicator */}
          {compareState && compareResults && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Plan B Daily</div>
                  <div className="text-xl font-bold text-slate-700">{formatCurrency(compareResults.dailyCost)}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Plan B Monthly</div>
                  <div className="text-xl font-bold text-slate-700">{formatCurrency(compareResults.monthlyCost)}</div>
                </div>
              </div>
              {/* Savings Badge */}
              {results.monthlyCost !== compareResults.monthlyCost && (
                <div className={`p-3 rounded-xl text-center text-sm font-medium ${results.monthlyCost < compareResults.monthlyCost ? 'bg-eco-100 text-eco-800' : 'bg-red-100 text-red-800'}`}>
                  {results.monthlyCost < compareResults.monthlyCost 
                    ? `🎉 Plan A saves ${formatCurrency(compareResults.monthlyCost - results.monthlyCost)}/month (${((1 - results.monthlyCost / compareResults.monthlyCost) * 100).toFixed(0)}% less)`
                    : `⚠️ Plan B saves ${formatCurrency(results.monthlyCost - compareResults.monthlyCost)}/month`
                  }
                </div>
              )}
            </div>
          )}

          {/* Carbon Stats with units */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="w-5 h-5 text-eco-500" />
              <span className="font-semibold text-slate-700">Carbon Footprint</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-slate-800">{results.co2.toFixed(1)}<span className="text-xs font-normal text-slate-500 ml-1">kg</span></div>
                <div className="text-xs text-slate-500">CO₂/day</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{results.kwh.toFixed(1)}<span className="text-xs font-normal text-slate-500 ml-1">kWh</span></div>
                <div className="text-xs text-slate-500">Energy/day</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{Math.ceil(results.co2 * 4)}<span className="text-xs font-normal text-slate-500 ml-1">km</span></div>
                <div className="text-xs text-slate-500">Car equiv.</div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          {(() => { const insight = generateInsight(); return (
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-900">💡 {insight.main}</p>
                <p className="text-xs text-indigo-700 mt-1">{insight.detail}</p>
              </div>
            </div>
          </div>
          ); })()}
        </div>

        {/* Chart Panel */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Visualization</span>
            <div className="flex gap-1">
              <button 
                onClick={() => setShowChart('compare')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${showChart === 'compare' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Compare
              </button>
              <button 
                onClick={() => setShowChart('bar')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${showChart === 'bar' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Trend</span>
              </button>
              <button 
                onClick={() => setShowChart('pie')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${showChart === 'pie' ? 'bg-eco-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Pie
              </button>
            </div>
          </div>
          
          <div className="h-56 md:h-72">
            {/* Bar Compare Chart */}
            {showChart === 'compare' && compareState && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonBarData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(v < 1 ? 2 : 0)}`} label={{ value: 'USD', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis dataKey="name" type="category" width={75} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(4)}`, '']} />
                  <Legend />
                  <Bar dataKey="A" name={API_PRICING[state.apiModel as keyof typeof API_PRICING]?.name || 'Plan A'} fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="B" name={API_PRICING[compareState.apiModel as keyof typeof API_PRICING]?.name || 'Plan B'} fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {showChart === 'compare' && !compareState && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <GitCompare className="w-10 h-10 mb-2 opacity-50" />
                <p>Click "Compare" button above</p>
                <p className="text-xs mt-1">to enable comparison mode</p>
              </div>
            )}

            {/* Sensitivity Analysis — Trend Line + Breakeven */}
            {showChart === 'bar' && compareState && sensitivityData.length > 0 && (
              <div className="h-full flex flex-col">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensitivityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="tokens" tick={{ fontSize: 9 }} label={{ value: 'Tokens/Day', position: 'insideBottomRight', offset: -5, fontSize: 9, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v.toFixed(0)}`} label={{ value: 'Monthly Cost (USD)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 9, fill: '#94a3b8' }} />
                    <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}/mo`, '']} labelFormatter={(label) => `${label} tokens/day`} />
                    <Legend />
                    <Line type="monotone" dataKey="A" name={API_PRICING[state.apiModel as keyof typeof API_PRICING]?.name || 'Plan A'} stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="B" name={API_PRICING[compareState.apiModel as keyof typeof API_PRICING]?.name || 'Plan B'} stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                    {breakEvenPoint && (
                      <ReferenceLine x={breakEvenPoint.tokens >= 1000000 ? `${breakEvenPoint.tokens / 1000000}M` : `${breakEvenPoint.tokens / 1000}K`} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Break-even', position: 'top', fontSize: 10, fill: '#ef4444' }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
                {breakEvenPoint && (
                  <div className="text-center mt-1 px-2 py-1 bg-red-50 rounded-lg">
                    <span className="text-[10px] text-red-700 font-medium">
                      Break-even at {breakEvenPoint.tokens >= 1000000 ? `${(breakEvenPoint.tokens/1000000).toFixed(1)}M` : `${(breakEvenPoint.tokens/1000).toFixed(0)}K`} tokens/day (${formatCurrency(breakEvenPoint.cost)}/mo)
                    </span>
                  </div>
                )}
                {!breakEvenPoint && (
                  <div className="text-center mt-1 px-2 py-1 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500">No break-even point — one plan is always cheaper across all volumes</span>
                  </div>
                )}
              </div>
            )}

            {showChart === 'bar' && !compareState && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <TrendingUp className="w-10 h-10 mb-2 opacity-50" />
                <p>Enable Compare mode to see</p>
                <p className="text-xs mt-1">sensitivity analysis & break-even</p>
              </div>
            )}
            
            {/* Pie Chart with units */}
            {showChart === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(0)} W`, 'Power']} />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {!showChart && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <div className="text-4xl mb-2">📊</div>
                <p>Select a chart type</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carbon Penalty Notice */}
      {results.co2HasPenalty && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <span className="text-sm font-medium text-amber-800">Carbon penalty applied</span>
            <p className="text-xs text-amber-700 mt-0.5">
              Raw CO₂: {results.rawCo2.toFixed(1)} kg/day → Adjusted: {results.co2.toFixed(1)} kg/day. 
              Emissions exceeding {results.rawCo2 > 500 ? '500' : '100'} kg/day incur a {results.rawCo2 > 500 ? '1.5×' : '1.2×'} carbon tax multiplier.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};