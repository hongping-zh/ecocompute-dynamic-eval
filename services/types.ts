// ============================================================
// EcoCompute Execution Control Plane — Type Definitions
// Stateless function execution, not API calls.
// ============================================================

/** Task types the engine can handle */
export type TaskType = 
  | 'analyze_leaderboard'
  | 'chat_with_image'
  | 'extract_text'
  | 'summarize'
  | 'general';

/** Execution objective — what to optimize for */
export type Objective = 
  | 'maximize_quality'
  | 'minimize_cost'
  | 'minimize_latency'
  | 'minimize_carbon'
  | 'balanced';

/** Provider identifiers */
export type ProviderId = 'demo' | 'gemini' | 'openai' | 'groq';

/** Constraints for execution */
export interface ExecutionConstraints {
  max_cost_usd?: number;
  max_latency_ms?: number;
  max_tokens?: number;
  preferred_provider?: ProviderId;
  fallback_providers?: ProviderId[];
}

/** Input to the execute() function */
export interface ExecutionInput {
  task_type: TaskType;
  prompt: string;
  context?: Record<string, unknown>;
  image_data?: string;  // base64 for vision tasks
}

/** Full request to execute() */
export interface ExecutionRequest {
  input: ExecutionInput;
  objective: Objective;
  constraints: ExecutionConstraints;
}

/** Routing decision made by the engine */
export interface RoutingDecision {
  selected_provider: ProviderId;
  selected_model: string;
  reason: string;
  candidates_scored: Record<string, number>;
  policy_version: string;
}

/** Result from a provider */
export interface ProviderResult {
  text: string;
  model: string;
  provider: ProviderId;
  latency_ms: number;
  estimated_cost_usd: number;
  token_count?: number;
}

/** Full execution result */
export interface ExecutionResult {
  success: boolean;
  data: ProviderResult | null;
  error?: string;
  routing: RoutingDecision;
  trace: ExecutionTrace;
}

/** Execution trace for the decision dataset */
export interface ExecutionTrace {
  trace_id: string;
  timestamp: string;
  request: ExecutionRequest;
  routing: RoutingDecision;
  outcome: {
    success: boolean;
    latency_ms: number;
    cost_usd: number;
    provider: ProviderId;
    model: string;
  };
}

/** Provider capability profile */
export interface ProviderCapability {
  provider: ProviderId;
  model: string;
  quality_score: number;       // 0-1
  cost_per_1k_tokens: number;  // USD
  avg_latency_ms: number;
  supports_vision: boolean;
  supports_tools: boolean;
  energy_profile: 'efficient' | 'moderate' | 'heavy';
  task_strengths: TaskType[];
}

/** Unified provider interface */
export interface Provider {
  id: ProviderId;
  name: string;
  capabilities: ProviderCapability[];
  run(prompt: string, apiKey: string, model?: string): Promise<ProviderResult>;
  healthCheck(): Promise<boolean>;
}
