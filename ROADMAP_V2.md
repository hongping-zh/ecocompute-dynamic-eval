# EcoCompute v2.0 Architecture Roadmap

> 智能路由（Smart Router）架构规划
> Created: 2026-02-06

---

## 当前状态 (v1.2) ✅ IMPLEMENTED

- **Execution Control Plane** 已实现 — `execute(input, objective, constraints)`
- **Provider Adapter** 已实现 — `services/providers/` 插件化架构
- **Capability Registry** 已实现 — 每个 provider 声明 `ProviderCapability`
- **Policy-based Routing** 已实现 — 5 种 objective 加权评分
- **Execution Trace** 已实现 — 每次调用自动记录，可导出为 dataset JSON
- **AI Tools FAB** 已实现 — 通过 execute() 统一调度所有 AI 功能
- 导出 JSON 已预埋 `decision_trace` 数据结构（schema v0.3.0）

---

## Step 1: Unified Execution API ✅ DONE

**实现文件**: `services/engine.ts`

```typescript
// Stateless function execution — not API calls
const result = await execute(
  {
    input: { task_type, prompt, context },
    objective: 'balanced',           // maximize_quality | minimize_cost | minimize_latency | minimize_carbon | balanced
    constraints: {
      preferred_provider: 'gemini',
      fallback_providers: ['demo'],
      max_cost_usd: 0.02,
      max_latency_ms: 2000,
    },
  },
  apiKey,
);
// System internally handles: routing → policy → provider call → trace
```

**已实现**:
- ✅ `execute()` 统一入口，stateless function
- ✅ 5 种 objective 策略（quality / cost / latency / carbon / balanced）
- ✅ 返回 `ExecutionResult` 含 data + routing decision + trace
- ✅ 自动 fallback：主 provider 失败时降级到 demo

---

## Step 2: Provider Adapter ✅ DONE

**实现目录**: `services/providers/`

```
services/providers/
    index.ts         # Registry — getProvider(), getAllProviders()
    demo.ts          # Demo mode (zero cost, simulated)
    gemini.ts        # Google Gemini 2.0 Flash
    openai.ts        # GPT-4o-mini
    groq.ts          # Llama 3.1 8B (ultra-fast)
```

**统一接口** (`services/types.ts`):
```typescript
interface Provider {
  id: ProviderId;
  name: string;
  capabilities: ProviderCapability[];
  run(prompt, apiKey, model?): Promise<ProviderResult>;
  healthCheck(): Promise<boolean>;
}
```

**已实现**:
- ✅ 每个 adapter 实现统一 `Provider` 接口
- ✅ 注册机制：`providers/index.ts` 集中注册
- ✅ 新增模型 = 新增一个 `.ts` 文件 + 注册一行，零修改路由核心
- ✅ 内置 fallback：主 provider 失败时自动切换 demo

---

## Step 3: Capability Registry ✅ DONE

**实现位置**: 每个 provider 的 `capabilities` 数组

```typescript
// 示例：gemini.ts
capabilities: [{
  provider: 'gemini',
  model: 'gemini-2.0-flash',
  quality_score: 0.88,
  cost_per_1k_tokens: 0.00015,
  avg_latency_ms: 800,
  supports_vision: true,
  supports_tools: true,
  energy_profile: 'moderate',
  task_strengths: ['analyze_leaderboard', 'chat_with_image', ...],
}]
```

**路由决策流程** (已实现于 `engine.ts` 的 `route()` 函数):

```
Task 进入
  → 读取 objective (quality/cost/latency/carbon/balanced)
  → 遍历所有 provider capabilities
  → 过滤：vision 支持、成本上限、延迟上限
  → 加权评分：quality × w1 + cost × w2 + latency × w3 + energy × w4 + task_bonus
  → 选择最高分候选
  → 执行 & 自动记录 ExecutionTrace
```

---

## 数据飞轮

```
用户使用 → 导出 Decision Trace JSON
    → 积累数据
    → 训练 routing policy
    → 自动路由 (policy_version: "auto_v1")
    → 更好的选择 → 更多用户
```

当前 v1.x 的每次导出都是一条训练数据，`user_feedback: null` 字段未来可收集用户满意度，形成闭环。

---

## Category Moat

当你拥有 **policy + routing + execution dataset**，你就不是工具。

你是：🔥 **AI Execution Control Plane**。

```
EcoCompute 拥有的护城河：
┌─────────────────────────────────────────┐
│  Policy Engine (5 objectives)           │
│  + Provider Routing (capability-based)  │
│  + Execution Dataset (trace log)        │
│  = AI Execution Control Plane           │
└─────────────────────────────────────────┘
```

---

## 里程碑

| 版本 | 内容 | 状态 |
|------|------|------|
| v1.0 | 静态计算器 + 对比模式 | ✅ 已上线 |
| v1.1 | Decision Trace 数据格式预埋 | ✅ 已完成 |
| v1.2 | Execution Control Plane + Provider Adapter + Capability Registry | ✅ 已完成 |
| v2.0 | ML-driven routing policy (基于 trace dataset 训练) | 📋 下一步 |
| v2.1 | 用户反馈闭环 (user_feedback → policy 更新) | 📋 规划中 |
| v3.0 | 多租户 SaaS + API Gateway | 📋 远期 |
