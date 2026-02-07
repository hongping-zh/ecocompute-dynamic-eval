// ============================================================
// EcoCompute Execution Control Plane
// 
// Stateless function execution — not API calls.
// System internally handles: routing → policy → provider call
// ============================================================

import {
  ExecutionRequest,
  ExecutionResult,
  ExecutionTrace,
  RoutingDecision,
  ProviderResult,
  ProviderId,
  Objective,
  TaskType,
  ProviderCapability,
  ExecutionConstraints,
} from './types';
import { getAllProviders, getProvider } from './providers';

// ---- Trace ID generator ----
const generateTraceId = (): string =>
  `eco_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ---- Execution trace log (in-memory, exportable) ----
const traceLog: ExecutionTrace[] = [];

export const getTraceLog = (): ExecutionTrace[] => [...traceLog];
export const clearTraceLog = (): void => { traceLog.length = 0; };

// ---- Policy: score a candidate for a given objective ----
const scoreCandidate = (
  cap: ProviderCapability,
  objective: Objective,
  taskType: TaskType,
): number => {
  // Base: task strength bonus
  const taskBonus = cap.task_strengths.includes(taskType) ? 0.15 : 0;

  // Objective-weighted scoring
  const weights = {
    maximize_quality:  { quality: 0.6, cost: 0.1, latency: 0.1, energy: 0.2 },
    minimize_cost:     { quality: 0.2, cost: 0.5, latency: 0.1, energy: 0.2 },
    minimize_latency:  { quality: 0.2, cost: 0.1, latency: 0.5, energy: 0.2 },
    minimize_carbon:   { quality: 0.15, cost: 0.1, latency: 0.05, energy: 0.7 },
    balanced:          { quality: 0.3, cost: 0.25, latency: 0.2, energy: 0.25 },
  };

  const w = weights[objective];

  // Normalize: higher is better for all
  const qualityScore = cap.quality_score;
  const costScore = 1 - Math.min(cap.cost_per_1k_tokens / 0.01, 1); // cheaper = higher
  const latencyScore = 1 - Math.min(cap.avg_latency_ms / 3000, 1);  // faster = higher
  const energyScore = cap.energy_profile === 'efficient' ? 1.0 
                    : cap.energy_profile === 'moderate' ? 0.6 
                    : 0.3;

  return (
    w.quality * qualityScore +
    w.cost * costScore +
    w.latency * latencyScore +
    w.energy * energyScore +
    taskBonus
  );
};

// ---- Routing: select best provider based on policy + constraints ----
const route = (
  request: ExecutionRequest,
  apiKey: string,
): RoutingDecision => {
  const { objective, constraints, input } = request;
  const providers = getAllProviders();

  // Collect all candidate capabilities
  const candidates: { provider: ProviderId; model: string; score: number; cap: ProviderCapability }[] = [];

  for (const provider of providers) {
    // Skip providers that need API key but don't have one (except demo)
    if (provider.id !== 'demo' && !apiKey) continue;

    // If user specified a preferred provider, only consider that + fallbacks
    if (constraints.preferred_provider) {
      const allowed = [constraints.preferred_provider, ...(constraints.fallback_providers || ['demo'])];
      if (!allowed.includes(provider.id)) continue;
    }

    for (const cap of provider.capabilities) {
      // Vision task filter
      if ((input.task_type === 'chat_with_image' || input.task_type === 'extract_text') && !cap.supports_vision) {
        continue;
      }

      // Cost constraint filter
      if (constraints.max_cost_usd !== undefined) {
        const estimatedTokens = Math.ceil(input.prompt.length / 4) + 200;
        const estimatedCost = (estimatedTokens / 1000) * cap.cost_per_1k_tokens;
        if (estimatedCost > constraints.max_cost_usd) continue;
      }

      // Latency constraint filter
      if (constraints.max_latency_ms !== undefined && cap.avg_latency_ms > constraints.max_latency_ms) {
        continue;
      }

      const score = scoreCandidate(cap, objective, input.task_type);
      candidates.push({ provider: provider.id, model: cap.model, score, cap });
    }
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Build scoring map
  const candidates_scored: Record<string, number> = {};
  candidates.forEach(c => {
    candidates_scored[`${c.provider}/${c.model}`] = parseFloat(c.score.toFixed(3));
  });

  // Select best (fallback to demo)
  const best = candidates[0] || { provider: 'demo' as ProviderId, model: 'demo-v1', score: 0 };

  return {
    selected_provider: best.provider,
    selected_model: best.model,
    reason: candidates.length > 0
      ? `Selected ${best.provider}/${best.model} (score: ${best.score.toFixed(3)}) from ${candidates.length} candidates for objective "${objective}"`
      : 'No eligible candidates found, falling back to demo mode',
    candidates_scored,
    policy_version: 'v0.3',
  };
};

// ============================================================
// execute() — The unified stateless entry point
// ============================================================
export const execute = async (
  request: ExecutionRequest,
  apiKey: string = '',
): Promise<ExecutionResult> => {
  const traceId = generateTraceId();
  const startTime = Date.now();

  // 1. Route: select provider + model
  const routing = route(request, apiKey);

  // 2. Execute: call the selected provider
  let result: ProviderResult | null = null;
  let error: string | undefined;

  try {
    const provider = getProvider(routing.selected_provider);
    if (!provider) throw new Error(`Provider "${routing.selected_provider}" not found in registry`);

    result = await provider.run(request.input.prompt, apiKey, routing.selected_model);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown execution error';

    // 3. Fallback: try demo if primary fails
    if (routing.selected_provider !== 'demo') {
      try {
        const demoFallback = getProvider('demo');
        if (demoFallback) {
          result = await demoFallback.run(request.input.prompt, '', 'demo-v1');
          result.text = `[Fallback] ${result.text} (Original error: ${error})`;
          error = undefined;
        }
      } catch {
        // Fallback also failed, keep original error
      }
    }
  }

  const totalLatency = Date.now() - startTime;

  // 4. Record trace
  const trace: ExecutionTrace = {
    trace_id: traceId,
    timestamp: new Date().toISOString(),
    request,
    routing,
    outcome: {
      success: !error,
      latency_ms: totalLatency,
      cost_usd: result?.estimated_cost_usd || 0,
      provider: result?.provider || routing.selected_provider,
      model: result?.model || routing.selected_model,
    },
  };
  traceLog.push(trace);

  return {
    success: !error,
    data: result,
    error,
    routing,
    trace,
  };
};

// ============================================================
// Convenience: export trace log as JSON (for dataset building)
// ============================================================
export const exportTraceDataset = (): string => {
  return JSON.stringify({
    schema_version: '0.3.0',
    exported_at: new Date().toISOString(),
    trace_count: traceLog.length,
    traces: traceLog,
  }, null, 2);
};
