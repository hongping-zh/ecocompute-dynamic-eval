# EcoCompute v2.0 Architecture Roadmap

> 智能路由（Smart Router）架构规划
> Created: 2026-02-06

---

## 当前状态 (v1.x)

- 纯前端静态计算器
- 手动选择模型对比
- 导出 JSON 已预埋 `decision_trace` 数据结构（schema v0.2.0）
- `policy_version: "manual_v1"` — 人工选择阶段

---

## Step 1: Unified Execution API

**目标**: 统一调用入口，消除 provider 耦合

```python
# ✅ 统一入口
execute(
    task,
    constraints={
        "max_cost": 0.02,
        "max_latency": 2000
    },
    policy="efficiency_policy"
)

# ❌ 不要这样
call_openai()
call_claude()
call_deepseek()
```

**关键设计**:
- `task` — 包含 prompt、task_type、metadata
- `constraints` — 成本上限、延迟上限、质量下限
- `policy` — 路由策略（efficiency / quality / balanced / custom）
- 返回统一的 `ExecutionResult` 对象

**优先级**: 🔴 高 — 这是所有后续功能的基础

---

## Step 2: Provider Adapter

**目标**: 插件化 provider，新增模型无需修改路由核心

```
providers/
    base.py          # 抽象基类
    openai.py        # GPT-4o, GPT-4o-mini
    anthropic.py     # Claude 3.5 Sonnet
    deepseek.py      # DeepSeek-V3, R1
    google.py        # Gemini 1.5/2.0 Flash
    local.py         # 本地部署模型 (vLLM / Ollama)
```

```python
class Provider:
    name: str
    models: list[str]

    def run(self, task: Task) -> ProviderResult:
        """统一接口，返回标准化结果"""
        pass

    def health_check(self) -> bool:
        pass

    def get_pricing(self, model: str) -> PricingInfo:
        pass
```

**关键设计**:
- 每个 adapter 实现统一 `Provider` 接口
- 自动注册机制（放入 `providers/` 目录即可被发现）
- 内置 fallback：主 provider 失败时自动切换备选
- 新增模型 = 新增一个 `.py` 文件，零修改路由核心

**优先级**: 🔴 高

---

## Step 3: Capability Registry（高级关键）

**目标**: 路由不仅看历史成本，还能基于模型能力推理

```yaml
model_capabilities:
  deepseek-v3:
    coding_score: 0.88
    reasoning_score: 0.82
    creative_score: 0.75
    latency_profile: "fast"      # fast / medium / slow
    energy_profile: "efficient"  # efficient / moderate / heavy
    max_context: 128000
    supports_tools: true

  gpt-4o:
    coding_score: 0.92
    reasoning_score: 0.90
    creative_score: 0.88
    latency_profile: "medium"
    energy_profile: "heavy"
    max_context: 128000
    supports_tools: true

  deepseek-v3-lite:
    coding_score: 0.72
    reasoning_score: 0.68
    creative_score: 0.65
    latency_profile: "fast"
    energy_profile: "efficient"
    max_context: 64000
    supports_tools: false
```

**路由决策流程**:

```
Task 进入
  → 分析 task_type (coding / reasoning / creative / general)
  → 查询 Capability Registry 筛选合格模型
  → 应用 constraints 过滤（成本、延迟）
  → 按 policy 排序
  → 选择最优模型
  → 执行 & 记录 Decision Trace
```

**优先级**: 🟡 中 — 依赖 Step 1 & 2 完成后

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

## 里程碑

| 版本 | 内容 | 状态 |
|------|------|------|
| v1.0 | 静态计算器 + 对比模式 | ✅ 已上线 |
| v1.1 | Decision Trace 数据格式预埋 | ✅ 已完成 |
| v2.0 | Unified API + Provider Adapter | 📋 规划中 |
| v2.1 | Capability Registry + 自动路由 | 📋 规划中 |
| v3.0 | 数据驱动的 ML routing policy | 📋 远期 |
